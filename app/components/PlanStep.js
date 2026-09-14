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
  /** 403 not_on_alpha_list. A gate, not a fault — kept apart from `error` so
   *  the UI can say so calmly instead of turning red at someone who did
   *  nothing wrong. */
  const [notOnList, setNotOnList] = useState(false);
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
        setError('Trial signup is temporarily unavailable. Your account is saved; please try again later.');
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
  return { plan: 'alpha', seats: 1, busy, error, authExpired, notOnList, start };
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
        <p className="alpha-amount">$0<span>for 14 days</span></p>
      </div>
      <p className="muted">{ALPHA_OFFER.billingNotice}</p>
      <p className="muted mt-16">{ALPHA_OFFER.rateNotice}</p>
      <p className="field-hint mt-16">Claude requires your own Anthropic API key, with usage billed separately by Anthropic. DocuSign requires your own account. Alpha features may change.</p>
      {availability === 'loading' && <p className="field-hint mt-16" role="status">Checking checkout availability…</p>}
      {['unavailable', 'error'].includes(availability) && <div className="alert alert-warn" role="status">
        <p>{availability === 'error' ? 'We could not check billing availability.' : 'Trial signup is temporarily unavailable.'} Your account is saved.</p>
        <button className="linklike mt-16" type="button" onClick={() => setReload((x) => x + 1)}>Check again</button>{' · '}<Link href="/support">Contact support</Link>
      </div>}
      {/* NOT AN ERROR STATE. Being off the invite list is the expected answer
          for most people during a closed alpha: their account is real, their
          card was never asked for, and nothing they did failed. A red alert
          here would tell them to go back and fix something that is not
          broken, so this is a calm panel with the one action that helps. */}
      {ctl.notOnList && <div className="alpha-gate" role="status">
        <p className="eyebrow">Invite only, for now</p>
        <h3>You&rsquo;re not on the alpha list yet</h3>
        <p className="muted">Your account and handle are saved. The Windows alpha is
        opening in small groups, and nothing has been charged.</p>
        <p className="field-hint mt-16"><a href="mailto:support@usemerger.com?subject=Merger%20alpha%20access">Ask for an invite</a> · <Link href="/support">Contact support</Link></p>
      </div>}
      {ctl.error && <div className="alert alert-error" role="alert">{ctl.error}{ctl.authExpired && <> <Link href="/login?next=/billing">Sign in again</Link></>}</div>}
      <button className="btn btn-primary btn-block" type="button" onClick={() => ctl.start()} disabled={ctl.busy || ctl.notOnList || availability !== 'ready'}>
        {ctl.busy ? 'Opening secure checkout…' : ALPHA_OFFER.checkoutLabel}
      </button>
      <p className="field-hint center mt-16">Set up your trial securely with Stripe. Your trial starts when you finish checkout.</p>
      <p className="field-hint center mt-16"><Link href="/terms">Alpha terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/support">Help</Link></p>
    </section>
  );
}
