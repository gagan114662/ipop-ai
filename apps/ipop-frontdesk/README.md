# iPOP Frontdesk

Lightweight hosted frontend for ipop.ai. Static HTML/CSS/JS deployed on Vercel, with a Cloudflare Workers health-check backend and Stripe Payment Links for checkout.

## Pages

- `/` — Landing + CRM-shaped pipeline view + offer inspector
- `/terms.html`, `/privacy.html`, `/cookies.html`, `/refund.html` — Legal
- `/success.html`, `/cancel.html` — Stripe Checkout return URLs (configure on each Payment Link in the Stripe Dashboard)
- `/404.html` — Custom not-found
- `/.well-known/security.txt`, `/humans.txt`, `/robots.txt`, `/sitemap.xml`

## Runtime Config

Set these values in `runtime-config.js` (or generate that file at deploy time):

- `TWENTY_BACKEND_URL` — Cloudflare Worker health-check URL
- `STRIPE_PAYMENT_LINK_LEAD_CLEANUP`
- `STRIPE_PAYMENT_LINK_PROOF_PACK`
- `STRIPE_PAYMENT_LINK_MANAGED_CRM`

Checkout stays disabled when live Stripe links are missing.

## Assets

- `favicon.svg`, `apple-touch-icon.svg`, `og-image.svg` — Branded inline SVGs (~ <1 KB each)

## Analytics

Plausible is embedded with `data-domain="ipop.ai"`. Requires creating the ipop.ai site in Plausible. Tracked custom events: `offer_selected`, `checkout_started`.

## Headers

`vercel.json` sets HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy on all routes.
