// The alpha offer, in one place.
//
// THE MODEL, because every string below depends on it:
//
//   · $50 a month.
//   · The first two weeks are free. A card is collected at checkout — Stripe
//     requires one to start the trial — and $0 is charged today.
//   · Cancel any time before the trial ends and there is no first charge.
//   · Alpha members keep $50/month FOR LIFE. When Merger leaves alpha and
//     the price rises, people who joined during the alpha stay at $50 for as
//     long as their membership is active.
//   · OPEN. Anyone can join. There is no allowlist and no invite.
//
// Nothing here may say "invite-only", "50% off", "$99.99" or "$79": those
// described two earlier offers, both retired. A funnel that quotes a price the
// backend will not charge is worse than one that quotes nothing, so the copy
// and the tests that guard it live together.
//
// THERE IS NO OFFERS ENDPOINT. `/api/billing/offers` returns 404 and is not a
// route. Plan copy is hardcoded here; the only live billing read is
// `GET /api/billing/status`, which an unentitled account can read.

export const ALPHA_OFFER = Object.freeze({
  /**
   * The plan the backend bills, and the only value its checkout accepts
   * alongside `alpha: true`. Confirmed against the deployed OpenAPI schema:
   * CheckoutBody { plan (required), seats, alpha = false }. Any other plan
   * with alpha:true is refused with 400 alpha_is_operator_only, so the client
   * never sends one.
   */
  plan: 'operator',
  name: 'Merger Alpha',

  /** The headline price, and the period it buys. */
  priceLabel: '$50',
  intervalLabel: '/ month',

  /** What checkout collects today: a card, and nothing off it. */
  todayLabel: '$0',
  todayNote: 'due today',

  trialLabel: 'First 2 weeks free',
  trialDaysLabel: '14-day free trial',

  checkoutLabel: 'Join the alpha',
  signupHref: '/signup?offer=alpha',

  /** One line, for the places with room for exactly one. */
  summary: '$50/month · first 2 weeks free · card required, $0 today',

  /**
   * The full terms. Said wherever someone is about to hand over a card — the
   * hero, the Join panel, the confirmation, the terms page.
   */
  billingNotice:
    '$50 USD/month, and your first 2 weeks are free. A card is required to start '
    + 'the trial and $0 is charged today; billing begins when the 14-day trial ends. '
    + 'Cancel any time before then and you are never charged. Applicable tax may be added.',

  /** The reason to join now rather than later. */
  rateNotice:
    'Alpha members keep $50/month for life. When Merger leaves alpha and the price '
    + 'rises, your rate stays at $50 for as long as your membership stays active.',
});
