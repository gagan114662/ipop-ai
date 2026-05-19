# iPOP Stripe Launch

This repo is the source of truth for iPOP billing. Do not treat Stripe as live-ready until the products, prices, checkout surface, and webhook proof below exist in live mode.

## Integration Choice

Use Stripe Billing with Checkout Sessions or Payment Links for recurring CRM subscriptions. Use one-time Checkout for migrations.

## Offer Catalog

| Handle | Product name | Billing mode | Launch price placeholder | Intended buyer |
|---|---|---|---|---|
| `ipop_crm_starter` | iPOP CRM Starter | Monthly subscription | `STRIPE_PRICE_IPOP_STARTER_MONTHLY` | Founder-led teams replacing spreadsheets |
| `ipop_sales_team` | iPOP Sales Team | Monthly subscription | `STRIPE_PRICE_IPOP_TEAM_MONTHLY` | Sales teams that need a managed CRM |
| `ipop_migration` | iPOP CRM Migration | One-time payment | `STRIPE_PRICE_IPOP_MIGRATION_ONETIME` | CRM import, pipeline setup, and branded configuration |

## Required Environment

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_IPOP_STARTER_MONTHLY`
- `STRIPE_PRICE_IPOP_TEAM_MONTHLY`
- `STRIPE_PRICE_IPOP_MIGRATION_ONETIME`
- `STRIPE_CUSTOMER_PORTAL_RETURN_URL=https://ipop.ai/account`

## Required Webhook Events

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Current Gate

Blocked: current live Stripe credentials can read account state but cannot create Products, Prices, Payment Links, Checkout Sessions, or webhook endpoints. Close Stripe issue #3 only after live checkout and webhook signature proof are posted.
