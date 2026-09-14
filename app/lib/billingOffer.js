export const ALPHA_OFFER = Object.freeze({
  id: 'alpha',
  name: 'Merger Alpha',
  amount: 5000,
  currency: 'usd',
  priceLabel: '$50',
  intervalLabel: '/ month',
  signupHref: '/signup?offer=alpha',
  billingNotice: '$50 USD charged at checkout, then monthly. Applicable tax may be added. Cancel through your account before renewal.',
  rateNotice: 'Join during alpha and keep your $50/month rate while your subscription stays active. If you cancel and later return, the price available then applies.',
});

export function isAvailableAlphaOffer(data) {
  return data?.offers?.some((offer) => offer.id === 'alpha' && offer.available === true
    && offer.amount === 5000 && offer.currency === 'usd' && offer.interval === 'month'
    && offer.intervalCount === 1 && offer.perSeat === false && offer.trialDays === 0
    && offer.priceLockedWhileSubscribed === true) === true;
}
