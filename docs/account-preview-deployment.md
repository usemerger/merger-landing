# Account and design preview — September 21, 2026

This build belongs to the dedicated `merger-orbit-preview` Vercel project. It is
not the production usemerger.com funnel. The accompanying backend source is in
the `backend-waitlist-rollout` checkout, branch `codex/account-waitlist-rollout`.

## Design

Pill-shaped primary and secondary actions replace the fragmented Singularity
buttons. Short hover, focus and press feedback keeps text legible. Neutral black,
white and gray surfaces, Geist typography, and restrained gold accents frame the
existing interactive diamond, channel orbit, deal-detection film and document
workflow film. Reduced-motion and small-screen layouts remain supported.

## Isolated services

- Website: https://merger-orbit-preview.vercel.app
- Same-origin `/api/*` rewrites to
  `https://api.buildmerger.com/account-preview/api/*`.
- VPS directory: `/opt/merger-account-preview`, with independent root-only state.
- Containers: `merger-account-preview-api`, `merger-account-preview-db`, and
  `merger-account-preview-mail`. Production and the old staging service are separate.
- Dedicated PostgreSQL database/volume and generated session/encryption secrets.
- Stripe **test** product, $50/month price, and signed webhook endpoint. No live
  payment credentials are used by this preview.
- Mailpit captures verification, invitation and recovery messages privately. It
  has no outgoing relay. Preview visitors do not receive real email.
- `NEXT_PUBLIC_ACCOUNT_PREVIEW=1` displays a persistent test notice and applies
  `X-Robots-Tag: noindex, nofollow`. Token pages use `Referrer-Policy: no-referrer`.
- API responses are private/no-store. No staff bearer secret is exposed to the browser.

The installer metadata is read from the existing release directory through a
read-only mount. The preview has no production Matrix/Synapse credentials.
Downloading an installer does not prove that a preview account can sign into the
production desktop app. That final integration requires a coordinated production
rollout or a desktop build explicitly pointed at a complete staging stack.

## Operations

The backend includes `deploy/setup-account-preview.py` and
`deploy/account-preview-acceptance.py`. The former prepares/redeploys only the
named preview stack. The latter creates fictional `example.com` accounts, reads
captured mail, creates real Stripe test Checkout objects, and exercises signed
Stripe webhooks. It never completes a hosted payment form or makes a real charge.
Test subscriptions are scheduled to end, and unused Checkout Sessions are expired.

The account flow is signup → verify email → waiting → staff invitation → accept
→ review activation terms → Checkout → entitled download. Waiting does not start
a trial. Returning members are not offered a second introductory trial.

Before public rollout: select verified staff accounts, configure production email
delivery and reminder scheduling, review offer/terms and existing-member migration,
take a database backup, and coordinate the backend and desktop authentication
release. Email-address changes and account deletion currently use support.

No production rollout is authorized by this preview deployment document.

## Verified in this build

- Vercel production-mode build of the dedicated preview succeeds (19 routes).
- Frontend suite: 98 component tests and four synthetic HTTP tests passed before
  the final referral fix; its 24 targeted regression tests also passed.
- Backend suite: 140 tests passed, including disposable PostgreSQL coverage;
  13 final persistence regressions passed after billing review corrections.
- All 32 staging checks passed both against the isolated API and through the
  deployed website's same-origin rewrite, including cookies, verification,
  admission, Stripe test checkout creation, signed webhook activation, billing
  portal creation, download authorization, cancellation and returning-trial rules.
- Browser review covered desktop and mobile layouts, sign-in, profile saving,
  waiting-account download denial, invitation review/acceptance, accurate trial
  cancellation messaging, and preview-specific referral URLs.
- Invitation reminders were checked in dry-run mode. The scheduler remains an
  operator template and is not enabled. External email delivery and production
  desktop authentication were not exercised.

Published deployment: `merger-orbit-preview-q7f8tjlpx-merger1.vercel.app`.
