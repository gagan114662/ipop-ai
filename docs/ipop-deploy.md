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

## Required Production Environment

Set these for a production CRM host such as `https://crm.ipop.ai` or `https://app.ipop.ai`:

```env
TAG=<pinned-twenty-image-tag>
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

The official `twentycrm/twenty:latest` image still serves upstream Twenty metadata such as `<title>Twenty</title>` and `og:title=Twenty`. To make the deployed CRM visibly iPOP-branded, build and publish a custom image from this repo's branded source changes, or configure branding through a supported Twenty runtime setting before launch.

## Stripe/Billing

Twenty has built-in billing and Stripe modules in `packages/twenty-server/src/engine/core-modules/billing`. Stripe-related config includes `IS_BILLING_ENABLED`, `BILLING_STRIPE_API_KEY`, and `BILLING_STRIPE_WEBHOOK_SECRET` in the server config layer.

Stripe remains tracked in GitHub issue #3 for this repo. Do not enable billing in production until the live Stripe products, prices, and webhook endpoint are configured.

## Open Blockers

- The official upstream image is runtime-ready but not visibly iPOP-branded. A custom branded image or supported runtime branding configuration is required before this should be pointed at users.
- Root `ipop.ai` may already have another product surface; prefer a CRM subdomain unless replacing the current site is intentional.
- Live deployment still needs a provider that can host the stateful server, worker, Postgres, Redis, and durable file storage. Fly billing/trial is incomplete, and Railway auth is not currently valid.
- Stripe live billing still needs product/price/webhook configuration and a live webhook smoke test.
