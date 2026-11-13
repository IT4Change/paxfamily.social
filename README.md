# paxfamily.social

Deployment configuration and brands of [paxfamily.social](https://paxfamily.social), the network of
the PAX Family around the [PAX World Peace Festival](https://pax.family), built on
[ocelot.social](https://github.com/Ocelot-Social-Community/Ocelot-Social).

## Brands

Every folder under `brandings/` is one brand. The images bake all of them, so the network can switch
between them in the admin area (`activeBranding`) or combine them per bucket (`brandingComposition`)
without a rebuild.

| Brand | Contents |
| --- | --- |
| `brandings/paxfamily/` | **Active** (`OCELOT_ACTIVE_BRANDING=paxfamily`). Style of the current pax.family website (cream header, violet logo) plus the network's identity: name, description, organisation, links. |
| `brandings/pax-classic/` | Style only (`theme` + `logos`) of the first pax.family website: violet header, white dove. Meant to be composed with the identity of `paxfamily`: `{"theme": "pax-classic", "logos": "pax-classic"}`. |

Which brand the network renders is deployment configuration, not part of the images:
`OCELOT_ACTIVE_BRANDING` (set for backend, webapp and maintenance in `docker-compose.yml` and
`helmfile/`), until an admin picks another one. The maintenance page is static, so the image holds
one page per brand and serves the one `OCELOT_ACTIVE_BRANDING` names — an admin's choice does not
reach it. `middlewares/` and `data/` are compiled into the backend image, so at most one brand may
ship them.

Build a brand archive locally: `npm run build` inside its folder (writes `dist/`, git-ignored).

## Deployment

`OCELOT_VERSION` in `.env` selects the ocelot.social images the brand images are built on. It is
bound to `multi-brand-repo`, the branch of
[ocelot.social#10912](https://github.com/Ocelot-Social-Community/Ocelot-Social/pull/10912): its images
are the first that bake the `brandings/` layout. Back to `master` once that is merged. The workflow
appends `.env` to `$GITHUB_ENV`, so it holds plain `KEY=value` lines only, no comments.

### Staging: Flux

Staging (`paxfamily.social.stage.ocelot-social.it4c.org`) is deployed by Flux on the cluster, from
`flux/staging/` ([IT4Change/flux](https://github.com/IT4Change/flux), `clusters/staging/`). Nothing
is applied by hand, and no cluster credential is on GitHub.

- **A push to master** builds the images (`publish.yml`), tagged `master-<run number>-<sha7>`. The
  job `roll-out-staging` then commits that tag into `flux/staging/` and tells Flux, which rolls it
  out. Pull before you push: those commits are the workflow's.
- **A change under `flux/`** (values, manifests) is rolled out as it is, without a build.
- **Newer ocelot.social images** on the branch in `.env`: Actions → publish → Run workflow. That
  build gets a higher run number and is rolled out the same way.
- **Reseeding** (wipes the database): once, by listing `reseed.yaml` in
  `flux/staging/kustomization.yaml` and pushing; again, by raising the number in its name. On a
  schedule: `suspend: false` in `flux/staging/seed.yaml`. Right now, with cluster access:
  `scripts/reseed.sh` (`--help`), which runs a Job off the suspended CronJob and follows its log.
- **Secrets** for staging are `flux/staging/*.sops.yaml`, encrypted to the team and the staging
  cluster (`.sops.yaml`). `values.sops.yaml` holds the chart's `secrets.*`.
- **Webhook**: after the tag commit, `publish.yml` tells Flux to look now, if the repo secrets
  `FLUX_WEBHOOK_URL` and `FLUX_WEBHOOK_TOKEN` are set (`flux/staging/receiver.yaml`). Without them
  Flux finds the commit within a minute. The cluster holds no credential for GitHub: the repo is
  public and Flux only reads it.

`helmfile -e default` must not be applied any more: Flux owns the staging releases now and would
undo it.

### Production: helmfile

`helmfile -e production apply`, by hand. E-mail goes out as `noreply@paxfamily.social`, which needs
SPF and DKIM for that domain.
