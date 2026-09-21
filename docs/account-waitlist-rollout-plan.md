# Merger account, waitlist and rollout proposal

Prepared September 21, 2026. This is a design and implementation proposal, not a description of already shipped functionality. The findings below come from the funnel source and a read-only audit of the running backend. No backend or production changes are part of this document.

## Recommendation

Use one Merger account across the website and desktop app. Joining the waitlist should create a free account, verify the person's email, and give them an account page showing their place and invitation status. That account must remain useful before they receive access and after any subscription ends.

Invite people in small, measurable batches. An invitation makes someone eligible to activate Merger; it does not start a subscription. Only their explicit completion of Stripe Checkout starts the 14-day trial, with a card required, $0 due today, then $50/month. Waiting for development must never consume trial time.

Keep the website's existing authentication and Stripe foundations. Add the missing account/admission relationship and replace the current checkout-oriented account screen with a member home that reflects each stage.

## Verified current state

| Area | What exists today | Gap to resolve |
| --- | --- | --- |
| Backend source | Production runs `merger/backend:1.25`, including migration `0017`; local/GitHub `usemerger/merger-backend` main is still `1.20` at `ba667f6`. | Obtain and commit the authoritative deployed source and migrations before building or deploying backend changes. Deploying from the older tree risks losing production fixes. |
| Accounts | Email/password signup, Argon2 password hashing, server sessions, verification/reset tokens, logout/logout-all and deletion endpoints exist. | Signup does not attach a waitlist entry. Verification currently gates public handle reservation, rather than the complete admission flow. |
| Waitlist | Case-insensitive email deduplication, role/firm, referral links, ranking, public status and operator exports exist. | Entries have no account ID, verified identity, consent record or invitation lifecycle. |
| Invitations | The operator action marks an entry `invited` and emails `/invite?code=<public referral code>`. | The funnel has no `/invite` route, so that path returns 404. Its `/alpha` page accepts any syntactically valid code. Public referral codes are not private invitation credentials. |
| Checkout | Existing Stripe alpha price, 14-day trial and hosted checkout are implemented. | The backend checks the alpha switch/price, not admission. Other new-subscription checkout paths also require admission enforcement during a closed rollout. The frontend exposes checkout from signup, account and locked downloads. |
| Conversion | Waitlist statuses include `waiting`, `invited` and `converted`. | The deployed source has no writer that marks an entry `converted`. Reinviting currently unconditionally writes `invited`, which could downgrade a later state. |
| Account website | `/login`, `/signup`, `/dashboard`, `/billing`, `/download`, `/forgot-password` and `/reset-password` exist. | The dashboard is primarily a subscription screen. There is no account-backed waitlist view or complete profile/security/preferences area. A billing read failure prevents the whole dashboard from loading. |
| Waitlist display | Returning visitors can recover status through a locally stored public referral code. | The status component ignores `invited` and `converted`, always describing the visitor as waiting. Cross-device account recovery is missing. |
| Billing reliability | Signed Stripe webhooks, entitlement storage, portal links and checkout-return polling exist. | Webhook deduplication records an event before entitlement work finishes. A later failure can cause Stripe's retry to be discarded as already processed. |
| Preview transport | The funnel already calls same-origin `/api` paths through a Next.js rewrite. | The deployed middleware still rejects an unapproved browser `Origin`; preview POSTs return `403 origin_not_allowed`. A rewrite alone does not resolve that policy. |

These observations supersede conflicting descriptions in the supplied integration contract. In particular, invite gating, conversion tracking and preview POST compatibility are not complete today.

## Proposed account lifecycle

1. **Create account and request access.** Collect name, email and password, with a short explanation that joining is free. Persist acceptance of the applicable terms/privacy notice and record optional marketing consent separately. Role, firm, operating system and desired messaging channels can follow as a short onboarding step. Avoid collecting a card at this stage.
2. **Verify email.** Show a clear verification screen with resend and recovery. Allow the person to sign in to that restricted account screen while unverified. Require verified identity before attaching an old waitlist record, accepting an invitation, starting a trial or receiving product access.
3. **Wait.** The account overview shows “You're on the waitlist,” the actual referral rank/count, referral link, platform readiness and what happens next. It explicitly says no subscription or trial has started. Do not promise a release date or interpret rank as a guaranteed activation date.
4. **Receive an invitation.** Email a private, account-bound activation link and show the same invitation inside the signed-in account. The page handles signed-out, wrong-account, expired, revoked and already-accepted cases without losing context.
5. **Accept and activate.** Display platform availability and the complete trial/billing terms. The user explicitly chooses to start their trial. The backend checks verification and admission before creating Checkout; the browser cannot grant access through a query parameter or localStorage.
6. **Confirm access.** After Stripe returns, wait for server-confirmed entitlement. Show a recoverable processing state if the webhook is delayed. Once confirmed, take the person to the appropriate download and installation instructions.
7. **Use Merger.** The website and app use the same account. Show trial end, renewal amount/date, downloads, first-channel onboarding and support. The website remains available if app access expires so the person can manage billing, export/request data and get help.

