# READINESS

Project: iPOP
Last verified: 2026-05-19
Live URL currently used for smoke checks: https://ipop.ai
Owned production domain: https://ipop.ai
Overall status: ❌ Not production-ready against PRODUCTION_CHECKLIST.md

## Current Evidence

- Owned domain page/config/backend probes pass.
- Runtime config probe: HTTP 200 on https://ipop.ai/runtime-config.js.
- Payment-link config: 3 live Stripe Payment Links are present in the deployed runtime config.
- Hosted backend config: deployed runtime config points to Cloudflare Workers backend.
- Backend probe: Cloudflare launch backend returns HTTP 200 for this project's expected health/API path.
- Backend source of truth: https://github.com/gagan114662/business-launch-backend
- Final Acceptance Test: not attempted, because signup, email verification, real-card purchase, Customer Portal cancellation, and paid-access downgrade are not implemented/proven end-to-end.

## Frontend

| Checklist item | Status | Last verified | Notes |
|---|---:|---|---|
| All public pages return HTTP 200, no console errors, no broken images | ❌ | 2026-05-19 | Landing page HTTP 200 is verified; browser console and image audit across all public pages is not yet verified. |
| No Lorem Ipsum, no upstream repo placeholder copy, no TODO strings visible | ❌ | 2026-05-19 | Not fully scanned in a browser across all pages/states. |
| Branding swapped throughout: product name, logo, favicon, OG image, color tokens | ❌ | 2026-05-19 | Product title/brand visible; favicon/OG/color-token sweep not verified. |
| Responsive at 375px, 768px, 1440px | ❌ | 2026-05-19 | Not yet verified with browser screenshots at all three widths. |
| Loading states render | ❌ | 2026-05-19 | Not verified under slow network. |
| Error states render on 4xx and 5xx | ❌ | 2026-05-19 | Not verified; current static frontdesk has limited error handling. |
| All forms validate client-side AND show server errors inline | ❌ | 2026-05-19 | No production signup/lead form acceptance test completed. |
| Legal pages exist and are linked in footer | ✅ | 2026-05-19 | Terms, Privacy, Cookie notice, and Refund Policy return HTTP 200 after redirect and are linked from the footer. |
| SEO basics per page | ✅ | 2026-05-19 | Landing page has one title, one meta description, and one h1; legal pages have unique titles/descriptions. |
| sitemap.xml and robots.txt present and correct | ✅ | 2026-05-19 | Both files return HTTP 200 on the live deployment. |
| Canonical tags set on every public page | ✅ | 2026-05-19 | Canonical tags added to landing and legal pages. |
| OpenGraph + Twitter card tags set on landing page | ✅ | 2026-05-19 | OpenGraph and Twitter card tags are present on the live landing page; external social debugger pass is still a later manual check. |
| schema.org JSON-LD on pricing and product pages | ✅ | 2026-05-19 | Landing page includes schema.org JSON-LD for the product/service. |
| Analytics installed and firing key events | ❌ | 2026-05-19 | No analytics evidence for page_view/signup/checkout events. |
| Lighthouse score >= 80 | ❌ | 2026-05-19 | Lighthouse not run on live production page. |

## Backend

| Checklist item | Status | Last verified | Notes |
|---|---:|---|---|
| All env vars documented in .env.example | ❌ | 2026-05-19 | Not verified across full upstream app. |
| No secrets committed to the repo | ❌ | 2026-05-19 | Full git history secret scan not completed. |
| No env vars missing in production | ❌ | 2026-05-19 | Cloudflare launch backend has required binding; full upstream app env parity not verified. |
| Database migrations run cleanly from zero | ❌ | 2026-05-19 | D1 migration ran for launch backend; upstream app clean DB migrations not verified. |
| Auth flows tested end-to-end | ❌ | 2026-05-19 | Signup, email verification, login/logout/reset/session expiry not proven. |
| Transactional email arrives in inbox | ❌ | 2026-05-19 | Not configured/proven. |
| SPF, DKIM, DMARC configured | ❌ | 2026-05-19 | DMARC lookup returned empty in DNS probes. |
| File uploads work and persist | ❌ | 2026-05-19 | Not proven. |
| Rate limiting on auth/public API | ❌ | 2026-05-19 | Not implemented/proven for full upstream app. |
| API errors return structured JSON | ❌ | 2026-05-19 | Cloudflare launch backend returns JSON; full upstream API not verified. |
| Background jobs and cron tasks verified | ❌ | 2026-05-19 | Not proven. |
| Database backups configured and restore verified | ❌ | 2026-05-19 | Not configured/proven. |
| Application logs queryable; PII not logged | ❌ | 2026-05-19 | Not audited. |

## Deployment

