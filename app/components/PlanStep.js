'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { checkout, errorMessage } from '../lib/api';
import { ALPHA_OFFER } from '../lib/billingOffer';
import { stripeRedirectURL } from '../lib/authFlow';

// Rendered only after accountAccess grants canCheckout. The checkout endpoint
// repeats verification/admission checks; the browser cannot grant eligibility.

/** Which of the contract's replies came back. One state, not five booleans. */
const PHASE = {
  IDLE: 'idle',
  /** The alpha window is shut. Not a fault, and not the user's doing. */
  CLOSED: 'closed',
  /** 401 unauthorized — sign in, then come back here and carry on. */
  EXPIRED: 'expired',
  /** 502 billing_provider_error, and network trouble. Worth pressing again. */
  TRANSIENT: 'transient',
  /** Anything else, in plain language. */
  ERROR: 'error',
  OFFER_CHANGED: 'offer_changed',
};

const CLOSED_CODES = new Set([
  'alpha_closed', 'alpha_ended', 'alpha_full', 'alpha_not_open',
  'alpha_unavailable', 'alpha_offer_unavailable', 'alpha_not_configured',
]);

/** The contract's replies, mapped to how the page should behave. */
function phaseFor(err) {
  const { status, code } = err || {};
  if (code === 'trial_offer_changed') return PHASE.OFFER_CHANGED;
  if (CLOSED_CODES.has(code)) return PHASE.CLOSED;
  if (status === 401) return PHASE.EXPIRED;
  if (code === 'billing_provider_error' || status === 502
      || code === 'network_error' || code === 'request_timeout') return PHASE.TRANSIENT;
  return PHASE.ERROR;
}

export function useStartCheckout() {
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [message, setMessage] = useState('');
  const submitting = useRef(false);

  // Coming BACK from Stripe via the back button restores this page from the
  // bfcache with `busy` still true and the button still disabled. pageshow is
  // the only event that fires in that case.
  useEffect(() => {
    const restore = () => { submitting.current = false; setBusy(false); };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);

  const start = useCallback(async () => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setPhase(PHASE.IDLE);
    setMessage('');
    try {
      // One call. 200 carries a hosted Stripe Checkout URL and nothing else
      // worth reading; stripeRedirectURL refuses anything that is not one.
      const result = await checkout();
      window.location.assign(stripeRedirectURL(result?.url));
    } catch (err) {
      setPhase(phaseFor(err));
      setMessage(errorMessage(err));
      submitting.current = false;
      setBusy(false);
    }
  }, []);

  return { busy, phase, message, start };
}

export default function PlanStep({ ctl, heading = 'Join the alpha', note, trialEligible }) {
  const pathname = usePathname();
  // Sign in and come back to the page they were on, with the offer in front of
  // them again — not to a dashboard they then have to navigate out of.
  const resumeHref = `/login?next=${encodeURIComponent(pathname || '/billing')}`;
  const closed = ctl.phase === PHASE.CLOSED;
  const termsKnown = typeof trialEligible === 'boolean';
  const returning = trialEligible === false;
  const today = returning ? ALPHA_OFFER.priceLabel : ALPHA_OFFER.todayLabel;

  if (ctl.phase === PHASE.OFFER_CHANGED) return <section className="plan-step"><h2>Your activation terms changed.</h2><div className="alert alert-warn" role="alert"><p>{ctl.message}</p><button className="btn btn-ghost btn-sm mt-16" type="button" onClick={() => window.location.reload()}>Refresh account terms</button></div></section>;

  if (!termsKnown) return <section className="plan-step"><h2>Confirm your activation terms.</h2><p className="muted mt-16">Your account’s trial eligibility could not be confirmed. Refresh your account before continuing to checkout.</p><p className="field-hint mt-16"><Link href="/dashboard">Return to your account</Link></p></section>;

  return (
    <section id="join-alpha" className="plan-step" aria-labelledby="alpha-heading">
      <h2 id="alpha-heading">{heading}</h2>
      {note && <p className="muted mt-16">{note}</p>}

      <div className="alpha-summary">
        <div>
          <span className="eyebrow">Windows alpha · one person</span>
          <h3>{ALPHA_OFFER.name}</h3>
        </div>
        <p className="alpha-amount">{today}<span>{ALPHA_OFFER.todayNote}</span></p>
      </div>

      <p className="alpha-then">
        {returning ? 'Renews at ' : `${ALPHA_OFFER.trialLabel}, then `}<strong>{ALPHA_OFFER.priceLabel}{ALPHA_OFFER.intervalLabel}</strong>
      </p>
      <p className="muted">{returning ? `${ALPHA_OFFER.priceLabel} USD is due when you complete checkout, plus applicable tax. A card is required. Your membership renews at ${ALPHA_OFFER.priceLabel}/month until canceled. This account has had a membership before, so another free trial does not apply.` : ALPHA_OFFER.billingNotice}</p>
      <p className="muted mt-16">{returning ? `A previous alpha rate guarantee ends when that membership ends. This new membership uses the current alpha offer of ${ALPHA_OFFER.priceLabel}/month, which stays in place while this membership remains active.` : ALPHA_OFFER.rateNotice}</p>
      <p className="field-hint mt-16">Claude requires your own Anthropic API key, with usage billed separately by Anthropic. DocuSign requires your own account. Alpha features may change.</p>

      {/* THE ALPHA IS SHUT, NOT BROKEN. Admission is separate from signup; the window is
          open, so this is the one state where someone who did everything right
          still cannot join. It is a calm panel rather than a red alert, the
          Join button goes away because pressing it again would only repeat the
          same answer, and there is no second, pricier thing to sell them. */}
      {closed && <div className="alpha-gate" role="status">
        <p className="eyebrow">Closed for now</p>
        <h3>The alpha isn&rsquo;t taking new members right now</h3>
        <p className="muted">Your account is saved and nothing has been charged. The Windows
        alpha opens in groups — tell us you want in and we will come back to you when it does.</p>
        {/* There is a real waitlist now, so this stops being a mailto someone
            has to write themselves and becomes the same queue everyone else
            joins — with a position and a referral link at the end of it. */}
        <p className="field-hint mt-16">
          <Link href="/#waitlist">Join the waitlist</Link>
          {' · '}<Link href="/support">Contact support</Link>
        </p>
      </div>}

      {ctl.phase === PHASE.EXPIRED && <div className="alert alert-warn" role="alert">
        {ctl.message} <Link href={resumeHref}>Sign in and continue</Link>
      </div>}

      {ctl.phase === PHASE.TRANSIENT && <div className="alert alert-warn" role="alert">
        <p>{ctl.message}</p>
        <button className="linklike mt-16" type="button" onClick={() => ctl.start()} disabled={ctl.busy}>Try again</button>
      </div>}

      {ctl.phase === PHASE.ERROR && <div className="alert alert-error" role="alert">{ctl.message}</div>}

      {!closed && <>
        <button className="btn btn-primary btn-block" type="button" onClick={() => ctl.start()} disabled={ctl.busy}>
          {ctl.busy ? 'Opening secure checkout…' : returning ? 'Restart membership — $50/month' : ALPHA_OFFER.checkoutLabel}
        </button>
        <p className="field-hint center mt-16">Stripe collects your card securely. {returning ? `${ALPHA_OFFER.priceLabel} plus applicable tax is charged when you finish checkout. Access begins after payment is confirmed.` : `${ALPHA_OFFER.todayLabel} is charged today, and your trial starts when you finish checkout.`}</p>
      </>}

      <p className="field-hint center mt-16"><Link href="/terms">Alpha terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/support">Help</Link></p>
    </section>
  );
}
