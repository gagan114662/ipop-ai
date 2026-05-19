# HANDOFF — SaaS Clone Portfolio

**Owner:** Gagan (gagan@getfoolish.com)
**Status as of:** May 19, 2026
**Prior agent:** Codex (out of credits)
**Picking up:** Claude

---

## What this is

A portfolio of seven SaaS products, each one a branded fork of a popular open-source project, sold against an expensive incumbent. The premise: the incumbents charge $25–$150/seat for software that already exists, free, on GitHub. Fork it, brand it, undercut by 80%, keep the margin.

## The portfolio

**Source of truth = GitHub repos under `gagan114662`.** Codex created/seeded one repo per domain on May 19, 2026, and added a Stripe-integration issue plus a launch/source-of-truth issue to each. The source-of-truth issue tracks: domain, candidate product lane, OSS base, launch checklist, and honest revenue state (`prep_only`, `checkout_ready`, `payment_ask_sent`, `cash_received`).

| Domain | GitHub repo (source of truth) | Stripe issue | Upstream OSS | Incumbent | Angle |
|---|---|---|---|---|---|
| adeptmedia.in | [gagan114662/adeptmedia-in](https://github.com/gagan114662/adeptmedia-in) | #2 | Chatwoot | Intercom | Managed support inboxes for agencies |
| dazl.ai | [gagan114662/dazl-ai](https://github.com/gagan114662/dazl-ai) | #2 | Appsmith | Retool | Internal dashboards as a managed service |
| hogwarts.live | [gagan114662/hogwarts-live](https://github.com/gagan114662/hogwarts-live) | #2 | Documenso | DocuSign | Document signing for schools / cohorts |
| icum.ai | [gagan114662/icum-ai](https://github.com/gagan114662/icum-ai) | #2 | Formbricks | Typeform / Qualtrics | Surveys + feedback |
| ipop.ai | [gagan114662/ipop-ai](https://github.com/gagan114662/ipop-ai) | #3 | Twenty | Salesforce | CRM with "proof pack" deliverables |
| mathematricks.fund | [gagan114662/mathematricks-fund](https://github.com/gagan114662/mathematricks-fund) | #2 | (unknown — was being wired through Cloudflare) | — | — |
| teachr.live | [gagan114662/teachr-live](https://github.com/gagan114662/teachr-live) | #2 | Cal.com | Calendly | Scheduling for tutoring + cohorts |

> **Note:** `gagan114662/ipop-ai` already existed and was public, so Codex preserved that instead of changing visibility — that's why its Stripe issue is `#3` rather than `#2`. Visibility on the others wasn't stated in Codex's message; check before sharing repo links externally.

## Current state of each project

Verified live by HTTP fetch on May 19, 2026:

- **adeptmedia.in** — Landing page live, branded, legal pages (Terms/Privacy/Cookies/Refunds) linked. Footer note: *"Live Stripe links and Chatwoot backend URL are injected at runtime."* Page shows "Checking Chatwoot" state → backend not actually wired, checkout disabled.
- **dazl.ai** — Same shape: landing + legal done, *"Checkout stays disabled until live links exist."* Appsmith backend not wired.
- **hogwarts.live** — Same shape: landing + legal done, Documenso backend not wired. **Auto-renew on the domain is OFF in Namecheap** — flip it back on if keeping.
- **icum.ai** — Same shape. **Brand problem:** "iCUM" will kill B2B sales and most SEO. Recommend rebranding before any more work goes in. The Formbricks codebase is generic so a swap is cheap.
- **ipop.ai** — Same shape: landing + legal done, Twenty backend not wired. Probably the strongest candidate to ship first (CRM is a proven market and the "Proof Pack" framing is sharp).
- **mathematricks.fund** — **Down.** Empty HTTP response. Codex left a note that Cloudflare wouldn't attach the zone (zone not in logged-in Cloudflare account) and they rolled back to a Vercel preview URL. DNS for the apex needs to be repointed or the project parked.
- **teachr.live** — Same shape: Cal.com backend + Stripe not wired.

### One-line summary

**6 of 7 are stuck at the same stage**: marketing page polished, legal pages in place, but no working backend, no live Stripe, no real checkout. The 7th is fully down. None can take money today.

## What was produced for the handoff

Three files live at:

```
/Users/gaganarora/Library/Application Support/Claude/local-agent-mode-sessions/5dc7fc30-54e2-4e97-8b18-27f94cd9951c/36ace74e-378d-415c-806a-d1f008f89f57/local_19408e52-d3cc-48dc-8dfb-c97584cd39c0/outputs/
```

- `PRODUCTION_CHECKLIST.md` — Full definition of "production-ready" with checkboxes across Frontend, Backend, Deployment, Domains, Stripe, plus a 9-step Final Acceptance Test. This is the source of truth for "done."
- `AGENTS.md` — Instructions for any AI coding agent working in a repo. Tells the agent to verify against the checklist, maintain a `READINESS.md` per repo, and not declare done until acceptance test passes.
- `deploy-checklist.sh` — Bash script that copies the above two files into every git repo under a given parent directory. Run with `bash deploy-checklist.sh ~/code/businesses` (or wherever the repos live). Has `--commit` and `--push` flags.

> ⚠️ That path is a Cowork session workspace and will be cleared. Copy the files somewhere stable before relying on them.

## The Codex goal (already saved)

> "Make every imported business project production-ready against the checklist in PRODUCTION_CHECKLIST.md before user testing."

## Revenue-state ladder (use this to track progress)

Codex defined a four-step ladder per project, tracked in each repo's launch/source-of-truth issue:

1. **`prep_only`** — Landing page + legal pages live. No checkout. *(Current state of all 7 projects.)*
2. **`checkout_ready`** — Backend wired, Stripe live, customer portal works. Acceptance test from `PRODUCTION_CHECKLIST.md` passes.
3. **`payment_ask_sent`** — Real prospect has been asked to pay; payment link is in their hands.
4. **`cash_received`** — A real customer paid real money for the actual product (not friends/family/test cards).

The whole portfolio is currently at `prep_only`. The next milestone for whichever project you pick up is `checkout_ready`.

## Outstanding issues Codex flagged

- **Cloudflare zone for mathematricks.fund** could not be attached (zone not in the logged-in Cloudflare account, even though public DNS uses Cloudflare nameservers). Codex rolled the route config back so the free Worker backend URL stays alive, and was keeping mathematricks on the Vercel preview URL until ownership was resolved.
- Codex was committing runtime config changes per project branch and moving the shared Cloudflare backend into its own GitHub repo so the deployed backend isn't a local-only artifact.
- "Stripe + backend URL injected at runtime" pattern is consistent across all projects — meaning there's a shared injection mechanism. Whoever picks this up should find that mechanism (likely a Worker, env injection, or build-time substitution) and verify it's actually firing in production.

## Recommended next steps for whoever picks this up

1. **Stop spreading.** Six half-built products generate zero revenue. Pick ONE and finish it before touching another.
2. **Recommended pick: iPOP (ipop.ai / Twenty / CRM).** Reasoning: CRM is a known buyer, the "Proof Pack" framing differentiates from generic Twenty deployments, the upstream is mature, and the brand name is safe.
3. **Take iPOP through every box in `PRODUCTION_CHECKLIST.md`.** Track progress in `READINESS.md` at the repo root. Don't mark done until the 9-step Final Acceptance Test passes end-to-end on the live URL with a real card.
4. **Fix mathematricks.fund or park it.** A dead apex domain on the public list looks unprofessional and tanks search trust if anything links to it.
5. **Rebrand icum.ai before more work.** Same codebase, new domain, same deploy pipeline. Don't burn another sprint into a name nobody will Slack-share.
6. **Once one product is fully green, clone its working stack** to the next project. The repetition is the whole point — that's why these were chosen as a portfolio.

## How to verify the prior agent's work

For each domain in the portfolio:

1. `curl -I https://<domain>` — confirm 200 and HTTPS.
2. `dig <domain>` from multiple resolvers — confirm DNS resolves consistently.
3. Open the live URL in an incognito window and look at the footer. If it still says *"Stripe links … injected at runtime. Checkout stays disabled until live links exist"* — the backend is NOT wired. That's the bar to clear.
4. If the page renders without `READINESS.md` in the repo, the prior agent didn't finish the audit pass.

## Repo locations & source of truth

**Source of truth is GitHub**, under the user's account `gagan114662`. See the portfolio table above for repo links. Each repo has:

- Source code for that project
- A **Stripe integration issue** (#2 for six repos, #3 for ipop-ai)
- A **launch / source-of-truth issue** tracking domain, OSS base, launch checklist, and a revenue state field with values `prep_only` → `checkout_ready` → `payment_ask_sent` → `cash_received`

**To pick up the work, the right first move is:**
1. Clone the repo for whichever project you're advancing (e.g., `git clone https://github.com/gagan114662/ipop-ai`).
2. Read the launch/source-of-truth issue and the Stripe issue.
3. Drop `PRODUCTION_CHECKLIST.md` + `AGENTS.md` (from this handoff folder) into the repo root, commit, push.
4. Work the checklist. Update the launch issue's revenue-state field as you advance — that's how progress is tracked across the portfolio.

Local working copies (if any) live on the user's machine; the user works through Conductor + Codex, so paths weren't shared. Use GitHub as the canonical source rather than local clones.

## Contact / context

- The user's preferred working style is fast, practical, "vibe coder." Skip long explanations, ship the artifact, push back if a direction is clearly off (like the iCUM name, or shipping seven half-products at once).
- The user is on a desktop Cowork session with Codex, Conductor, Chrome, and Claude installed.
- The user is currently out of Codex credits, which is why they're handing off.
