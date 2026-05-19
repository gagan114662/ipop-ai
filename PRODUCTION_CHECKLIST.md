# Production Readiness Checklist

This project is **not** production-ready until every item below is checked off and verified on the live deployment. Do not mark the project ready for user testing until the final acceptance test (bottom of this file) passes end-to-end with zero errors.

When working on this checklist, update `READINESS.md` at the repo root with the current pass/fail status of each item, the date of the last verification, and a short note for anything skipped or deferred.

---

## Definition of "production-ready"

A real stranger can land on the marketing page, sign up, verify email, pay with a real card, use the core feature, get a receipt, and cancel — with no errors, no broken pages, no missing assets, and no upstream-repo placeholder copy visible anywhere.

---

## Frontend

- [ ] All public pages return HTTP 200, no console errors, no broken images
- [ ] No Lorem Ipsum, no upstream repo placeholder copy, no "TODO" strings visible
- [ ] Branding swapped throughout: product name, logo, favicon, OG image, color tokens
- [ ] Responsive at 375px, 768px, 1440px (test all three, not just one)
- [ ] Loading states render (skeletons or spinners — no white screens on slow networks)
- [ ] Error states render on 4xx and 5xx — no raw error dumps to users
- [ ] All forms validate client-side AND show server errors inline
- [ ] Legal pages exist and are linked in footer: Terms, Privacy, Cookie notice, Refund Policy
- [ ] SEO basics per page: unique `<title>`, unique meta description, single `<h1>`
- [ ] `sitemap.xml` and `robots.txt` present and correct
- [ ] Canonical tags set on every public page
- [ ] OpenGraph + Twitter card tags set on landing page (verify with social debuggers)
- [ ] schema.org JSON-LD on pricing and product pages
- [ ] Analytics installed (Plausible, GA4, or PostHog) and firing on: page_view, signup_started, signup_completed, checkout_started, checkout_completed
- [ ] Lighthouse score ≥ 80 on Performance, Accessibility, SEO, Best Practices for the landing page

---

## Backend

- [ ] All env vars documented in `.env.example`
- [ ] No secrets committed to the repo (verify with a fresh `git log -p | grep -i secret` or scanning tool)
- [ ] No env vars missing in production (verify against `.env.example`)
- [ ] Database migrations run cleanly from zero on a fresh instance (test in a clean DB)
- [ ] Auth flows tested end-to-end: signup, email verification, login, logout, password reset, session expiry, OAuth providers (if enabled)
- [ ] Transactional email actually arrives in inbox (not spam): welcome, verify, password reset, payment receipt
- [ ] SPF, DKIM, DMARC configured on the sending domain
- [ ] File uploads work and persist across server restarts (S3 or equivalent, not local disk on ephemeral hosts)
- [ ] Rate limiting on auth endpoints and any public-facing API
- [ ] API errors return structured JSON, not stack traces
- [ ] Background jobs and cron tasks verified by triggering one and watching it complete
- [ ] Database backups configured: daily snapshot, at least one verified restore
- [ ] Application logs queryable somewhere (platform logs, Loki, BetterStack, etc.); PII not logged

---

## Deployment

- [ ] HTTPS valid and auto-renewing (Let's Encrypt or platform-managed)
- [ ] Both apex (`example.com`) and `www.example.com` resolve, with redirect to the canonical one
- [ ] Health check endpoint returns 200
- [ ] Process manager auto-restarts on crash (systemd, PM2, platform default, etc.)
- [ ] Zero-downtime deploy verified by deploying once while watching uptime monitor
- [ ] All secrets in env vars or vault, never in repo or container images
- [ ] Error monitoring wired up (Sentry or equivalent) and capturing a deliberately triggered test error
- [ ] Uptime monitoring pinging every 5 minutes (UptimeRobot, BetterStack, etc.) with email alerts
- [ ] Resource baselines recorded in `READINESS.md`: RAM, CPU, disk at idle and under light load

---

## Domains & DNS

- [ ] Apex and www both serve the site over HTTPS
- [ ] DNS fully propagated (verify via `dig @1.1.1.1`, `dig @8.8.8.8`, `dig @9.9.9.9` from multiple resolvers)
- [ ] Email DNS records configured on the domain: SPF, DKIM, DMARC, MX
- [ ] Subdomain plan documented in `READINESS.md` (app.*, api.*, docs.*) even if not all live yet
- [ ] WHOIS privacy enabled

---

## Stripe

- [ ] Test mode keys and live mode keys both configured; live keys never used in dev environments
- [ ] Products and Prices created in Stripe Dashboard; IDs read from env vars, not hard-coded
- [ ] Checkout flow completes end-to-end in live mode with a real card (issue a small charge, then refund)
- [ ] Webhook endpoint live and reachable from Stripe
- [ ] Webhook signature verified on every request
- [ ] Webhook handler is idempotent (replaying the same event does not double-charge or duplicate state)
- [ ] Webhook handles at minimum: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Stripe Customer Portal enabled — user can update card, cancel, see invoices, download receipts
- [ ] Plan gating enforced server-side, not just hidden in the UI
- [ ] Edge cases tested: card declined, 3D Secure challenge, failed renewal, refund, plan upgrade with proration, plan downgrade with proration
- [ ] Tax handling decided (Stripe Tax on, or manual collection) and applied consistently
- [ ] Receipts include correct legal entity name + business address
- [ ] Trial logic (if any) ends correctly and either converts to paid or cancels cleanly with no orphaned access

---

## Final acceptance test

Run this on the live production site, from an incognito window, with a real email and a real card. Every step must complete with zero errors and zero user confusion.

1. [ ] Land on homepage
2. [ ] Sign up with a real email
3. [ ] Receive verification email (check inbox, not spam) and verify
4. [ ] Log in → land on dashboard
5. [ ] Upgrade to a paid plan → complete Stripe Checkout
6. [ ] Use the core feature of the product (the thing this SaaS actually does)
7. [ ] Receive payment receipt email
8. [ ] Open Customer Portal → cancel subscription
9. [ ] Confirm paid access is correctly downgraded

If all 9 steps pass, mark the project ready in `READINESS.md`. If any step fails, fix the failing step and re-run from step 1.

---

## Deliverables for each completed project

- `READINESS.md` at the repo root with ✅ / ❌ for every checklist item, last-verified date, and any deferred items noted
- The live URL
- A test account (email + password) the human can use to verify the acceptance test independently
