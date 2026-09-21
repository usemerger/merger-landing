# Account and waitlist frontend implementation

Implemented September 21, 2026 in the dedicated funnel preview branch.

## Routes and authority

- The homepage waitlist form now hands off to `/signup`; it never creates an anonymous entry or treats a public referral code as identity.
- `/signup` collects a name, email and password, with optional role/firm. It sends a pending waitlist enrollment and the displayed terms/privacy versions. No checkout or handle reservation is required while waiting.
- `/verify-email` reads the server's verification flag and offers resend/check actions. A query parameter alone never verifies an account.
- `/dashboard` and `/billing` use `/api/account/access` for identity, admission and capabilities. Stripe details load independently; billing outages leave the account/waitlist usable. Waiting accounts have no checkout controls. Handle setup happens after acceptance.
- `/invite?token=...` requires sign-in and explicit acceptance. `/invite` can accept the currently assigned invitation from the dashboard. Legacy `/alpha` and public referral-code links cannot unlock checkout.
- `/download` keeps server download authorization and directs denied accounts to their next account step, without exposing an independent checkout bypass.
- `/profile` provides name editing, email/verification display, password-reset email and logout-all. Secure email changes and data/removal requests use support until dedicated backend workflows exist.
- `/admin/waitlist` uses the current authenticated session and `capabilities.isAdmin`; it never accepts a browser admin bearer token. Staff can filter/search, select and review a batch, send/reissue invitations, see delivery/expiry status, and revoke pending invitations. The backend must repeat all staff authorization checks.

## New API contract

`GET /api/account/access` returns `user`, `admission`, `waitlist`, `capabilities`, `billing`, and `rollout`. `capabilities.canCheckout` is required before rendering activation. Private invitation credentials are posted only to `POST /api/account/invitation/accept`; signup/referral data is not an access credential.

Other calls: `POST /api/account/waitlist`, `PATCH /api/account/profile`, existing verification/password/session/billing/download endpoints, and session-authorized `/api/admin/waitlist` list/invite/revoke routes.

The preview must point at the new isolated backend. There is deliberately no compatibility fallback that restores open checkout when admission endpoints are unavailable.

## Verification

- 91 Vitest cases pass, including waiting-account denial, forged local invitation state, billing outage isolation, verification/query spoofing, explicit enrollment, private-token acceptance, expired/revoked/wrong-account errors, profile persistence and staff review before sending.
- Four existing synthetic HTTP checks pass for cookie auth and recovery.
- Next production build passes with all 19 routes.
- Real staging email, invitation, Stripe test checkout/webhook and desktop compatibility checks are separate integration work; mocked component tests do not prove them.

## Remaining operational choices

The staff UI supports manually reviewed cohorts, not an automated reminder scheduler or arbitrary cohort labels/preferences editing. Optional marketing preferences are not collected. The signup consent record covers displayed terms/privacy and necessary account/access email only. Email changes require support; a new verified-email change flow should be built before exposing an editable address.