| Checklist item | Status | Last verified | Notes |
|---|---:|---|---|
| HTTPS valid and auto-renewing | ✅ | 2026-05-19 | Apex HTTPS returned 200 in curl probe. |
| Apex and www resolve with canonical redirect | ❌ | 2026-05-19 | Apex/www DNS observed, but canonical redirect behavior not fully verified; Mathematricks owned domain fails. |
| Health check endpoint returns 200 | ✅ | 2026-05-19 | Cloudflare launch backend health/API path returns HTTP 200. |
| Process manager auto-restarts on crash | ❌ | 2026-05-19 | Cloudflare platform restarts Worker; full upstream app process manager not proven. |
| Zero-downtime deploy verified | ❌ | 2026-05-19 | Not verified with uptime monitor during deploy. |
| Secrets in env vars/vault only | ❌ | 2026-05-19 | Not fully audited across repos/images. |
| Error monitoring wired and test error captured | ❌ | 2026-05-19 | Not configured/proven. |
| Uptime monitoring every 5 minutes with email alerts | ❌ | 2026-05-19 | Not configured/proven. |
| Resource baselines recorded | ❌ | 2026-05-19 | Not recorded for full upstream app. |

## Domains & DNS

| Checklist item | Status | Last verified | Notes |
|---|---:|---|---|
| Apex and www both serve site over HTTPS | ❌ | 2026-05-19 | Apex works for six projects; www/canonical behavior and Mathematricks owned domain are not fully passing. |
| DNS fully propagated via 1.1.1.1, 8.8.8.8, 9.9.9.9 | ❌ | 2026-05-19 | A records observed, but not all canonical/owned-domain conditions pass; Mathematricks has inconsistent www result. |
| Email DNS records configured | ❌ | 2026-05-19 | MX exists on most domains; SPF/DKIM/DMARC not proven and DMARC was empty. |
| Subdomain plan documented | ❌ | 2026-05-19 | Not documented here yet beyond backend URL note. |
| WHOIS privacy enabled | ❌ | 2026-05-19 | Not verified. |

## Stripe

| Checklist item | Status | Last verified | Notes |
|---|---:|---|---|
| Test and live keys configured correctly | ❌ | 2026-05-19 | Not proven; live links exist but env/key separation is not audited. |
| Products and Prices created; IDs from env vars not hard-coded | ❌ | 2026-05-19 | Payment Links are hard-coded in runtime config for current frontdesk smoke path. |
| Live checkout completes with real card and refund | ❌ | 2026-05-19 | Not attempted. |
| Webhook endpoint live and reachable from Stripe | ❌ | 2026-05-19 | Cloudflare endpoints exist, but Stripe Dashboard webhook delivery not proven. |
| Webhook signature verified | ❌ | 2026-05-19 | Current free launch backend logs webhook receipt; signature verification is not implemented. |
| Webhook handler idempotent | ❌ | 2026-05-19 | Not implemented/proven. |
| Required webhook events handled | ❌ | 2026-05-19 | Not implemented/proven. |
| Stripe Customer Portal enabled | ❌ | 2026-05-19 | Not proven. |
| Plan gating enforced server-side | ❌ | 2026-05-19 | Not implemented/proven. |
| Stripe edge cases tested | ❌ | 2026-05-19 | Not tested. |
| Tax handling decided/applied | ❌ | 2026-05-19 | Not documented/proven. |
| Receipts include legal entity/address | ❌ | 2026-05-19 | Not verified. |
| Trial logic ends correctly | ❌ | 2026-05-19 | Not applicable/proven; no final subscription lifecycle test. |

## Final Acceptance Test

| Step | Status | Last verified | Notes |
|---|---:|---|---|
| 1. Land on homepage | ✅ | 2026-05-19 | Homepage HTTP 200 on live URL. |
| 2. Sign up with a real email | ❌ | 2026-05-19 | Not implemented/proven on final production app. |
| 3. Receive verification email and verify | ❌ | 2026-05-19 | Not configured/proven. |
| 4. Log in and land on dashboard | ❌ | 2026-05-19 | Not proven. |
| 5. Upgrade to paid plan via Stripe Checkout | ❌ | 2026-05-19 | Payment Links exist; real checkout completion not attempted. |
| 6. Use the core feature | ❌ | 2026-05-19 | Full upstream app is not hosted/proven. |
| 7. Receive payment receipt email | ❌ | 2026-05-19 | Not verified. |
| 8. Open Customer Portal and cancel | ❌ | 2026-05-19 | Not configured/proven. |
| 9. Confirm paid access downgraded | ❌ | 2026-05-19 | Not implemented/proven. |

## Deliverables

| Deliverable | Status | Notes |
|---|---:|---|
| READINESS.md | ✅ | This file mirrors PRODUCTION_CHECKLIST.md with current evidence. |
| Live URL | ✅ | https://ipop.ai |
| Test account email + password | ❌ | Cannot provide until real auth/signup flow is deployed and verified. |

