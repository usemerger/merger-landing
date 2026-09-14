'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { billingOffers, checkout, errorMessage } from '../lib/api';
import { ALPHA_OFFER, isAvailableAlphaOffer } from '../lib/billingOffer';
import { stripeRedirectURL } from '../lib/authFlow';

export function useStartCheckout() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [authExpired, setAuthExpired] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    const restore = () => { submitting.current = false; setBusy(false); };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);
  const start = useCallback(async () => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    setAuthExpired(false);
    try {
      const offers = await billingOffers();
      if (!isAvailableAlphaOffer(offers)) {
        setError('Paid signup is temporarily unavailable. Your account is saved; please try again later.');
        submitting.current = false;
        setBusy(false);
        return;
      }
      const result = await checkout();
      window.location.assign(stripeRedirectURL(result?.url));
    } catch (err) {
      setAuthExpired(err?.status === 401);
      setError(errorMessage(err));
      submitting.current = false;
      setBusy(false);
    }
  }, []);
  return { plan: 'alpha', seats: 1, busy, error, authExpired, start };
}

export default function PlanStep({ ctl, heading = 'Join the alpha', note }) {
  const [availability, setAvailability] = useState('loading');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let current = true;
    setAvailability('loading');
    billingOffers().then((data) => {
      if (current) setAvailability(isAvailableAlphaOffer(data) ? 'ready' : 'unavailable');
    }).catch(() => { if (current) setAvailability('error'); });
    return () => { current = false; };
  }, [reload]);
  return (
    <section id="join-alpha" className="plan-step" aria-labelledby="alpha-heading">
      <h2 id="alpha-heading">{heading}</h2>
      {note && <p className="muted mt-16">{note}</p>}
      <div className="alpha-summary">
        <div><span className="eyebrow">Windows alpha · one person</span><h3>{ALPHA_OFFER.name}</h3></div>
        <p className="alpha-amount">{ALPHA_OFFER.priceLabel}<span>{ALPHA_OFFER.intervalLabel}</span></p>
      </div>
      <p className="muted">{ALPHA_OFFER.billingNotice}</p>
      <p className="muted mt-16">{ALPHA_OFFER.rateNotice}</p>
      <p className="field-hint mt-16">Claude requires your own Anthropic API key, with usage billed separately by Anthropic. DocuSign requires your own account. Alpha features may change.</p>
      {availability === 'loading' && <p className="field-hint mt-16" role="status">Checking checkout availability…</p>}
      {['unavailable', 'error'].includes(availability) && <div className="alert alert-warn" role="status">
        <p>{availability === 'error' ? 'We could not check billing availability.' : 'Paid signup is temporarily unavailable.'} Your account is saved.</p>
        <button className="linklike mt-16" type="button" onClick={() => setReload((x) => x + 1)}>Check again</button>{' · '}<Link href="/support">Contact support</Link>
      </div>}
      {ctl.error && <div className="alert alert-error" role="alert">{ctl.error}{ctl.authExpired && <> <Link href="/login?next=/billing">Sign in again</Link></>}</div>}
      <button className="btn btn-primary btn-block" type="button" onClick={() => ctl.start()} disabled={ctl.busy || availability !== 'ready'}>
        {ctl.busy ? 'Opening secure checkout…' : 'Continue to checkout · $50/month'}
      </button>
      <p className="field-hint center mt-16">Review and pay securely with Stripe. Creating an account does not charge you.</p>
      <p className="field-hint center mt-16"><Link href="/terms">Alpha terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/support">Help</Link></p>
    </section>
  );
}
