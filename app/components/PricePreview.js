'use client';

import { useState } from 'react';
import { ALPHA_OFFER, ANNUAL_OFFER } from '../lib/billingOffer';

// The public price, with a monthly / annual switch. Display only: nobody pays
// from the marketing page. The choice itself is made at checkout (PlanStep).
export default function PricePreview() {
  const [annual, setAnnual] = useState(false);
  return <>
    <div className="sf-interval" role="group" aria-label="Billing period">
      <button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button>
      <button type="button" aria-pressed={annual} onClick={() => setAnnual(true)}>Annual <em>{ANNUAL_OFFER.savingsLabel}</em></button>
    </div>
    <div className="sf-price" aria-live="polite">
      <strong>{annual ? ANNUAL_OFFER.monthlyEquivalentLabel : ALPHA_OFFER.priceLabel}</strong>
      <span>/ month<small>{annual
        ? `Billed annually at ${ANNUAL_OFFER.priceLabel}, after your invitation and 14-day free trial.`
        : 'After your invitation and 14-day free trial.'}</small></span>
    </div>
  </>;
}
