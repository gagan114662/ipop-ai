# iPOP.ai Twenty Deployment Notes

This repo currently runs Twenty as the CRM product base for `ipop.ai`.

## Local Production Check

Validated against the upstream production compose stack in `packages/twenty-docker/docker-compose.yml` on 2026-05-18.

Command shape used:

```sh
export TAG=latest
export SERVER_URL=http://localhost:3000
export APP_SECRET=$(openssl rand -base64 32)
export STORAGE_TYPE=local
docker-compose -f packages/twenty-docker/docker-compose.yml up -d
```

Result:

- `twentycrm/twenty:latest`, `postgres:16`, and `redis:latest` pulled successfully.
- Postgres became healthy.
- Redis became healthy.
- The Twenty server container started, ran Nest initialization, and became healthy.
- The worker container started after server health passed.
- Database initialization and instance upgrade commands ran, including migrations through the 2.5 command set.
- `curl http://localhost:3000/healthz` returned HTTP 200.
- `curl -i http://localhost:3000/` returned HTTP 200 and served the React app shell.
- Server logs included `Nest application successfully started`.
- Billing routes were mapped, including `/webhooks/stripe` and `/app/billing/charge`.

The compose file now sets production runtime defaults and uses Twenty's current local storage mount path. It also gives the server a longer healthcheck start period so first-boot migrations do not incorrectly fail the dependent worker.
- The compose file can now run a custom branded image through `TWENTY_IMAGE=...`, used by both the server and worker services.

A dedicated GitHub Actions workflow, `.github/workflows/ipop-production-smoke.yml`, builds this repo's branded `twenty` Docker target, boots it with Postgres/Redis through the production compose stack, checks `/healthz`, and verifies the served app shell contains `iPOP`.

## Required Production Environment

Set these for a production CRM host such as `https://crm.ipop.ai` or `https://app.ipop.ai`:

```env
TWENTY_IMAGE=<pinned-branded-image>
SERVER_URL=https://crm.ipop.ai
APP_SECRET=...
PG_DATABASE_URL=postgres://...
REDIS_URL=redis://...
STORAGE_TYPE=s3
STORAGE_S3_REGION=...
STORAGE_S3_NAME=...
STORAGE_S3_ENDPOINT=...
```

For local-only file storage, `STORAGE_TYPE=local` works, but production should use durable object storage so file uploads survive redeploys and container replacement.

Use a pinned custom image built from this repo's branded source changes for production. The official `twentycrm/twenty:latest` image is useful for upstream runtime smoke checks, but it still serves upstream Twenty metadata such as `<title>Twenty</title>` and `og:title=Twenty`.

## Stripe/Billing

Twenty has built-in billing and Stripe modules in `packages/twenty-server/src/engine/core-modules/billing`. Stripe-related config includes `IS_BILLING_ENABLED`, `BILLING_STRIPE_API_KEY`, and `BILLING_STRIPE_WEBHOOK_SECRET` in the server config layer.

Stripe remains tracked in GitHub issue #3 for this repo. Do not enable billing in production until the live Stripe products, prices, and webhook endpoint are configured.

## Open Blockers

- The official upstream image is runtime-ready but not visibly iPOP-branded. Production should use a pinned image built from this repo and proven by the iPOP Production Smoke workflow.
- Root `ipop.ai` may already have another product surface; prefer a CRM subdomain unless replacing the current site is intentional.
- Live deployment still needs a provider that can host the stateful server, worker, Postgres, Redis, and durable file storage. Fly billing/trial is incomplete, and Railway auth is not currently valid.
- Stripe live billing still needs product/price/webhook configuration and a live webhook smoke test.
