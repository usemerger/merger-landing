// The alpha offer, in one place.
//
// THERE IS NO OFFERS ENDPOINT. `/api/billing/offers` returns 404 — verified
// against api.buildmerger.com — and it is not coming. The funnel used to call
// it before enabling the Join button, comparing nine fields with `===`; that
// gate is gone, along with the route. Plan copy is hardcoded here and the only
// live billing read is `GET /api/billing/status`, which an unentitled account
// can read.
//
// WHAT THE ALPHA ACTUALLY IS, because every string below depends on it:
//
//   · Free while the alpha runs. A card is required at checkout — Stripe
//     collects it — and $0 is charged today.
//   · When the alpha ends, members keep HALF PRICE: $49.99/month against a
//     $99.99 list price, for as long as they stay a member.
//   · Invite-only. Checkout answers 403 not_on_alpha_list for anyone who is
//     not on the list, and that is the ordinary answer, not a failure.
//
// There is no trial. Nothing here may say "14 days" or "$50/month" — those
// described an offer that no longer exists, and a funnel that quotes a price
// the backend will not charge is worse than one that quotes nothing.

export const ALPHA_OFFER = Object.freeze({
  /**
   * The plan the backend bills, and the only value its checkout accepts
   * alongside `alpha: true` — anything else is refused with
   * 400 alpha_is_operator_only, so the client never sends anything else.
   */
  plan: 'operator',
  name: 'Merger Alpha',

  /** What checkout collects today. The card is taken; the amount is zero. */
  todayLabel: '$0',
  todayNote: 'due today',

  /** After the alpha: the member rate, and the list price it is half of. */
  memberPrice: '$49.99',
  listPrice: '$99.99',
  intervalLabel: '/ month',

  checkoutLabel: 'Join the alpha',
  signupHref: '/signup?offer=alpha',

  /** One line, for places with room for exactly one. */
  summary: 'Free during the alpha · card required, $0 today · invite-only',

  /**
   * The full terms. Said wherever someone is about to hand over a card: the
   * hero, the Join panel, the confirmation, the terms page.
   */
  billingNotice:
    'Free during the alpha — a card is required and $0 is charged today. '
    + 'When the alpha ends, members keep 50% off: $49.99 USD/month instead of $99.99, '
    + 'for as long as you stay a Merger member. Applicable tax may be added.',

  /** Why the discount is worth having, separately from what it costs. */
  rateNotice:
    'Your 50% member rate holds for as long as your Merger membership stays active. '
    + 'If you cancel and come back later, the price available then applies.',

  inviteNotice: 'The alpha is invite-only.',
});
