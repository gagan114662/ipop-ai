# READINESS

Project: iPOP
Last verified: 2026-05-20
Live URL currently used for smoke checks: https://ipop.ai
Owned production domain: https://ipop.ai
Overall status: ❌ Not production-ready against PRODUCTION_CHECKLIST.md — frontdesk hardened this session; still blocked on real Stripe end-to-end test, email DNS, Customer Portal verification, and uptime/error monitoring.

## Current Evidence

- Apex and www both serve HTTP 200 over HTTPS via Vercel (HSTS present).
- Runtime config probe: HTTP 200 on https://ipop.ai/runtime-config.js with 3 live Stripe Payment Links and Cloudflare Workers backend URL.
- Cloudflare launch backend `/ipop/healthz` returns HTTP 200 (JSON).
- Frontdesk source: no Lorem Ipsum, no TODO/FIXME, no user-visible "Twenty" / upstream brand leakage.
- Legal pages: Terms, Privacy, Cookies, Refund are linked in the footer and now carry substantive, dated content (effective 2026-05-19).
- Branded assets: favicon.svg, apple-touch-icon.svg, og-image.svg (1200x630) added.
- Stripe Checkout return pages: /success.html and /cancel.html added (Payment Links in Stripe Dashboard still need to be pointed at these URLs).
- Custom 404 page: /404.html (noindex) added.
- Vulnerability disclosure: /.well-known/security.txt added with security@ipop.ai contact and expiry 2027-12-31.
- Analytics: Plausible script tag embedded (`data-domain="ipop.ai"`). Custom events `offer_selected` and `checkout_started` wired in app.js. Account creation in Plausible is still pending.
- Security headers via vercel.json: HSTS, X-Content-Type-Options, X-Frame-Options=DENY, Referrer-Policy=strict-origin-when-cross-origin, Permissions-Policy locks down camera/microphone/geolocation/interest-cohort.
- Final Acceptance Test: not attempted — payment requires real card and Customer Portal verification, which are constraint-bound by the "no real charges" guardrail.

## Frontend

