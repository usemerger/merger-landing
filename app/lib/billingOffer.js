// The membership offer, in one place.
//
// THE MODEL (Nov 2026), because every string below depends on it:
//
//   · STANDARD is the public offer: $199 a month, or $1,908 a year ($159 a
//     month, 20% less than monthly), charged at checkout.
//   · Every new membership has a 30-day money-back guarantee: email support
//     within 30 days of the first payment for a full refund. It is not a
//     trial; there is no free period and no $0-today offer.
//   · THE PILOT ($50 a month or $480 a year) has closed to new people. Members
//     who joined on it keep their rate while their membership stays active,
//     and an invitation sent before the pilot closed is honored until it
//     expires. Only the account pages show it, and only when the backend says
//     this account still qualifies (rollout.offer === 'pilot').
//   · No invitation is needed to join.
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

/** THE PILOT (closed to new people; see the model above). */
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

  /** Paid up front: the first month is charged at checkout. */
  todayNote: 'due today',

  /** The guarantee that replaced the free trial (Oct 2026). */
  refundDays: 30,
  guaranteeLabel: '30-day money-back guarantee',

  checkoutLabel: 'Continue to checkout',
  /**
   * Where the "join" button goes FROM AN INVITE. The public marketing page no
   * longer points anyone here — it points at the waitlist — but the invite
   * path, the signup flow and the billing page all still need it.
   */
  signupHref: '/signup?offer=alpha',

  /** One line, for the places with room for exactly one. */
  summary: '$50/month · 30-day money-back guarantee',

  /**
   * The full terms. Said wherever someone is about to hand over a card — the
   * hero, the Join panel, the confirmation, the terms page.
   */
  billingNotice:
    '$50 USD/month, charged today when you complete checkout and then each month until you cancel. '
    + 'Every new membership has a 30-day money-back guarantee: email support@usemerger.com within 30 days '
    + 'of your first payment for a full refund. Applicable tax may be added.',

  /** The reason to join now rather than later. */
  rateNotice:
    'Your pilot rate stays at $50/month while your membership stays active, '
    + 'even though the public price is now $199/month.',
});

/**
 * ANNUAL BILLING — the same membership, paid once a year, for 20% less.
 *
 *   · $480 a year, which is $40 a month: 20% under twelve months at $50 ($600).
 *   · Paid up front: $480 is charged at checkout, with the same 30-day
 *     money-back guarantee.
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

  summary: `${annualPrice}/year · 30-day money-back guarantee`,

  billingNotice:
    `${annualPrice} USD/year, charged today when you complete checkout and then once a year until you cancel. `
    + 'Every new membership has a 30-day money-back guarantee: email support@usemerger.com within 30 days '
    + 'of your first payment for a full refund. Applicable tax may be added.',

  rateNotice:
    `Your pilot rate stays at ${annualPrice}/year while your membership stays active, `
    + 'even though the public price is now $1,908/year.',
});

/**
 * STANDARD — the public offer from Nov 2026. $199/month, or $1,908/year.
 *
 * The annual price is a decision, not arithmetic: 20% off twelve months
 * ($2,388) is $1,910.40, and NEWO chose $1,908 so the monthly equivalent is a
 * clean $159. It must match the Stripe prices the backend bills
 * (STRIPE_PRICE_STANDARD / STRIPE_PRICE_STANDARD_ANNUAL).
 */
export const STANDARD_OFFER = Object.freeze({
  plan: 'operator',
  name: 'Merger',
  priceLabel: '$199',
  intervalLabel: '/ month',
  todayNote: 'due today',
  refundDays: 30,
  guaranteeLabel: '30-day money-back guarantee',
  checkoutLabel: 'Continue to checkout',
  summary: '$199/month · 30-day money-back guarantee',
  billingNotice:
    '$199 USD/month, charged today when you complete checkout and then each month until you cancel. '
    + 'Every new membership has a 30-day money-back guarantee: email support@usemerger.com within 30 days '
    + 'of your first payment for a full refund. Applicable tax may be added.',
  rateNotice: null,
});

export const STANDARD_ANNUAL_OFFER = Object.freeze({
  interval: 'year',
  priceLabel: '$1,908',
  intervalLabel: '/ year',
  monthlyEquivalentLabel: '$159',
  monthlyTotalLabel: '$2,388',
  savingsLabel: `Save ${ANNUAL_DISCOUNT_PERCENT}%`,
  summary: '$1,908/year · 30-day money-back guarantee',
  billingNotice:
    '$1,908 USD/year, charged today when you complete checkout and then once a year until you cancel. '
    + 'Every new membership has a 30-day money-back guarantee: email support@usemerger.com within 30 days '
    + 'of your first payment for a full refund. Applicable tax may be added.',
  rateNotice: null,
});

/**
 * The price terms for an offer and a billing interval. Anything but 'year' is
 * monthly; anything but 'pilot' is Standard, so a missing or unknown offer can
 * only ever show the public price, never a lower one the server will refuse.
 */
export function offerTerms(interval, offer = 'standard') {
  const pilot = offer === 'pilot';
  const monthly = pilot ? ALPHA_OFFER : STANDARD_OFFER;
  if (interval === 'year') return { ...(pilot ? ANNUAL_OFFER : STANDARD_ANNUAL_OFFER), offer: pilot ? 'pilot' : 'standard', perLabel: '/year' };
  return {
    interval: 'month',
    offer: pilot ? 'pilot' : 'standard',
    priceLabel: monthly.priceLabel,
    intervalLabel: monthly.intervalLabel,
    summary: monthly.summary,
    billingNotice: monthly.billingNotice,
    rateNotice: monthly.rateNotice,
    perLabel: '/month',
  };
}

/**
 * The waitlist, in one place, for the same reason the offer is.
 *
 * The price strings here are DERIVED from STANDARD_OFFER rather than retyped,
 * so the public pages can never quote a different number from checkout.
 */
export const WAITLIST = Object.freeze({
  /** The public CTA, everywhere it appears. */
  cta: 'Download Merger',
  ctaShort: 'Download',
  /** The anchor the nav and the lower CTAs scroll to. */
  href: '/signup',

  eyebrow: 'Windows, Mac and iPhone · 30-day money-back guarantee',
  heading: 'Download Merger.',
  blurb: 'Create your account, choose monthly or annual, and install Merger '
    + 'on Windows, Mac, iPhone or all three. Every membership has a 30-day money-back guarantee.',

  /**
   * The reason to join now rather than later — the same promise as the offer.
   *
   * `intervalLabel` is "/ month" with a leading space, which is right beside a
   * big number in the pricing card ("$50 / month") and wrong inside a
   * sentence ("$50/ month for life"). So these read the PRICE from the offer —
   * the number that must never be retyped — and say the period in words.
   */
  hook: `${STANDARD_OFFER.priceLabel}/month, or ${STANDARD_ANNUAL_OFFER.priceLabel}/year (save ${ANNUAL_DISCOUNT_PERCENT}%).`,
  hookNote: `Seats are ${STANDARD_OFFER.priceLabel} a month, or ${STANDARD_ANNUAL_OFFER.priceLabel} a year. `
    + 'Not for you? Get a full refund within 30 days.',

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
