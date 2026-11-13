#!/usr/bin/env bash
# Reseeds one instance now: wipes its database and seeds the demo data.
#
# Runs a Job off the instance's `reseed` CronJob (flux/staging/seed.yaml), which carries the image
# publish.yml last rolled out and the backend's own configuration. The CronJob stays suspended;
# this only borrows its template. Flux does not own the Job (it is not in any kustomization), so it
# neither prunes nor blocks it; the CronJob controller drops it after its history limit.
#
#   scripts/reseed.sh                                # paxfamily-social-staging, current context
#   scripts/reseed.sh -c staging -n paxfamily-social-staging
#   scripts/reseed.sh --images picsum                # SEED_IMAGES for this run only
#   scripts/reseed.sh -y                             # no confirmation (scripts, CI)
#
# Needs kubectl with access to the cluster, and jq when --images is given.
set -euo pipefail

namespace=paxfamily-social-staging
context=
cronjob=reseed
images=
assume_yes=false
follow=true

usage() {
  sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

while [ $# -gt 0 ]; do
  case "$1" in
    -n | --namespace) namespace=$2; shift 2 ;;
    -c | --context) context=$2; shift 2 ;;
    --cronjob) cronjob=$2; shift 2 ;;
    --images) images=$2; shift 2 ;;
    -y | --yes) assume_yes=true; shift ;;
    --no-follow) follow=false; shift ;;
    -h | --help) usage ;;
    *) echo "unknown option: $1" >&2; usage 1 ;;
  esac
done

case "$images" in
  '' | local | picsum) ;;
  *) echo "--images must be local or picsum, not \"$images\"" >&2; exit 1 ;;
esac

kube=(kubectl --namespace "$namespace")
[ -n "$context" ] && kube+=(--context "$context")

shown_context=${context:-$(kubectl config current-context)}

if ! "${kube[@]}" get cronjob "$cronjob" >/dev/null; then
  echo "no CronJob $cronjob in $namespace (context $shown_context)" >&2
  exit 1
fi

# The seed writes what its version knows: run it on the build the backend runs, or the data and the
# code disagree until the next rollout.
seed_image=$("${kube[@]}" get cronjob "$cronjob" \
  -o jsonpath='{.spec.jobTemplate.spec.template.spec.containers[0].image}')
backend_image=$("${kube[@]}" get deployment \
  -l app.kubernetes.io/component=backend -o jsonpath='{.items[0].spec.template.spec.containers[0].image}' \
  2>/dev/null || true)
if [ -z "$backend_image" ]; then
  backend_image=$("${kube[@]}" get deployments \
    -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.template.spec.containers[0].image}{"\n"}{end}' |
    awk '$1 ~ /-backend$/ { print $2; exit }')
fi

echo "context:   $shown_context"
echo "namespace: $namespace"
echo "seed:      $seed_image"
echo "backend:   ${backend_image:-(not found)}"
[ -n "$images" ] && echo "images:    $images"

if [ -n "$backend_image" ] && [ "${seed_image##*:}" != "${backend_image##*:}" ]; then
  echo "warning: the seed and the backend run different tags. Rollout still in progress?" >&2
fi

if ! $assume_yes; then
  echo
  echo "This DELETES every user, post and group in $namespace."
  read -r -p "Type the namespace to go on: " answer
  if [ "$answer" != "$namespace" ]; then
    echo "aborted"
    exit 1
  fi
fi

job="reseed-manual-$(date +%Y%m%d-%H%M%S)"

if [ -n "$images" ]; then
  "${kube[@]}" create job "$job" --from "cronjob/$cronjob" --dry-run=client -o json |
    jq --arg images "$images" \
      '.spec.template.spec.containers[0].env += [{name: "SEED_IMAGES", value: $images}]' |
    "${kube[@]}" create -f -
else
  "${kube[@]}" create job "$job" --from "cronjob/$cronjob"
fi

$follow || { echo "started job/$job"; exit 0; }

echo "waiting for the pod of job/$job …"
"${kube[@]}" wait --for=condition=Ready pod -l "job-name=$job" --timeout=10m >/dev/null ||
  "${kube[@]}" get pods -l "job-name=$job"
"${kube[@]}" logs -f "job/$job" || true

# The log ends when the container does; the Job says whether it succeeded.
for _ in $(seq 1 30); do
  if [ "$("${kube[@]}" get job "$job" -o jsonpath='{.status.succeeded}')" = 1 ]; then
    echo "job/$job succeeded"
    exit 0
  fi
  if [ "$("${kube[@]}" get job "$job" -o jsonpath='{.status.failed}')" = 1 ]; then
    echo "job/$job failed" >&2
    exit 1
  fi
  sleep 2
done
echo "job/$job has not finished; check with: kubectl -n $namespace get job $job" >&2
exit 1