For existing subscribers and complimentary accounts, retain their legitimate access. The admission migration must not send them back to the waitlist or create another subscription.

## Separate identity, admission and billing

Do not overload one `status` field to mean all three. A person can have a verified account, accepted admission and a canceled subscription at the same time.

| Domain | Proposed responsibility |
| --- | --- |
| Identity | User ID, verified email, profile, credentials/sessions and deletion state. |
| Waitlist/admission | Request date, linked user, preserved referral attribution, waiting/invited/accepted state, cohort, invitation expiry/revocation and administrative audit events. |
| Billing | Stripe customer/subscription IDs, trial/active/past-due/canceled state, price terms, dates and server-confirmed entitlement. |
| Product readiness | Account provisioning, installer/platform eligibility and onboarding progress. Failures here need a retryable state rather than another signup. |

Compute effective app access on the server from the supported admission and entitlement rules, including existing complimentary exceptions. Public waitlist status and referral codes may describe queue position; neither can authorize account access or checkout.

Provisioning a messaging account currently happens during signup. Consider moving that work to admitted onboarding so every unverified waitlist lead does not create a Matrix account. Any change needs an idempotent provisioning job, explicit failure/retry state and migration compatibility with current users.

## Existing waitlist members

Keep all existing entries and their original join dates/referral credit. When someone creates or signs into an account and verifies the matching email, attach that entry to their user ID in an idempotent transaction. Do not create a fresh position and do not use possession of the shareable referral code as identity proof.

Provide a “Already on the waitlist?” route into sign-in/account creation and explain that their place is preserved. Handle existing Merger accounts, unfinished verification, changed email and duplicate historical records deliberately. Legacy invitation links should lead to a recovery/claim page after verification; they should not become authentication credentials.

## Website pages

| Surface | Purpose |
| --- | --- |
| Marketing homepage | Explain messaging, Deal Desk and documents; one clear “Join the waitlist” action and a visible Sign in link. |
| Signup and sign-in | Create/recover the same Merger account used on desktop; preserve safe return paths and invitation context. |
| Verification and recovery | Clear email-verification progress, resend, password reset and expired-link recovery. |
| Account overview (`/dashboard`) | One prominent next action based on actual state: verify, wait, accept invitation, finish activation or download. Account information should still load if billing is temporarily unavailable. |
| Waitlist/referrals | Live server rank/count, share link, readiness preferences and invitation status. Can be a dashboard section initially. |
| Invitation (`/invite`) | Canonical route matching backend emails, with a private expiring credential and account-bound acceptance. Retain a compatibility route for `/alpha` while links are migrated. |
| Subscription (`/billing`) | Trial expiry, current price, next payment/access date and a Stripe Portal button for card details, invoices and cancellation. Waiting users see “No subscription started,” not an open checkout offer. |
| Downloads (`/download`) | Eligible platform/version, installation help, release notes and a clear path back to the next required activation step. Use backend entitlement, not status labels or query parameters. |
| Profile and security | Name, email-verification/change flow, password, session management, notification preferences and deletion request/action. Reuse backend capabilities where they exist. |
| Help and product updates | Support, known issues, release notes and onboarding instructions, plus Terms and Privacy. |

Use the Singularity visual language for branding and transitions, with quiet, readable account forms. Billing, passwords and installation steps should remain stable and easy to scan.

## Operating the rollout

Build a staff-only queue view backed by server authorization. Never ship the existing admin bearer token in browser code. Staff should be able to filter by verified account, operating system, channel needs and cohort; preview a batch; invite/resend/revoke; and inspect email/activation failures.

Start with a small group that fits the platforms and channels ready for use. Expand based on activation success, crashes, connection reliability and support load. Use signup date and referrals as priority signals, while explaining that compatibility/readiness can affect the next cohort. Avoid presenting an exact rank as a strict FIFO promise if staff will make those exceptions.

**Suggested policy:** invitations expire after seven days, with one reminder before expiry and an explicit way to request another invitation. Expiry does not delete the account or original waitlist history. This is a proposed operating choice, not current behavior.

