# Domain Launch Readiness

## Target

- Product: iPOP
- Primary domain: ipop.ai
- Hosted preview: https://ipop-frontdesk.vercel.app/
- Source repository: gagan114662/ipop-ai
- Runtime: Vercel frontdesk plus a managed Twenty stack
- Imported backend: Twenty

## Readiness contract

The domain is not production ready until all of these are true:

- The hosted preview returns HTTP 200 and shows the branded launch surface.
- The apex domain `https://ipop.ai` returns HTTP 200.
- The `www` host `https://www.ipop.ai` either returns HTTP 200 or redirects cleanly to the apex.
- DNS points to the chosen production host, not a parking page, legacy host, or unrelated provider.
- TLS is active for both apex and `www`.
- The production backend URL used by the frontend is the managed Twenty deployment, not a localhost, demo, or temporary smoke-test address.
- Stripe checkout links, customer portal return URLs, and webhook endpoints use this production domain.

## How to check

Run the read-only checker from the repository root:

```bash
scripts/domain/check-domain-readiness.sh
```

The script does not mutate DNS, Vercel, Namecheap, Stripe, or the backend. It only reports the current HTTP and DNS state and exits non-zero until the owned domain is serving the launch surface.

## Cutover notes

1. Attach `ipop.ai` and `www.ipop.ai` to the selected production hosting project.
2. Update Namecheap DNS only after the host gives the exact A/CNAME records.
3. Wait for TLS issuance and DNS propagation.
4. Re-run `scripts/domain/check-domain-readiness.sh`.
5. Update the launch issue and PR with the checker output.
6. Only then update Stripe redirect URLs and webhook endpoint URLs for production traffic.

## Current expectation

The Vercel preview can be healthy while the owned domain is still blocked. That state is not launch-ready; it is only a preview proof.

## Vercel attachment status

Vercel accepted ipop.ai and www.ipop.ai for project ipop-frontdesk on 2026-05-19. DNS is not configured yet.

Current DNS action from Vercel:

- A ipop.ai 76.76.21.21
- A www.ipop.ai 76.76.21.21

Current nameservers are dns1.registrar-servers.com and dns2.registrar-servers.com, not Vercel nameservers.

After the DNS change propagates, run `scripts/domain/check-domain-readiness.sh` again and confirm TLS plus branded product content before marking the domain gate closed.

