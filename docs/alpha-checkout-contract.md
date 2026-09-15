# The alpha checkout contract, as built

This replaces `BACKEND-PROMPT-alpha-offer.md`, which asked for two things that
were never built and are not coming: a `GET /api/billing/offers` route, and a
checkout that accepts `{"offer":"alpha"}`. The backend went a different way and
the funnel is now wired to what actually exists.

## Verified live

Against `https://api.buildmerger.com`, unauthenticated, 2026-09-15:

```
GET  /api/billing/offers    404  {"detail":"Not Found"}   <- not a route, never was
GET  /api/billing/status    401  {"error":"unauthorized"} <- exists, auth-gated
POST /api/billing/checkout  401  {"error":"unauthorized"} <- exists, auth-gated
GET  /api/auth/me           401  {"error":"unauthorized"}
```

The 404 next to three 401s is the whole point: the missing route is genuinely
missing, not refusing an anonymous caller.

## `POST /api/billing/checkout`

Same-origin, through the `/api` rewrite in `next.config.js`, with
`credentials: 'include'` so the backend's `SameSite=Lax` session cookie is a
first-party cookie and travels.

```jsonc
POST /api/billing/checkout
Content-Type: application/json
{ "plan": "operator", "alpha": true }
```

| status | body | what the funnel does |
|---|---|---|
| 200 | `{"url":"https://checkout.stripe.com/c/pay/cs_..."}` | redirect the browser to `url` |
| 403 | closed-window code (see below) | the closed-alpha panel, with a waitlist path |
| 401 | `{"error":"unauthorized"}` | sign in, then resume on the same page |
| 400 | `{"error":"alpha_is_operator_only"}` | only if `plan != "operator"`, which this client never sends |
| 503 | `{"error":"alpha_not_configured"}` | "not available right now", no retry button |
| 502 | `{"error":"billing_provider_error"}` | transient — offer Try again |

**`url` is the only field read.** No Stripe.js, no session id, no client
secret. `stripeRedirectURL` in `app/lib/authFlow.js` refuses anything that is
not an `https://checkout.stripe.com` or `https://billing.stripe.com` URL with
no embedded credentials, so a malformed provider response fails on this page
instead of navigating somewhere unexpected.

## Plan discovery

There is none, because there is no endpoint for it. The plan copy is hardcoded
in `app/lib/billingOffer.js` and the only live billing read is
`GET /api/billing/status`, which answers for an account with no entitlement.

**The page is never blocked on a billing call.** The previous build gated the
Join button on the offers response and compared nine of its fields with `===`;
since that route is a 404, the gate could never open and the button was
permanently disabled behind "We could not check billing availability." Nothing
may gate it again.

## Signup is open — there is no allowlist

`not_on_alpha_list` is gone. Anyone with an account can reach Stripe Checkout.

What can still refuse a well-formed request is the alpha window being shut.
**The exact code for that cannot be confirmed from outside**: the deployed
OpenAPI schema types the request body and nothing else, so error bodies are
undocumented. The client therefore matches on behaviour as well as name —
**any 403 is treated as a closed window**, since with the allowlist gone a 403
can no longer mean anything else — and recognises `alpha_closed`,
`alpha_ended`, `alpha_full`, `alpha_not_open`, `alpha_unavailable` by name for
a more precise message. `alpha_not_configured` (503) lands in the same calm
state: a different cause, the same fact for the reader.

## Return URLs

The backend builds them, and they come back to this app:

```
https://usemerger.com/billing?checkout=success
https://usemerger.com/billing?checkout=cancelled
```

`/billing` renders the account dashboard. On `success` it polls
`GET /api/billing/status` until `entitled` is true — trialing counts, and the
backend folds that in — then routes to `/download`. On `cancelled` it says
nothing was charged and shows the offer again. Neither is an error state.

## The offer, in words

**$50 USD/month, with the first two weeks free.** A card is required at
checkout and $0 is charged today; billing starts when the 14-day trial ends,
and cancelling before then means no charge at all. **Alpha members keep $50/month
for life** — the rate holds after Merger leaves alpha and the price rises.
Open to anyone.

Nothing in the funnel may say "invite-only", "50% off", "$99.99" or "$79".
Those described two retired offers, and `tests/api.test.js` fails if any of
them come back.

## Request shape, confirmed from the deployed schema

`GET https://api.buildmerger.com/openapi.json` →

```jsonc
"CheckoutBody": {
  "properties": {
    "plan":  { "type": "string" },            // required
    "seats": { "anyOf": [{"type":"integer"},{"type":"null"}] },
    "alpha": { "type": "boolean", "default": false }
  },
  "required": ["plan"]
}
```

No `offer` field exists. The client sends `{plan:'operator', alpha:true}` and
nothing else.
