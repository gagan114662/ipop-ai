# iPOP Frontdesk

This is the lightweight hosted frontend proof for ipop.ai. It borrows Twenty's CRM shape: left navigation, dense record tables, pipeline status chips, and a right-side record/checkout inspector.

It is not full production readiness. Production still requires a hosted Twenty backend, legal review for AGPL/commercial obligations, live Stripe links, and DNS cutover for ipop.ai.

## Runtime Config

Set these values in runtime-config.js or generate that file at deploy time:

- TWENTY_BACKEND_URL
- STRIPE_PAYMENT_LINK_LEAD_CLEANUP
- STRIPE_PAYMENT_LINK_PROOF_PACK
- STRIPE_PAYMENT_LINK_MANAGED_CRM

Checkout stays disabled when live Stripe links are missing.
