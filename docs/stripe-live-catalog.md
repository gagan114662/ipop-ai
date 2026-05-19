# Stripe Live Catalog

Live Stripe catalog created on 2026-05-19 for ipop.ai.

The restricted key used for Product and Price creation is named `business-launch-catalog-live`; do not commit or paste the key value.

| Offer | Launch price | Price env | Live Price ID | Payment Link ID | Payment URL |
| --- | --- | --- | --- | --- | --- |
| iPOP CRM Starter | $49/mo | `STRIPE_PRICE_IPOP_STARTER_MONTHLY` | `price_1TYpemJOUExxbPnuiLT2CTUn` | `plink_1TYphNJOUExxbPnurdX8ix00` | https://buy.stripe.com/00w6oI1kXgP52HpfZm1kA0E |
| iPOP Sales Team | $149/mo | `STRIPE_PRICE_IPOP_TEAM_MONTHLY` | `price_1TYpeoJOUExxbPnuQooCjFG0` | `plink_1TYphOJOUExxbPnupgRA9CGq` | https://buy.stripe.com/7sY3cw9Rt56na9R00o1kA0F |
| iPOP CRM Migration | $1,000 one-time | `STRIPE_PRICE_IPOP_MIGRATION_ONETIME` | `price_1TYpepJOUExxbPnuPO1q5DAM` | `plink_1TYphQJOUExxbPnuAnNW8piU` | https://buy.stripe.com/fZucN6d3F56nchZ5kI1kA0G |

## Verification

- Product and Price creation: passed via `scripts/stripe/create-live-catalog.sh --execute`.
- Payment Link creation: passed through the Stripe connector against the live Price IDs above.
- Probe: a temporary live product was created and deactivated before catalog creation to verify write permissions.

