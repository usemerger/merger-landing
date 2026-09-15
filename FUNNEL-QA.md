# Merger funnel: soft-launch review

Updated September 14, 2026.

> **SUPERSEDED on September 15, 2026, for everything about the offer and the
> billing API.** This document describes a 14-day trial at $50/month, gated on
> `GET /api/billing/offers`. None of that exists: the offers route returns 404
> and always did, and the alpha is now free with a card on file, converting to
> a 50% member rate ($49.99 against a $99.99 list price), invite-only. The
> checkout contract as built is in [`docs/alpha-checkout-contract.md`](docs/alpha-checkout-contract.md).
>
> Kept as-is below rather than rewritten — it is the record of what was tested
> on the 14th, and editing it to agree with today would destroy that.

## Offer and account behavior

- One public offer: **14 days free, then $50 USD/month**, one person. The trial starts on completion of Stripe Checkout; a card is required for automatic billing after the trial. Cancel before the trial ends to avoid the first subscription charge. No coupon. Creating an account is free.
- Alpha subscribers retain the rate while the subscription continues. A canceled subscription that has ended does not preserve the price for a future subscription.
- The backend must explicitly advertise the exact offer as available. Missing, old, or mismatched pricing disables checkout instead of selecting another price.
- Existing subscriptions display their actual recurring subtotal, including known discounts and seat quantities. Complimentary accounts remain separate from paid alpha subscriptions.

## Implemented

- Rebuilt landing page with responsive navigation, self-hosted fonts, consistent typography, shared pricing copy, clear Windows availability, and an interactive illustration labeled as sample data.
- Removed obsolete $79, free-year, percentage-discount, immediate-charge, and unsupported platform/integration promises. The shared offer consistently includes the approved 14-day trial.
- Signup validates email/password/handle, preserves a partially created account, and offers email-verification recovery. Payment requires a separate explicit checkout action.
- Sign-in preserves safe account/download/checkout return paths and resumes an existing session. Sign-out redirects only after success and supports retry on failure.
- Password recovery gives neutral email confirmation. Reset links are single-use; success, expiration, and retry states are accessible. Reset pages use no-referrer and noindex headers.
- Billing waits for server-confirmed entitlement, polls sequentially for delayed payment confirmation, and offers manual retries. Past-due and pending accounts are not offered duplicate subscriptions.
- Active trials show the actual end date and automatic billing notice; canceled trials explain that no first subscription charge is due. Backend trial reminders skip canceled or ended trials and use known recurring pricing, with a Billing link when an amount cannot be resolved.
- Downloads distinguish subscription restrictions, generic errors, missing installers, and valid installer links.
- Added support, privacy, alpha terms, and a useful 404 page. These are reviewable product copy, not a claim of completed legal review.
- Added API request timeouts, safe hosted-billing redirects, human-readable errors, and duplicate-submit guards.
- Updated vulnerable transitive build/image dependencies; npm audit reports zero vulnerabilities.

## Verification

- `npm test`: **43 frontend tests + 4 local HTTP fixture tests passed** after the 14-day-trial correction, including rejection of a zero-day offer, trial access, and cancellation copy.
- `npm run build`: production build passed, including all account and informational routes.
- `npm audit --omit=dev`: zero vulnerabilities.
- `git diff --check`: passed.
- Companion backend branch: **49 tests passed**, including 21 tests against disposable PostgreSQL and FastAPI, 18 offer/entitlement tests, and 10 notification/date tests. These cover 14-day access, conversion to $50/month, cancellation, stale checkout terms, retries, and accurate trial reminders. Stripe, Matrix, email delivery, and installer discovery were mocked; no real charges or emails were sent.

Browser walkthrough used the actual Next frontend with a loopback-only synthetic API. Verified:

1. Landing anchors, mobile menu open/close, sample deal review and filing feedback.
2. Mobile signup, invalid email, unavailable handle, and completion using the saved account.
3. Consistent 14-day free trial followed by $50/month terms and recoverable checkout failure.
4. Sign-out, wrong-password feedback, successful sign-in.
5. Password-recovery confirmation and reset-success screen with a synthetic token.
6. Actual account layouts for active, scheduled cancellation, past-due, complimentary, and payment-pending states.
7. Delayed confirmation reaching the active state and unlocking downloads in the same page after a retry.
8. Portal failure feedback; missing-installer recovery and a populated installer view. The populated link was synthetic and was not downloaded.
9. Terms, privacy, support, and 404 recovery links. No horizontal overflow at the inspected desktop and 390px mobile breakpoints.
10. After the trial correction: active trial end date, automatic billing notice, trial management, and download access; scheduled trial cancellation with no first-charge notice; mobile trial checkout failure recovery. Desktop and mobile pricing layouts were inspected again, with no horizontal overflow at 390px.

The browser test did not make a real payment, enter card details, change a real password, or send a message. Live email delivery and a real Stripe test-mode payment/webhook round trip remain launch verification tasks.

## Review locally

Hosted review preview: https://merger-landing-3bk39ijw0-merger1.vercel.app (Vercel sign-in required). Deployment `dpl_287qWrk9v4qCcc6jegqMs9kNiTbD` built successfully and is READY. Authenticated CLI checks returned landing 200 with the 14-day trial, automatic $50/month billing, and card-required disclosures; signed-out `/api/auth/me` returned 401. The previous preview also verified reset page 200 with `no-referrer` and `noindex, nofollow` headers; those settings are unchanged. Visual walkthroughs were completed on the identical local source.

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

The companion backend work is in `backend-funnel`, branch `codex/funnel-account-billing`. Read its `BILLING-FUNNEL.md` for the API contract and migrations 0016 and 0017. Checkout attempts and reusable Stripe sessions must match the current trial terms; an older unresolved checkout cannot silently be reused with different terms.

Production currently has no dedicated `STRIPE_PRICE_ALPHA` and no Customer Portal configuration. Prepare a fixed active $50 USD monthly price and a default portal with cancellation at period end, payment-method updates, and invoices. The backend adds the 14-day trial when it creates the subscription. Confirm real webhook delivery for trial start, conversion, and cancellation. Roll out backend and frontend together; legacy plan-only requests receive `offer_changed` rather than a checkout with different terms.

The production site, pricing configuration, and existing subscriptions have not been changed by this work. A Vercel review preview uses the existing production API unless an alternative API origin is configured; its account requests are real, while the local QA environment above is entirely synthetic. Checkout on the review preview remains unavailable until the companion billing contract is deployed and configured.

The user confirmed a **two-week free trial followed by $50/month** on September 14. The funnel, account pages, terms, and backend offer now use this policy. Production activation remains separate from this preview correction.

Implementation references: [Stripe fixed-price Checkout](https://docs.stripe.com/payments/checkout/build-subscriptions), [Stripe Checkout free trials](https://docs.stripe.com/payments/checkout/free-trials), [Stripe customer cancellation](https://docs.stripe.com/billing/subscriptions/cancel), [FTC subscription disclosures and cancellation guidance](https://www.ftc.gov/business-guidance/blog/2018/07/time-rosca-recap-ftc-says-risk-free-trial-was-risky-not-free). These informed clear pricing and cancellation controls; they are not a legal-compliance certification.
