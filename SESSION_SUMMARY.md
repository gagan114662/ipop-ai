# ipop-ai session summary

Session: continued Codex handoff
Date: 2026-05-19
Branch: codex/ipop-frontdesk-preview
Commit: e0d35c75
Push: gagan114662/ipop-ai @ codex/ipop-frontdesk-preview
Files changed: 21 (12 new, 9 modified) — +723 / −97

> Canonical copy of this report was also requested at
> `/Users/gaganarora/code/businesses/logs/ipop-ai.summary.md` but that path is
> outside this session's sandboxed working directories and requires user
> approval to write. This file is a local backup.

## Current revenue-state ladder position

Project moved from **prep_only** toward **checkout_ready** but is not all-the-way-green because the final acceptance test, Stripe Customer Portal verification, webhook signature hardening, and email DNS still need human action.

Live state still proven:
- https://ipop.ai HTTP 200 (Vercel, HSTS active)
- https://www.ipop.ai HTTP 200
- /runtime-config.js exposes 3 live Stripe Payment Links + Cloudflare Worker backend URL
- Cloudflare Worker /ipop/healthz returns HTTP 200

## Items advanced this session

### Branding (✅ now)
- Branded SVG favicon, apple-touch-icon, and 1200×630 og-image added and wired
- theme-color meta set to brand teal (#0f766e)
- User-visible "Twenty" status strings replaced with neutral "backend"/"CRM"
- HANDOFF "powered by Twenty" upstream leakage is gone from the user surface

### Legal pages (✅ now, were ⚠️)
- Terms, Privacy, Cookies, Refund rewritten with substantive, dated content
- Includes: subprocessor list (Stripe, Vercel, Cloudflare), retention period, refund tiers (one-time vs subscription, failed-delivery), chargeback request line, security@/privacy@/billing@ contact paths

### Error & funnel pages
- /404.html (noindex, branded, links home)
- /success.html and /cancel.html for Stripe Checkout return URLs
  (Stripe Dashboard side still needs to point Payment Links at these — human action)

### Discoverability + responsible disclosure
- /.well-known/security.txt with security@ipop.ai, expires 2027-12-31
- /humans.txt

### Analytics (⚠️ — code embedded, account creation pending)
- Plausible script tag in index.html with data-domain="ipop.ai"
- Custom events offer_selected, checkout_started wired in app.js
- Account creation in Plausible queued in next-actions.md

### Security headers (✅ now, were ❌)
- vercel.json now sets HSTS (max-age=63072000, includeSubDomains, preload),
  X-Content-Type-Options=nosniff, X-Frame-Options=DENY,
  Referrer-Policy=strict-origin-when-cross-origin,
  Permissions-Policy locking camera/microphone/geolocation/interest-cohort

### Process artifacts
- PRODUCTION_CHECKLIST.md, AGENTS.md, HANDOFF.md committed to repo root
- READINESS.md fully rewritten with current evidence + N/A annotations for the Payment-Link funnel surface (steps that only become applicable when the full Twenty CRM is hosted)
- next-actions.md created with prioritized human-required punchlist

## Commits made

- e0d35c75 — feat(ipop): harden frontdesk for checkout-ready (this session)

Prior in-branch context:
- 1b4de64b — feat: add frontend production metadata and legal pages (previous)
- 92090868 — docs: add production readiness checklist status (previous)
- d68ffd05 — chore: wire iPOP frontdesk to hosted launch backend (previous)

## Human-action punchlist (full list in next-actions.md)

**Stripe (highest leverage)**
1. Enable Stripe Customer Portal in Dashboard
2. Set Payment Link return URLs → ipop.ai/success.html and /cancel.html
3. Configure receipt branding (legal entity, address, support email, logo)
4. Decide tax handling (Stripe Tax on/off)
5. Cloudflare Worker backend: add Stripe webhook signature verification + idempotency + handle checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
6. Run a real low-dollar live-mode purchase + Customer Portal cancel + refund

**Email & DNS**
7. Wire SPF, DKIM, DMARC on ipop.ai for chosen ESP
8. Create mailboxes: hello@, privacy@, security@, billing@, dmarc@
9. Multi-resolver dig audit (apex, www, MX, SPF, DKIM, DMARC)

**Analytics**
10. Create ipop.ai site in Plausible, verify custom events appear

**Domain / Registrar**
11. Confirm WHOIS privacy + auto-renew in Namecheap
12. Enforce 301 canonical (apex vs www) in Vercel domain settings

**Monitoring**
13. Wire Sentry (or equivalent) into frontdesk + Cloudflare Worker; trigger test error
14. Uptime monitor on / and /ipop/healthz at 5-min cadence

**Acceptance test**
15. Re-run the 9-step Final Acceptance Test (steps 2/3/4/6/9 are N/A for the Payment-Link funnel)

## Blockers encountered this session

- **Real card charges**: forbidden by session guardrail — steps 5/6 of the Final Acceptance Test require the human
- **dig commands**: required manual approval; not run. DNS verification deferred to a local terminal
- **Writing to /Users/gaganarora/code/businesses/logs/**: outside session sandbox; canonical summary file requires approval

## What did NOT change

- runtime-config.js: live Stripe Payment Links + Cloudflare Worker URL preserved as-is
- Full Twenty CRM (packages/) and Fly manifests untouched — that deployment path is a separate workstream documented in docs/ipop-deploy.md
