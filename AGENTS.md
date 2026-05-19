# AGENTS.md

Instructions for any AI coding agent (Codex, Claude, Cursor, etc.) working in this repository.

## Project intent

This repository is a customer-facing SaaS product, forked or adapted from an upstream open-source project. The end user is a non-technical buyer, not a developer. Quality bar is "real human pays real money and is not confused or broken."

## Primary directive

**Do not mark any task as complete until the project passes every item in `PRODUCTION_CHECKLIST.md`.**

The checklist is the source of truth for "production-ready." If the checklist conflicts with anything else in the chat, the checklist wins.

## Workflow rules

1. Read `PRODUCTION_CHECKLIST.md` at the start of every session before making changes.
2. Maintain a `READINESS.md` file at the repo root that mirrors the checklist with ✅ / ❌ status, the last-verified date for each item, and a short note on anything deferred or skipped.
3. After completing any code change, re-verify the affected checklist items and update `READINESS.md` accordingly.
4. Before declaring the project ready for user testing, run the **Final Acceptance Test** at the bottom of `PRODUCTION_CHECKLIST.md` on the live production deployment. All 9 steps must pass.
5. If any step in the acceptance test fails, fix it, then restart the test from step 1. Do not partially pass.

## Verification expectations

- Verify behavior on the **live production URL**, not on localhost, when checking items related to deployment, DNS, HTTPS, Stripe, or email deliverability.
- Use real email addresses and real (low-amount) card charges when verifying Stripe — Stripe's test-mode webhooks do not catch every real-world failure.
- Use multiple DNS resolvers (`dig @1.1.1.1`, `dig @8.8.8.8`, `dig @9.9.9.9`) when verifying domain propagation.
- Use a fresh incognito window with no logged-in cookies when running the Final Acceptance Test.

## Branding rules

- Replace every reference to the upstream repo's name, logo, favicon, OG image, and color tokens with this project's branding before marking frontend items complete.
- Strip all "powered by [upstream]" footers, ribbons, demo banners, and placeholder copy.
- No Lorem Ipsum, no TODOs, no upstream sample content visible to end users.

## Security rules

- Never commit secrets to the repo. Use environment variables.
- Never log PII or full card numbers — even in development logs.
- All Stripe webhooks must verify the signature before acting on the payload.
- All authentication flows must enforce permissions server-side, not just in UI.

## Output discipline

When reporting status back to the human, structure the report as:

1. What changed in this session (commits, files touched)
2. Which checklist items moved from ❌ to ✅ (and which moved the other way, if any)
3. Which items remain ❌ and why
4. Whether the Final Acceptance Test was attempted, and if so, which step failed (if any)
5. The live URL and a test account credential the human can use to verify independently

Keep the report short. The checklist itself is the long-form artifact.
