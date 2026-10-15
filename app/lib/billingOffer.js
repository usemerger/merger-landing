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
//   · Reached by invitation now, not from the marketing page. The public
//     front door is the waitlist (see WAITLIST below) and checkout is behind
//     /alpha?invite=. The PRICE did not change — only who reaches the button.
//
// None of the PRICE strings below may say "50% off", "$99.99" or "$79": those
// described two earlier offers, both retired, and tests/api.test.js fails if
// any of them comes back. (That test also bans the word "invite" from the
// price copy — it is guarding the retired "invite-only 50% off" framing, so
// keep how-you-get-in out of the billing strings and say it in WAITLIST.)
// A funnel that quotes a price the backend will not charge is worse than one
// that quotes nothing, so the copy and the tests that guard it live together.
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
  /**
   * Where the "join" button goes FROM AN INVITE. The public marketing page no
   * longer points anyone here — it points at the waitlist — but the invite
   * path, the signup flow and the billing page all still need it.
   */
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

/**
 * ANNUAL BILLING — the same membership, paid once a year, for 20% less.
 *
 *   · $480 a year, which is $40 a month: 20% under twelve months at $50 ($600).
 *   · The trial is the same: first two weeks free, card required, $0 today,
 *     then $480 is charged once when the 14-day trial ends.
 *   · The alpha rate promise is the same: $480/year for as long as the
 *     membership stays active.
 *
 * Every number is derived from the monthly price and the discount, so the two
 * intervals cannot drift apart.
 *
 * BACKEND DEPENDENCY. Checkout asks for this with `interval: 'year'` beside
 * the usual `{plan:'operator', alpha:true}` (see lib/api `checkout`). The
 * deployed backend has to accept that field and map it to a $480/year Stripe
 * price before this ships: see docs/alpha-checkout-contract.md.
 */
export const ANNUAL_DISCOUNT_PERCENT = 20;

const monthlyAmount = Number(ALPHA_OFFER.priceLabel.replace(/[^0-9.]/g, ''));
const annualMonthlyAmount = monthlyAmount * (100 - ANNUAL_DISCOUNT_PERCENT) / 100;
const annualAmount = annualMonthlyAmount * 12;
const usd = (amount) => `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
const annualPrice = usd(annualAmount);

export const ANNUAL_OFFER = Object.freeze({
  interval: 'year',
  priceLabel: annualPrice,
  intervalLabel: '/ year',
  /** What a year costs spread over twelve months, for the comparison. */
  monthlyEquivalentLabel: usd(annualMonthlyAmount),
  /** Twelve months at the monthly price, for the comparison. */
  monthlyTotalLabel: usd(monthlyAmount * 12),
  savingsLabel: `Save ${ANNUAL_DISCOUNT_PERCENT}%`,

  summary: `${annualPrice}/year · first 2 weeks free · card required, ${ALPHA_OFFER.todayLabel} today`,

  billingNotice:
    `${annualPrice} USD/year, and your first 2 weeks are free. A card is required to start `
    + `the trial and ${ALPHA_OFFER.todayLabel} is charged today; ${annualPrice} is billed once when the 14-day trial ends, `
    + 'then once a year. Cancel any time before then and you are never charged. Applicable tax may be added.',

  rateNotice:
    `Alpha members on annual billing keep ${annualPrice}/year for life. When Merger leaves alpha and the price `
    + `rises, your rate stays at ${annualPrice}/year for as long as your membership stays active.`,
});

/** The price terms for a billing interval. Anything but 'year' is monthly. */
export function offerTerms(interval) {
  if (interval === 'year') return { ...ANNUAL_OFFER, perLabel: '/year' };
  return {
    interval: 'month',
    priceLabel: ALPHA_OFFER.priceLabel,
    intervalLabel: ALPHA_OFFER.intervalLabel,
    summary: ALPHA_OFFER.summary,
    billingNotice: ALPHA_OFFER.billingNotice,
    rateNotice: ALPHA_OFFER.rateNotice,
    perLabel: '/month',
  };
}

/**
 * The waitlist, in one place, for the same reason the offer is.
 *
 * The price strings here are DERIVED from ALPHA_OFFER rather than retyped.
 * The whole point of the file above is that one number lives in one spot, and
 * a waitlist that promises "$50 for life" while the offer says something else
 * is exactly the failure that rule exists to prevent.
 */
export const WAITLIST = Object.freeze({
  /** The public CTA, everywhere it appears. */
  cta: 'Join the alpha waitlist',
  ctaShort: 'Join the waitlist',
  /** The anchor the nav and the lower CTAs scroll to. */
  href: '/signup',

  eyebrow: 'Windows alpha · joining in groups',
  heading: 'Get in line for the alpha.',
  blurb: 'Merger is opening to a small group at a time. Join the waitlist and we will '
    + 'email you an invite when a seat opens.',

  /**
   * The reason to join now rather than later — the same promise as the offer.
   *
   * `intervalLabel` is "/ month" with a leading space, which is right beside a
   * big number in the pricing card ("$50 / month") and wrong inside a
   * sentence ("$50/ month for life"). So these read the PRICE from the offer —
   * the number that must never be retyped — and say the period in words.
   */
  hook: `Alpha members keep ${ALPHA_OFFER.priceLabel}/month while their membership stays active.`,
  hookNote: `Seats are ${ALPHA_OFFER.priceLabel} a month with the first two weeks free. `
    + 'Nothing is charged while you are on the list, and you only pay if you accept an invite.',

  /** What moving up actually takes. */
  referPrompt: 'Refer dealmakers to move up the list.',

  /** Consent. Said in the words the privacy notice uses, not a softer version. */
  consent: 'I agree to be emailed about Merger.',

  roles: Object.freeze([
    'PE',
    'Search Fund',
    'Broker / Intermediary',
    'Family Office',
    'VC',
    'Other',
  ]),
});
