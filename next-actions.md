# Next Actions — Human Required

These items advance iPOP from its current `prep_only`/early-`checkout_ready` state to fully `checkout_ready`. They require human-in-the-loop steps (account creation, real card charges, DNS/registrar UI, dashboard configuration) that this session's agent could not safely perform.

Generated: 2026-05-19
Owner: Gagan (gagan@getfoolish.com)

---

## 1. Stripe Dashboard (highest leverage)

- [ ] **Enable Stripe Customer Portal** for the iPOP Stripe account. Set portal features: cancel subscription, update payment method, view invoices, download receipts. Use the customer-facing branding (logo, support email).
- [ ] **Set Payment Link return URLs** on each of the three live Payment Links:
  - Success: `https://ipop.ai/success.html`
  - Cancel: `https://ipop.ai/cancel.html`
- [ ] **Configure receipt branding**: legal entity name, business address, support email, brand color, logo. (Dashboard → Settings → Business → Public details.)
- [ ] **Decide and apply tax handling**: enable Stripe Tax, or leave tax-exclusive with a clear note in offers. Document the decision in `READINESS.md`.
- [ ] **Webhook hardening on the Cloudflare Worker backend** (`business-launch-backend` repo):
  - Implement Stripe signature verification on every webhook request.
  - Make handler idempotent (use `event.id` as a dedup key).
  - Handle at minimum: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
- [ ] **Run a real low-dollar live-mode purchase + refund**:
  - Open `https://ipop.ai/` in a fresh incognito window
  - Click an offer, click "Continue to Stripe"
  - Complete checkout with a real card (recommend the Lead Cleanup Sprint at $750 or use a sandbox-grade Payment Link with a $1 product)
  - Confirm the receipt email arrives and contains the right legal entity / support email
  - Open the Customer Portal link from the receipt and cancel/refund
  - Verify the webhook handler observed `checkout.session.completed` and `customer.subscription.deleted`

## 2. Email & DNS

- [ ] **SPF, DKIM, DMARC** on `ipop.ai`:
  - SPF: `v=spf1 include:_spf.{provider} ~all`
  - DKIM: provider-specific selector record
  - DMARC: start with `v=DMARC1; p=none; rua=mailto:dmarc@ipop.ai` then tighten
- [ ] Decide which mailbox provider sends iPOP transactional/support mail (Postmark, Resend, Google Workspace, etc.) and wire MX/A records accordingly.
- [ ] Create the mailboxes referenced in the site: `hello@ipop.ai`, `privacy@ipop.ai`, `security@ipop.ai`, `billing@ipop.ai`, `dmarc@ipop.ai`.
- [ ] Verify multi-resolver DNS propagation with `dig @1.1.1.1`, `dig @8.8.8.8`, `dig @9.9.9.9` for apex, www, MX, SPF, DKIM, DMARC.

## 3. Analytics

- [ ] **Create the ipop.ai site in Plausible** (or fork the script.outbound-links.js src in `index.html` to a different provider). The script tag is already embedded — only the dashboard side is missing.
- [ ] Verify `offer_selected` and `checkout_started` custom events appear in Plausible after a test click.
- [ ] If switching to GA4 or PostHog, also update `cookies.html` to disclose the chosen provider.

## 4. Domain & Registrar

- [ ] **WHOIS privacy**: confirm enabled in Namecheap (or registrar of record) for `ipop.ai`.
- [ ] **Auto-renew**: confirm ON.
- [ ] **Canonical redirect**: decide apex vs www as canonical, then enforce a 301 redirect from the non-canonical host in Vercel domain settings.

## 5. Monitoring

- [ ] **Error monitoring**: wire Sentry (or equivalent) into the frontdesk and the Cloudflare Worker. Trigger one deliberate test error to confirm capture.
- [ ] **Uptime monitoring**: register `https://ipop.ai/` and `https://business-launch-backend.gagan-455.workers.dev/ipop/healthz` with UptimeRobot or BetterStack on a 5-minute cadence with email alerts.

## 6. Final acceptance (after the above are done)

- [ ] Re-run the 9-step `PRODUCTION_CHECKLIST.md` Final Acceptance Test on the live URL in a fresh incognito window. Note that for the Payment-Link funnel model, steps 2, 3, 4, 6, and 9 are N/A — the test reduces to: land → click offer → Stripe Checkout completes → receipt arrives → Customer Portal cancel works.

## 7. Longer-horizon (only if `cash_received` justifies the cost)

- [ ] Deploy the full Twenty CRM stack per `docs/ipop-deploy.md` (Fly.io manifests at `fly.toml`/`fly.worker.toml`) at `crm.ipop.ai` or `app.ipop.ai`. Provision managed Postgres, managed Redis, S3-compatible object storage, then run `fly deploy` for the web and worker apps, attach the DNS cert, and wire `BILLING_STRIPE_API_KEY` + `BILLING_STRIPE_WEBHOOK_SECRET` secrets.
- [ ] Once the CRM is live, re-evaluate the N/A items in `READINESS.md` (auth flows, file uploads, server-side plan gating, dashboard core feature) — they become testable.
- [ ] Run Lighthouse on the live landing page and aim for ≥ 80 on Performance / Accessibility / SEO / Best Practices.

---

## Blockers documented in this session

- **Real card charges**: forbidden by the session guardrail. Steps 1 (live checkout test) and downstream verification require the human.
- **DNS-modifying operations**: blocked by sandbox; the `dig` commands themselves were also gated. Use a local terminal for DNS verification.
- **`dig` calls**: required manual approval in this session; documented as deferred audit steps.
