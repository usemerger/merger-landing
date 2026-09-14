export const ALPHA_OFFER = Object.freeze({
  id: 'alpha',
  name: 'Merger Alpha',
  amount: 5000,
  currency: 'usd',
  trialDays: 14,
  trialLabel: '14-day free trial',
  checkoutLabel: 'Start 14-day free trial',
  priceLabel: '$50',
  intervalLabel: '/ month',
  signupHref: '/signup?offer=alpha',
  billingNotice: '14 days free, then $50 USD/month automatically. Card required; no subscription charge today. Cancel before your trial ends to avoid the first charge. Applicable tax may be added.',
  rateNotice: 'Join during alpha and keep your $50/month rate while your subscription stays active. If you cancel and later return, the price available then applies.',
});

export function isAvailableAlphaOffer(data) {
  return data?.offers?.some((offer) => offer.id === 'alpha' && offer.available === true
    && offer.amount === 5000 && offer.currency === 'usd' && offer.interval === 'month'
    && offer.intervalCount === 1 && offer.perSeat === false && offer.trialDays === ALPHA_OFFER.trialDays
    && offer.priceLockedWhileSubscribed === true) === true;
}
