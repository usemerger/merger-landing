# Merger funnel: soft-launch review

Updated September 14, 2026.

## Offer and account behavior

- One public offer: **$50 USD/month**, one person, charged only on completion of Stripe Checkout. No trial or coupon. Creating an account is free.
- Alpha subscribers retain the rate while the subscription continues. A canceled subscription that has ended does not preserve the price for a future subscription.
- The backend must explicitly advertise the exact offer as available. Missing, old, or mismatched pricing disables checkout instead of selecting another price.
- Existing subscriptions display their actual recurring subtotal, including known discounts and seat quantities. Complimentary accounts remain separate from paid alpha subscriptions.

## Implemented

- Rebuilt landing page with responsive navigation, self-hosted fonts, consistent typography, shared pricing copy, clear Windows availability, and an interactive illustration labeled as sample data.
- Removed obsolete $79, 14-day-trial, free-year, percentage-discount, and unsupported platform/integration promises.
- Signup validates email/password/handle, preserves a partially created account, and offers email-verification recovery. Payment requires a separate explicit checkout action.
- Sign-in preserves safe account/download/checkout return paths and resumes an existing session. Sign-out redirects only after success and supports retry on failure.
- Password recovery gives neutral email confirmation. Reset links are single-use; success, expiration, and retry states are accessible. Reset pages use no-referrer and noindex headers.
- Billing waits for server-confirmed entitlement, polls sequentially for delayed payment confirmation, and offers manual retries. Past-due and pending accounts are not offered duplicate subscriptions.
- Downloads distinguish subscription restrictions, generic errors, missing installers, and valid installer links.
- Added support, privacy, alpha terms, and a useful 404 page. These are reviewable product copy, not a claim of completed legal review.
- Added API request timeouts, safe hosted-billing redirects, human-readable errors, and duplicate-submit guards.
- Updated vulnerable transitive build/image dependencies; npm audit reports zero vulnerabilities.

## Verification

- `npm test`: **40 frontend tests + 4 local HTTP fixture tests passed**.
- `npm run build`: production build passed, including all account and informational routes.
- `npm audit --omit=dev`: zero vulnerabilities.
- `git diff --check`: passed.
- Companion backend branch: **30 tests passed**, including 15 tests against disposable PostgreSQL and FastAPI. Stripe, Matrix, email delivery, and installer discovery were mocked; no real charges or emails were sent.

Browser walkthrough used the actual Next frontend with a loopback-only synthetic API. Verified:

1. Landing anchors, mobile menu open/close, sample deal review and filing feedback.
2. Mobile signup, invalid email, unavailable handle, and completion using the saved account.
3. Consistent $50 checkout terms and recoverable checkout failure.
4. Sign-out, wrong-password feedback, successful sign-in.
5. Password-recovery confirmation and reset-success screen with a synthetic token.
6. Actual account layouts for active, scheduled cancellation, past-due, complimentary, and payment-pending states.
7. Delayed confirmation reaching the active state and unlocking downloads in the same page after a retry.
8. Portal failure feedback; missing-installer recovery and a populated installer view. The populated link was synthetic and was not downloaded.
9. Terms, privacy, support, and 404 recovery links. No horizontal overflow at the inspected desktop and 390px mobile breakpoints.

The browser test did not make a real payment, enter card details, change a real password, or send a message. Live email delivery and a real Stripe test-mode payment/webhook round trip remain launch verification tasks.

## Review locally

Hosted review preview: https://merger-landing-prhpox4ln-merger1.vercel.app (Vercel sign-in required). Deployment `dpl_6zZFCdemsXjxSadkeNHSCVHBfVuP` built successfully and is READY. Authenticated CLI checks returned landing 200, signed-out `/api/auth/me` 401, and reset page 200 with `no-referrer` and `noindex, nofollow` headers. The in-app browser reached the Vercel sign-in gate; visual walkthroughs were completed on the identical local source.

```powershell
npm install
npm run qa:api
```

In a second terminal:

```powershell
$env:MERGER_API_ORIGIN='http://127.0.0.1:5191'
npm run dev -- --hostname 127.0.0.1 --port 3012
```

Open `http://127.0.0.1:5191/qa` to select synthetic account states, then use the site normally at port 3012. Test credentials are shown on that control page. Fixture code is excluded from Vercel deployments.

## Before production activation

The companion backend work is in `backend-funnel`, branch `codex/funnel-account-billing`. Read its `BILLING-FUNNEL.md` for the API contract and migration 0016.

Production currently has no dedicated `STRIPE_PRICE_ALPHA` and no Customer Portal configuration. Prepare a fixed active $50 USD monthly price and a default portal with cancellation at period end, payment-method updates, and invoices. Confirm real webhook delivery. Roll out backend and frontend together; legacy clients advertising a trial receive `offer_changed` rather than an immediate-charge checkout.

The production site, pricing configuration, and existing subscriptions have not been changed by this work. A Vercel review preview uses the existing production API unless an alternative API origin is configured; its account requests are real, while the local QA environment above is entirely synthetic. Checkout on the review preview remains unavailable until the companion billing contract is deployed and configured.

Review the new terms/privacy copy and the immediate-charge offer before activation. The pending pricing preference was implemented as $50 charged at checkout; it can be changed before launch if a trial is desired.

Implementation references: [Stripe fixed-price Checkout](https://docs.stripe.com/payments/checkout/build-subscriptions), [Stripe customer cancellation](https://docs.stripe.com/billing/subscriptions/cancel), [FTC subscription disclosures and cancellation guidance](https://www.ftc.gov/business-guidance/blog/2018/07/time-rosca-recap-ftc-says-risk-free-trial-was-risky-not-free). These informed clear pricing and cancellation controls; they are not a legal-compliance certification.