Each invitation should have a separately generated high-entropy credential stored as a hash, a recipient/user binding, creation/expiry times, and accepted/revoked state. Reissue invalidates the old credential. Acceptance must be idempotent and must not downgrade an already activated person. Email delivery should use a retryable job/outbox and preserve a visible failure state for staff.

Track the sequence: eligible → invited → delivered → accepted → checkout completed → entitled → installed/first app sign-in → first channel connected. Keep waitlist conversion distinct from ongoing subscription health. Capture enough operational events to diagnose failures without logging passwords, session secrets, invitation credentials or message content.

## Billing and reliability requirements

- Reuse Stripe Checkout and Customer Portal. Do not build custom card storage, invoice or cancellation forms.
- Start the trial only through explicit invited-user checkout. Show the same 14 days, $0 today and $50/month terms on the invitation, checkout entry and account pages. The alpha rate remains conditional on the agreed active-membership policy.
- Authorize every new-subscription checkout route on the server during the closed rollout, including requests that omit the frontend's alpha flag. Preserve portal access and existing members' legitimate billing actions.
- Use idempotent checkout creation and prevent duplicate subscriptions. Invitation acceptance and billing completion are separate transitions.
- Make webhook processing retry-safe: validate signatures, track in-progress/processed outcomes, commit successful entitlement work before treating the event as complete, and handle duplicate/out-of-order events. Add reconciliation for missed or failed deliveries.
- Mark conversion from authoritative billing/activation processing, never from the browser's `checkout=success` parameter. Preserve accepted admission if checkout is abandoned so the person can safely resume under the invitation policy.
- Keep downloads and app APIs governed by server entitlement, including trial expiration, payment grace, cancellation and complimentary access.
- Configure an explicitly trusted staging/preview origin and environment. Keep production origin checks; do not add a blanket Vercel wildcard or remove protections to make preview testing work. Use isolated test accounts, test billing and test email delivery for end-to-end checks.

## Implementation order

1. **Restore a trustworthy source baseline.** Reconcile deployed backend 1.25 with GitHub, migration history and configuration names. Establish staging and a documented promotion/rollback path.
2. **Agree on and implement the backend contract.** Add account-linked waitlist/admission, verified-email association, private invitation lifecycle, server checkout admission and correct conversion handling. Harden webhook/job retry behavior.
3. **Build the account-backed public flow.** Connect signup/verification to waitlist enrollment; preserve existing members; fix the canonical invite route; remove unadmitted checkout entry points; make dashboard states authoritative.
4. **Finish account and download UX.** Separate overview from billing failures, add profile/security/preferences, retain Stripe Portal and make installation/onboarding clear.
5. **Add operator rollout controls.** Cohorts, batch preview, resend/revoke, delivery status and activation reporting, with audit history and server-only authorization.
6. **Validate on staging, then launch a small cohort.** Review the complete customer journey and operational recovery before increasing admissions. Preview work does not itself authorize production promotion or outreach.

## Acceptance tests

- New account: signup → verification → one waitlist entry; no card, subscription, trial or product entitlement while waiting.
- Returning account: same waitlist state on another browser/device; localStorage is optional presentation state, never the account authority.
- Existing waitlist: verified matching email attaches the original entry, date and referrals exactly once; unverified/wrong-email accounts cannot claim it.
- Invitation: correct link route; valid, expired, revoked, reissued, wrong-account and already-used states; duplicate clicks do not create extra acceptance or downgrade state.
- Admission: uninvited accounts cannot start any new subscription by calling checkout directly or editing client state; existing entitled/complimentary users retain intended access.
- Checkout: $0 today, 14-day trial and $50/month verified in Stripe test mode; abandoned checkout resumes safely; duplicate requests create no duplicate subscription.
- Webhooks: delayed, failed, duplicate and out-of-order events reconcile correctly; failure after event receipt can be retried; conversion is recorded once from an authoritative result.
- Account/billing: pending confirmation, active trial, approaching renewal, failed payment, scheduled cancellation, expired access and billing outage each have a usable next step.
- Downloads/app: only eligible accounts receive access; correct supported installer/version; app sign-in uses the same identity; provisioning failures are recoverable.
- Email/operator: batch preview and authorization, delivery failure/retry, one reminder, expiry, resend/revoke and audit history; no admin secret or private token in the client bundle/logs.
- Preview/mobile/accessibility: same-origin transport with the actual allowed Origin; test environments remain isolated; keyboard navigation, error focus, readable forms and reduced-motion behavior.

Existing tests for auth recovery, entitlement polling, safe redirects, download errors and waitlist referrals are reusable. Replace the obsolete assertion that the join flow has no invitation gate, then add integration tests for the new lifecycle rather than relying only on mocked UI responses.
