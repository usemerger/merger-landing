'use client';
import {useState,useEffect} from 'react';
import {ALPHA_OFFER,ANNUAL_OFFER,offerTerms} from '../lib/billingOffer';
import {captureRef} from '../lib/waitlist';

export default function Purchase(){
 const [interval,setInterval]=useState('month'),[ref,setRef]=useState(null);
 useEffect(()=>{setRef(captureRef());},[]);
 const terms=offerTerms(interval);
 return <div className="offer-purchase">
  <h3>Choose how you make it yours.</h3><p>Messaging, Deal Desk, and Rolodex included.</p>
  <fieldset className="offer-options"><legend>Compare membership billing</legend>
   {[{value:'month',name:'Monthly',price:ALPHA_OFFER.priceLabel,total:ALPHA_OFFER.priceLabel,period:'monthly',saving:'Monthly flexibility'},
    {value:'year',name:'Annual',price:ANNUAL_OFFER.monthlyEquivalentLabel,total:ANNUAL_OFFER.priceLabel,period:'yearly',saving:ANNUAL_OFFER.savingsLabel}].map(plan=><label className="offer-option" key={plan.value}>
     <input type="radio" name="billing-interval" value={plan.value} checked={interval===plan.value} onChange={()=>setInterval(plan.value)} aria-label={`${plan.name} membership, ${plan.total} billed ${plan.period}`}/>
     <span className="offer-option-top">{plan.name}<span className="offer-option-dot" aria-hidden="true"/></span>
     <span className="offer-option-price">{plan.price}<small>/mo</small></span>
     <span className="offer-option-period">USD · {plan.total} billed {plan.period}</span><span className="offer-option-saving">{plan.saving}</span>
    </label>)}
  </fieldset>
  <p className="offer-billing" aria-live="polite" aria-atomic="true">{terms.billingNotice}</p>
  <a className="offer-cta" href={'/signup'+(ref?`?ref=${encodeURIComponent(ref)}`:'')}><span>Make Merger yours</span><span aria-hidden="true">↗</span></a>
  <p className="offer-checkout-note">Create your free account, then choose your final plan at checkout.</p>
  <div className="offer-founder"><p><strong>Your alpha rate. Locked in.</strong>{terms.rateNotice}</p></div>
 </div>;
}
