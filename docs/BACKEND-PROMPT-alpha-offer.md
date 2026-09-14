# BACKEND — the two endpoints the alpha funnel needs before it can go live

## Why this exists

The redesigned funnel is finished and sitting on `redesign/funnel-2026`, deployed
to a Vercel preview. It is **not** promoted to production, because promoting it
today would replace a checkout that works with one that cannot complete.

Production (`usemerger.com`) currently serves `main`: Operator $79 / Desk $159,
and its checkout works. The redesign is built on the alpha funnel
(`codex/funnel-soft-launch`), which talks to two endpoints the live backend does
not have yet. Both must ship **before** the funnel is promoted.

Verified against `https://api.buildmerger.com` at the time of writing:

```
GET  /api/billing/offers    404   <- route does not exist
GET  /api/billing/status    401   <- auth-protected routes 401, so the 404 above
GET  /api/auth/me           401      is genuinely a missing route, not auth
POST /api/billing/checkout  400   <- exists, but see §2
```

## §1 `GET /api/billing/offers`

The funnel calls this **before** enabling the trial button and disables checkout
unless the response matches exactly. This is the gate: if the shape is wrong the
button stays disabled and the user is told "We could not check billing
availability."

### The contract is strict — every field is compared

`app/lib/billingOffer.js` does this, and any single mismatch fails the whole check:

```js
data?.offers?.some((offer) =>
     offer.id === 'alpha'
  && offer.available === true
  && offer.amount === 5000              // cents
  && offer.currency === 'usd'
  && offer.interval === 'month'
  && offer.intervalCount === 1
  && offer.perSeat === false
  && offer.trialDays === 14
  && offer.priceLockedWhileSubscribed === true)
```

So the minimum passing response is:

```jsonc
{
  "offers": [
    {
      "id": "alpha",
      "available": true,
      "amount": 5000,
      "currency": "usd",
      "interval": "month",
      "intervalCount": 1,
      "perSeat": false,
      "trialDays": 14,
      "priceLockedWhileSubscribed": true
    }
  ]
}
```

**Types matter as much as values.** `amount` must be the number `5000`, not
`"5000"` and not `50`. `available`, `perSeat` and `priceLockedWhileSubscribed`
must be real booleans. `===` is unforgiving and the failure is silent — the
button simply never enables.

**Closing the alpha** is `available: false` (or omitting the offer). The funnel
already handles that: it shows "Trial signup is temporarily unavailable. Your
account is saved." with a retry. That is the intended lever — do not delete the
route to close signups.

**Auth:** the funnel calls this both before and after sign-in, so it should
answer for an anonymous caller too. Nothing here is per-user.

## §2 `POST /api/billing/checkout` must accept `{ "offer": "alpha" }`

The funnel now sends:

```json
{ "offer": "alpha" }
```

`main`'s client sent `{ "plan": "operator" | "desk", "seats": n }`, and the
comment in that code says an empty body returns `invalid_request` — so the
endpoint is built around `plan`. An unauthenticated POST with no body currently
answers **400**, which is consistent with body validation.

It needs to accept the `offer` form and create the alpha subscription:
$50/month with a **14-day trial**, card required, **nothing charged today**.

Keep accepting `plan` as well if anything still sends it — the funnel on `main`
is what production runs until the moment this is promoted, and it must not break
in the window between.

### `403 not_on_alpha_list`

The alpha is invite-only. When the authenticated user is not on the list, return
**403** with `{"error": "not_on_alpha_list"}` exactly. The funnel already has a
dedicated screen for this — a calm "you're not on the alpha list yet" panel with
a route to request an invite, deliberately not a red error, because the person's
account is fine and nothing they did failed. Any other code falls through to a
generic failure message instead.

## How to verify

Against the real backend, not a mock:

1. `GET /api/billing/offers` returns 200 and the object above **passes the
   `isAvailableAlphaOffer` check verbatim** — paste that function into a REPL and
   run it against the real response rather than eyeballing the JSON.
2. A user on the alpha list: `POST /api/billing/checkout {"offer":"alpha"}`
   returns a Stripe Checkout URL for a $0-today, 14-day trial, $50/month after.
3. A user **not** on the list: the same call returns **403**
   `{"error":"not_on_alpha_list"}`.
4. Flip the offer to `available: false` — the funnel's trial button disables and
   shows the "temporarily unavailable" state rather than erroring.
5. `main`'s existing `{"plan":"operator"}` call still works, so production is not
   broken before the promotion happens.

## Then, and only then

Promote `redesign/funnel-2026` to production. Until §1 and §2 are live, promoting
takes a site that can take money and turns it into one that cannot.
