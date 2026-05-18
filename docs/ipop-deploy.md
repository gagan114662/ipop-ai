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
- The Twenty server container started and ran Nest initialization.
- Database initialization and instance upgrade commands ran, including migrations through the 2.5 command set.
- The server did not bind/listen on port 3000 before the compose healthcheck failed.
- `curl http://localhost:3000/healthz` and `curl http://localhost:3000/` returned no HTTP response.

A second clean-volume run with `DISABLE_CRON_JOBS_REGISTRATION=true` let the instance upgrade commands complete again, but the server still did not open port 3000. This is a production readiness blocker.

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

## Stripe/Billing

Twenty has built-in billing and Stripe modules in `packages/twenty-server/src/engine/core-modules/billing`. Stripe-related config includes `IS_BILLING_ENABLED`, `BILLING_STRIPE_API_KEY`, and `BILLING_STRIPE_WEBHOOK_SECRET` in the server config layer.

Stripe remains tracked in GitHub issue #3 for this repo. Do not enable billing in production until the server health blocker is resolved and the live Stripe products, prices, and webhook endpoint are configured.

## Open Blockers

- Server health is red locally: the production image starts and migrates, but does not listen on port 3000 during the validation window.
- Root `ipop.ai` may already have another product surface; prefer a CRM subdomain unless replacing the current site is intentional.
- Live deployment still needs a provider that can host the stateful server, worker, Postgres, Redis, and durable file storage. Fly billing/trial is incomplete, and Railway auth is not currently valid.