| Checklist item | Status | Last verified | Notes |
|---|---:|---|---|
| All public pages return HTTP 200, no console errors, no broken images | ⚠️ | 2026-05-19 | All static pages return 200; full browser console + image audit deferred (no Lighthouse env in this session). |
| No Lorem Ipsum, no upstream repo placeholder copy, no TODO strings visible | ✅ | 2026-05-19 | Grep across `apps/ipop-frontdesk` returned no Lorem/TODO/FIXME and no user-visible "Twenty" brand leakage. |
| Branding swapped throughout: product name, logo, favicon, OG image, color tokens | ✅ | 2026-05-19 | iPOP brand throughout, branded favicon.svg + apple-touch-icon.svg + og-image.svg added, brand color (#0f766e) consistent. |
| Responsive at 375px, 768px, 1440px | ⚠️ | 2026-05-19 | CSS has responsive breakpoints at 820 and 1120; cross-device screenshot verification still pending. |
| Loading states render | ⚠️ | 2026-05-19 | Backend status indicator has live polling state. Skeletons not needed (no async-loaded data on first paint). |
| Error states render on 4xx and 5xx | ✅ | 2026-05-19 | Custom 404.html added with noindex; Vercel serves it on 404. 5xx falls back to Vercel default. |
| All forms validate client-side AND show server errors inline | N/A | 2026-05-19 | No forms on the frontdesk; checkout is via Stripe Payment Links. |
| Legal pages exist and are linked in footer | ✅ | 2026-05-19 | Terms, Privacy, Cookies, Refund — substantive content, dated effective 2026-05-19. |
| SEO basics per page | ✅ | 2026-05-19 | Unique title, meta description, single h1 on all pages. |
| sitemap.xml and robots.txt present and correct | ✅ | 2026-05-19 | Both return HTTP 200 on the live deployment. |
| Canonical tags set on every public page | ✅ | 2026-05-19 | Canonical tags on landing, all legal, success/cancel/404. |
| OpenGraph + Twitter card tags set on landing page | ✅ | 2026-05-19 | OG image added (`/og-image.svg`, 1200x630); Twitter card upgraded to `summary_large_image`; external social debugger pass still pending until human runs it. |
| schema.org JSON-LD on pricing and product pages | ✅ | 2026-05-19 | Landing page includes Service schema.org JSON-LD. |
| Analytics installed and firing key events | ✅ | 2026-05-20 | First-party frontdesk event capture is deployed on the live site. Backend /events/status records frontdesk.page_view for this brand after the GET beacon probe. |
| Lighthouse score >= 80 | ❌ | 2026-05-19 | Lighthouse not run on live production page; deferred (no headless Chrome in this session). |

## Backend

| Checklist item | Status | Last verified | Notes |
|---|---:|---|---|
| All env vars documented in .env.example | ❌ | 2026-05-19 | Frontdesk runtime config is documented in `apps/ipop-frontdesk/README.md`; full upstream app `.env.example` audit deferred. |
| No secrets committed to the repo | ⚠️ | 2026-05-19 | Spot grep clean; full `git log -p` secret scan not yet run. |
| No env vars missing in production | ⚠️ | 2026-05-19 | Cloudflare launch backend healthy with required binding; full upstream app env parity not verified. |
| Database migrations run cleanly from zero | ❌ | 2026-05-19 | D1 migration ran for launch backend; upstream Twenty CRM not yet hosted. |
| Auth flows tested end-to-end | ⚠️ | 2026-05-20 | Shared auth endpoints are deployed and the frontdesk account widget calls signup/login. Live probes show signup creates an unverified account, login blocks until verification, and /auth/me requires a session. Email verification cannot complete until transactional email is configured. |
| Transactional email arrives in inbox | ❌ | 2026-05-20 | Auth endpoints create verification/reset tokens, but live signup returns email_provider_missing because RESEND_API_KEY and AUTH_EMAIL_FROM are not configured. |
| SPF, DKIM, DMARC configured | ❌ | 2026-05-19 | Requires human action in DNS provider; documented in next-actions.md. |
| File uploads work and persist | N/A* | 2026-05-19 | No uploads in the frontdesk. Applies to upstream Twenty CRM when deployed. |
| Rate limiting on auth/public API | ⚠️ | 2026-05-19 | Vercel + Cloudflare provide platform-level abuse protection; app-level rate limits on Cloudflare Worker not audited. |
| API errors return structured JSON | ⚠️ | 2026-05-19 | Cloudflare launch backend returns JSON; not exhaustively tested. |
| Background jobs and cron tasks verified | N/A* | 2026-05-19 | Not used in frontdesk; applies to upstream Twenty CRM when deployed. |
| Database backups configured and restore verified | ❌ | 2026-05-19 | Not configured/proven on launch-backend D1. |
| Application logs queryable; PII not logged | ⚠️ | 2026-05-19 | Cloudflare Workers logs exist via wrangler tail; PII audit deferred. |

\* N/A items reflect the frontdesk product surface, which is a static landing + Stripe Payment Link funnel. These items become applicable when the full Twenty CRM (see `docs/ipop-deploy.md` and `fly.toml`) is actually deployed.

## Deployment

| Checklist item | Status | Last verified | Notes |
|---|---:|---|---|
| HTTPS valid and auto-renewing | ✅ | 2026-05-19 | Apex and www return 200 over HTTPS via Vercel with HSTS `max-age=63072000`. |
| Apex and www resolve with canonical redirect | ✅ | 2026-05-20 | Live curl verified apex 200 and www 308 redirect to apex. |
| Health check endpoint returns 200 | ✅ | 2026-05-19 | `/ipop/healthz` on the Cloudflare Worker backend returns HTTP 200. |
| Process manager auto-restarts on crash | ✅ | 2026-05-19 | Cloudflare Workers and Vercel both auto-restart by platform design. |
| Zero-downtime deploy verified | ⚠️ | 2026-05-19 | Vercel atomic-swaps deploys by default; not yet verified with an external uptime probe during deploy. |
| Secrets in env vars/vault only | ⚠️ | 2026-05-19 | No secrets present in the frontdesk repo on inspection; full repo-history secret scan still pending. |
| Error monitoring wired and test error captured | ✅ | 2026-05-20 | Frontdesk error capture is deployed and a controlled frontdesk.error event is recorded in the Cloudflare D1-backed event table. |
| Uptime monitoring every 5 minutes with email alerts | ⚠️ | 2026-05-20 | Cloudflare cron runs every 5 minutes and records checks in D1; email/page alerts are not configured yet. |
| Resource baselines recorded | N/A* | 2026-05-19 | Vercel + Cloudflare are managed/serverless — RAM/CPU baselines do not apply at the frontdesk layer. |

## Domains & DNS

| Checklist item | Status | Last verified | Notes |
|---|---:|---|---|
| Apex and www both serve site over HTTPS | ✅ | 2026-05-20 | Live curl verified apex loads over HTTPS and www redirects to the HTTPS apex. |
| DNS fully propagated via 1.1.1.1, 8.8.8.8, 9.9.9.9 | ✅ | 2026-05-20 | Re-probed A records through all three resolvers; all resolve to Vercel edge targets. |
| Email DNS records configured | ❌ | 2026-05-19 | SPF/DKIM/DMARC require human action in the DNS provider; documented in next-actions.md. |
| Subdomain plan documented | ✅ | 2026-05-19 | `app.ipop.ai` (future Twenty CRM), `crm.ipop.ai` (Fly target per `docs/ipop-deploy.md`), `api.ipop.ai` (reserved). Marketing on apex. |
| WHOIS privacy enabled | ⚠️ | 2026-05-19 | Requires human verification in Namecheap registrar UI. |

## Stripe

| Checklist item | Status | Last verified | Notes |
|---|---:|---|---|
| Test and live keys configured correctly | ⚠️ | 2026-05-19 | Live Payment Links exist; full test-vs-live key separation audit pending. |
| Products and Prices created; IDs from env vars not hard-coded | ⚠️ | 2026-05-19 | Payment Link URLs are injected via `runtime-config.js` at deploy time, not committed to the static repo — acceptable for a Payment Link funnel. |
| Live checkout completes with real card and refund | ❌ | 2026-05-19 | Blocked by "no real card charges" guardrail in this session. Human must run this step. |
| Webhook endpoint live and reachable from Stripe | ⚠️ | 2026-05-20 | Live Stripe Dashboard destination business-launch-backend is active for checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, and invoice.payment_failed; a real signed delivery from a live checkout is still not proven. |
| Webhook signature verified | ✅ | 2026-05-20 | Cloudflare Worker has the live Stripe webhook signing secret configured; unsigned webhook probes now return HTTP 400 invalid_stripe_signature. |
| Webhook handler idempotent | ⚠️ | 2026-05-20 | Worker stores Stripe event IDs with a D1 UNIQUE constraint and ignores duplicate event IDs; signed replay against the live endpoint is still not proven. |
| Required webhook events handled | ⚠️ | 2026-05-20 | Dashboard destination listens for the required events and the Worker recognizes them; end-to-end side effects after a real purchase/cancel are still unproven. |
| Stripe Customer Portal enabled | ✅ | 2026-05-20 | Live Customer Portal configuration bpc_1TZAqQJOUExxbPnuScmDfFk2 is active with invoice history, customer updates, payment method updates, and cancel-at-period-end enabled. Portal link is deployed in the site footer. |
| Plan gating enforced server-side | ⚠️ | 2026-05-20 | Shared Cloudflare entitlement tables and Stripe webhook mapping are deployed. Synthetic D1 smoke proved /auth/me returns a paid entitlement for a linked Stripe customer; upstream apps still do not consume this layer for in-app gating. |
| Stripe edge cases tested | ❌ | 2026-05-19 | Not tested (declines, 3DS, failed renewal, proration). Human action. |
| Tax handling decided/applied | ❌ | 2026-05-19 | Decision pending. Default Payment Link behavior is tax-exclusive. |
| Receipts include legal entity/address | ❌ | 2026-05-19 | Requires Stripe Dashboard branding setup (legal name, address, logo). Human action. |
| Trial logic ends correctly | N/A | 2026-05-19 | No trials currently offered. |
| Return URLs (success + cancel) wired on each Payment Link | ❌ | 2026-05-20 | Branded success/cancel pages are deployed and return HTTP 200; Stripe Payment Links still use hosted_confirmation because the restricted live key cannot update after_completion redirects. |

## Final Acceptance Test

| Step | Status | Last verified | Notes |
|---|---:|---|---|
| 1. Land on homepage | ✅ | 2026-05-19 | Homepage HTTP 200 on live URL. |
| 2. Sign up with a real email | ⚠️ | 2026-05-20 | Signup endpoint and live account widget exist; real email verification is blocked by missing transactional email provider. |
| 3. Receive verification email and verify | ❌ | 2026-05-20 | Verification-token flow exists, but no email provider/sender domain is configured, so no inbox delivery is proven. |
| 4. Log in and land on dashboard | ⚠️ | 2026-05-20 | Login endpoint exists and rejects unverified accounts as expected; full hosted upstream dashboard login is not integrated. |
| 5. Upgrade to paid plan via Stripe Checkout | ❌ | 2026-05-19 | Payment Links live; real card purchase blocked by guardrail. |
| 6. Use the core feature | N/A | 2026-05-19 | Proof Pack is a service deliverable, not an in-app feature. |
| 7. Receive payment receipt email | ❌ | 2026-05-19 | Not verified — requires real charge. |
| 8. Open Customer Portal and cancel | ⚠️ | 2026-05-20 | Live Stripe Customer Portal is active and linked from the site, but cancellation has not been tested with a real paid customer/subscription. |
| 9. Confirm paid access downgraded | ⚠️ | 2026-05-20 | Shared entitlement downgrade handling is deployed; synthetic /auth/me entitlement read is proven, but real Stripe cancellation downgrade and upstream app access removal are not proven. |

## Deliverables

| Deliverable | Status | Notes |
|---|---:|---|
| READINESS.md | ✅ | This file mirrors PRODUCTION_CHECKLIST.md with current evidence. |
| Live URL | ✅ | https://ipop.ai |
| Test account email + password | N/A | Frontdesk has no in-product accounts; the Stripe Customer Portal serves as the buyer's account. |
| next-actions.md punchlist for human | ✅ | See `next-actions.md` for blocked items requiring human action. |
