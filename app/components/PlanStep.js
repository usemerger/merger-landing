'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { checkout, errorMessage } from '../lib/api';
import { ALPHA_OFFER } from '../lib/billingOffer';
import { stripeRedirectURL } from '../lib/authFlow';

/**
 * Joining the alpha: one POST, then a redirect.
 *
 * WHAT USED TO HAPPEN HERE, and why none of it does any more: the button was
 * gated on `GET /api/billing/offers`, whose nine fields were compared with
 * `===` before checkout was allowed. That route returns 404 and always did.
 * The gate could therefore never open — the page permanently told people
 * billing availability could not be checked, and the Join button was
 * permanently disabled. The fix is not a better gate. It is no gate: there is
 * no offers endpoint to ask, the plan copy is hardcoded, and the button goes
 * straight to checkout, which is the call that actually knows the answer.
 *
 * THE ANSWER THAT MATTERS IS 403. During a closed alpha, "you are not on the
 * list" is the ordinary reply for most people — their account is real, their
 * card was never asked for, and nothing they did failed. It gets its own calm
 * state, kept well away from `message`, and it must never fall through to a
 * full-price checkout.
 */

/** Which of the contract's replies came back. One state, not five booleans. */
const PHASE = {
  IDLE: 'idle',
  /** 403 not_on_alpha_list — invite-only. A gate, not a fault. */
  GATED: 'gated',
  /** 401 unauthorized — sign in, then come back here and carry on. */
  EXPIRED: 'expired',
  /** 503 alpha_not_configured — off at the backend. Not worth hammering. */
  UNAVAILABLE: 'unavailable',
  /** 502 billing_provider_error, and network trouble. Worth pressing again. */
  TRANSIENT: 'transient',
  /** Anything else, in plain language. */
  ERROR: 'error',
};

/** The codes the contract names, mapped to how the page should behave. */
function phaseFor(err) {
  const { status, code } = err || {};
  if (code === 'not_on_alpha_list' || status === 403) return PHASE.GATED;
  if (status === 401) return PHASE.EXPIRED;
  if (code === 'alpha_not_configured' || status === 503) return PHASE.UNAVAILABLE;
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

export default function PlanStep({ ctl, heading = 'Join the alpha', note }) {
  const pathname = usePathname();
  // Sign in and come back to the page they were on, with the offer in front of
  // them again — not to a dashboard they then have to navigate out of.
  const resumeHref = `/login?next=${encodeURIComponent(pathname || '/billing')}`;
  const gated = ctl.phase === PHASE.GATED;

  return (
    <section id="join-alpha" className="plan-step" aria-labelledby="alpha-heading">
      <h2 id="alpha-heading">{heading}</h2>
      {note && <p className="muted mt-16">{note}</p>}

      <div className="alpha-summary">
        <div>
          <span className="eyebrow">Windows alpha · invite-only</span>
          <h3>{ALPHA_OFFER.name}</h3>
        </div>
        <p className="alpha-amount">{ALPHA_OFFER.todayLabel}<span>{ALPHA_OFFER.todayNote}</span></p>
      </div>

      <p className="muted">{ALPHA_OFFER.billingNotice}</p>
      <p className="muted mt-16">{ALPHA_OFFER.rateNotice}</p>
      <p className="field-hint mt-16">Claude requires your own Anthropic API key, with usage billed separately by Anthropic. DocuSign requires your own account. Alpha features may change.</p>

      {/* NOT AN ERROR STATE. Being off the invite list is the expected answer
          during a closed alpha. A red alert would tell someone to go back and
          fix something that is not broken, so this is a calm panel with the one
          action that helps — and the Join button goes away, because pressing it
          again would only produce the same 403. There is deliberately no
          fallback to a paid checkout: the alpha is the only thing on sale. */}
      {gated && <div className="alpha-gate" role="status">
        <p className="eyebrow">Invite only, for now</p>
        <h3>The alpha is invite-only right now</h3>
        <p className="muted">Your account is saved and nothing has been charged. The Windows
        alpha is opening in small groups — ask for an invite and we will come back to you.</p>
        <p className="field-hint mt-16">
          <a href="mailto:support@usemerger.com?subject=Merger%20alpha%20access&body=Please%20add%20me%20to%20the%20Merger%20alpha%20list.">Request access</a>
          {' · '}<Link href="/support">Contact support</Link>
        </p>
      </div>}

      {ctl.phase === PHASE.EXPIRED && <div className="alert alert-warn" role="alert">
        {ctl.message} <Link href={resumeHref}>Sign in and continue</Link>
      </div>}

      {ctl.phase === PHASE.UNAVAILABLE && <div className="alert alert-warn" role="status">
        <p>{ctl.message}</p>
        <p className="field-hint mt-16"><Link href="/support">Contact support</Link></p>
      </div>}

      {ctl.phase === PHASE.TRANSIENT && <div className="alert alert-warn" role="alert">
        <p>{ctl.message}</p>
        <button className="linklike mt-16" type="button" onClick={() => ctl.start()} disabled={ctl.busy}>Try again</button>
      </div>}

      {ctl.phase === PHASE.ERROR && <div className="alert alert-error" role="alert">{ctl.message}</div>}

      {!gated && <>
        <button className="btn btn-primary btn-block" type="button" onClick={() => ctl.start()} disabled={ctl.busy}>
          {ctl.busy ? 'Opening secure checkout…' : ALPHA_OFFER.checkoutLabel}
        </button>
        <p className="field-hint center mt-16">Stripe collects your card securely. $0 is charged today.</p>
      </>}

      <p className="field-hint center mt-16"><Link href="/terms">Alpha terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/support">Help</Link></p>
    </section>
  );
}
