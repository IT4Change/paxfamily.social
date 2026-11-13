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

A branch tag moves with every push to that branch, but the images here are only rebuilt by a push
to this repo. To build on its newest state without a commit: Actions → publish → Run workflow. The
rebuild replaces the images under the same tag (`sha-<commit of this repo>`), so a running deployment
picks them up by restarting its pods (`pullPolicy: Always`), e.g. `kubectl -n <namespace> rollout
restart deployment`; `helmfile apply` alone sees no change.

`helmfile/` deploys them: `default` is the staging environment, `production` paxfamily.social. There
is no deploy from GitHub: the cluster's credentials do not belong there. A webhook to a receiving
service is meant to trigger it; until that service exists, deploy by hand
(`helmfile -e default apply` / `helmfile -e production apply`). E-mail goes out as
`noreply@paxfamily.social`, which needs SPF and DKIM for that domain.
