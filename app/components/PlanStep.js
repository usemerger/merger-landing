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
 * SIGNUP IS OPEN. There is no allowlist and no invite gate — anyone with an
 * account can press this button and reach Stripe. The invite-only panel that
 * used to live here, and the `not_on_alpha_list` reply behind it, are both
 * gone.
 *
 * The button is never gated on a preflight call either. It used to be blocked
 * until `GET /api/billing/offers` answered, with nine of its fields compared
 * by `===`; that route is a 404, so the gate could never open and the button
 * was permanently disabled. Checkout is the call that actually knows the
 * answer, so checkout is the only call.
 */

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
};

/**
 * Codes that mean "the alpha is not taking anyone right now".
 *
 * MATCHED BY BEHAVIOUR AS WELL AS BY NAME, deliberately. The deployed backend
 * does not document its error bodies — the OpenAPI schema types the request
 * and nothing else — so the exact spelling of the closed-window code cannot be
 * confirmed from outside. What CAN be confirmed is that the allowlist is gone,
 * and with it the only other thing a 403 used to mean. So a 403 is read as a
 * closed window unless its code is a known non-alpha one (see below), and
 * these names are recognised for a more precise message when one arrives.
 *
 * `alpha_not_configured` (503) lands here too. It is a different cause —
 * billing misconfigured rather than a window deliberately shut — but it is the
 * same fact for the person reading it: you cannot join right now, and it is
 * not something you can fix.
 */
const CLOSED_CODES = new Set([
  'alpha_closed', 'alpha_ended', 'alpha_full', 'alpha_not_open',
  'alpha_unavailable', 'alpha_offer_unavailable', 'alpha_not_configured',
]);

/**
 * The 403s that are NOT the alpha being shut.
 *
 * Found by testing rather than by reading: the backend enforces an Origin
 * allowlist on state-changing requests, and a request from an origin it does
 * not know — a Vercel preview URL, localhost — comes back
 * `403 origin_not_allowed`. Without this list the catch-all above would tell
 * a developer on a preview deployment that the alpha had closed, which is
 * both wrong and the kind of wrong that wastes an afternoon.
 *
 * `email_not_verified` is here for the same reason: it is a 403 about the
 * account, not about the window, and it has its own sentence already.
 */
const NOT_CLOSED_CODES = new Set([
  'origin_not_allowed', 'email_not_verified', 'csrf_failed', 'forbidden',
]);

/** The contract's replies, mapped to how the page should behave. */
function phaseFor(err) {
  const { status, code } = err || {};
  if (CLOSED_CODES.has(code)) return PHASE.CLOSED;
  // A bare 403, or a 403 whose code is not one of the known non-alpha ones, is
  // the window being shut: with the allowlist gone there is nothing else on
  // this endpoint it can mean, and an unpredicted closed-window code has to
  // land somewhere calm rather than in a red box.
  if (status === 403 && !NOT_CLOSED_CODES.has(code)) return PHASE.CLOSED;
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

export default function PlanStep({ ctl, heading = 'Join the alpha', note }) {
  const pathname = usePathname();
  // Sign in and come back to the page they were on, with the offer in front of
  // them again — not to a dashboard they then have to navigate out of.
  const resumeHref = `/login?next=${encodeURIComponent(pathname || '/billing')}`;
  const closed = ctl.phase === PHASE.CLOSED;

  return (
    <section id="join-alpha" className="plan-step" aria-labelledby="alpha-heading">
      <h2 id="alpha-heading">{heading}</h2>
      {note && <p className="muted mt-16">{note}</p>}

      <div className="alpha-summary">
        <div>
          <span className="eyebrow">Windows alpha · one person</span>
          <h3>{ALPHA_OFFER.name}</h3>
        </div>
        {/* What is charged today is the number that belongs at this size. The
            $50 it becomes is one line below, where it cannot be mistaken for
            something being taken now. */}
        <p className="alpha-amount">{ALPHA_OFFER.todayLabel}<span>{ALPHA_OFFER.todayNote}</span></p>
      </div>

      <p className="alpha-then">
        {ALPHA_OFFER.trialLabel}, then <strong>{ALPHA_OFFER.priceLabel}{ALPHA_OFFER.intervalLabel}</strong>
      </p>
      <p className="muted">{ALPHA_OFFER.billingNotice}</p>
      <p className="muted mt-16">{ALPHA_OFFER.rateNotice}</p>
      <p className="field-hint mt-16">Claude requires your own Anthropic API key, with usage billed separately by Anthropic. DocuSign requires your own account. Alpha features may change.</p>

      {/* THE ALPHA IS SHUT, NOT BROKEN. Signup is open while the window is
          open, so this is the one state where someone who did everything right
          still cannot join. It is a calm panel rather than a red alert, the
          Join button goes away because pressing it again would only repeat the
          same answer, and there is no second, pricier thing to sell them. */}
      {closed && <div className="alpha-gate" role="status">
        <p className="eyebrow">Closed for now</p>
        <h3>The alpha isn&rsquo;t taking new members right now</h3>
        <p className="muted">Your account is saved and nothing has been charged. The Windows
        alpha opens in groups — tell us you want in and we will come back to you when it does.</p>
        <p className="field-hint mt-16">
          <a href="mailto:support@usemerger.com?subject=Merger%20alpha%20waitlist&body=Please%20let%20me%20know%20when%20the%20Merger%20alpha%20reopens.">Join the waitlist</a>
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
          {ctl.busy ? 'Opening secure checkout…' : ALPHA_OFFER.checkoutLabel}
        </button>
        <p className="field-hint center mt-16">Stripe collects your card securely. {ALPHA_OFFER.todayLabel} is charged today, and your trial starts when you finish checkout.</p>
      </>}

      <p className="field-hint center mt-16"><Link href="/terms">Alpha terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/support">Help</Link></p>
    </section>
  );
}
