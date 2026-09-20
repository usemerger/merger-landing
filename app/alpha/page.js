'use client';

/**
 * The invite door to checkout.
 *
 * WHY THIS ROUTE EXISTS. The public funnel is a waitlist now, so nothing on
 * the marketing page links to Stripe any more. The paid flow itself is
 * untouched — same PlanStep, same `POST /api/billing/checkout {plan:'operator',
 * alpha:true}`, same price — it simply needs a door that only people holding
 * an invite walk through. This is that door: /alpha?invite=CODE.
 *
 * WHAT THE GATE IS, HONESTLY. It is a soft gate, not a security boundary. The
 * deployed backend exposes `POST /api/admin/waitlist/{row_id}/invite` to send
 * an invite, but there is NO public route that validates an invite code —
 * confirmed against the live OpenAPI schema, which lists exactly four waitlist
 * paths and no verification endpoint. So this page cannot check the code, and
 * anyone who types /alpha?invite=anything reaches the same button.
 *
 * That is acceptable for what it is asked to do — take checkout off the public
 * path so the funnel's single public action is the waitlist — and it must not
 * be mistaken for more. If admission ever needs enforcing rather than merely
 * directing, the enforcement belongs on the checkout endpoint, which is the
 * only place that can refuse a charge. When a validation route appears, the
 * `invite` value is already carried through here and to /signup, so wiring it
 * up is a call in one place.
 */

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Shell from '../components/Shell';
import PlanStep, { useStartCheckout } from '../components/PlanStep';
import { ALPHA_OFFER, WAITLIST } from '../lib/billingOffer';
import { validCode } from '../lib/waitlist';
import useSession from '../lib/useSession';

/** Survives the trip out to signup and back, so an invite is not lost on the way. */
const INVITE_KEY = 'merger_invite';

function rememberInvite(code) {
  try { sessionStorage.setItem(INVITE_KEY, code); } catch { /* blocked */ }
}

function AlphaInvite() {
  const params = useSearchParams();
  const session = useSession();
  // `invite` is the documented spelling; `code` is accepted too so a link
  // written either way still opens, rather than bouncing someone who was
  // actually admitted.
  const raw = params.get('invite') || params.get('code') || '';
  const invited = validCode(raw);
  const [stored, setStored] = useState(false);
  const checkoutCtl = useStartCheckout();

  useEffect(() => {
    if (invited) { rememberInvite(raw); setStored(true); return; }
    // No code in the URL, but one may already be held from earlier in this
    // session — coming back from /signup, say.
    try { setStored(Boolean(sessionStorage.getItem(INVITE_KEY))); } catch { setStored(false); }
  }, [invited, raw]);

  const open = invited || stored;

  if (!open) {
    return <main className="auth-main">
      <div className="auth-card">
        <p className="eyebrow">Merger alpha</p>
        <h1>The alpha is invite-only.</h1>
        <p className="lede">Merger is opening to a small group at a time. Join the waitlist and we
        will email you an invite — with a link that opens this page — when a seat comes free.</p>
        <p className="field-hint mt-16">{WAITLIST.hook} {WAITLIST.hookNote}</p>
        <p className="form-foot mt-24"><Link className="btn btn-primary btn-block" href={`/${WAITLIST.href}`}>{WAITLIST.cta}</Link></p>
        <p className="form-foot">Already have an account? <Link href="/login">Sign in</Link></p>
      </div>
    </main>;
  }

  /**
   * Signed in already: the button here starts checkout directly. Signed out:
   * send them through signup, which creates the account and reserves a handle
   * before showing the very same panel. The invite is in sessionStorage by
   * then, so coming back to this page still works.
   *
   * `unknown` is the first frame for everyone (useSession cannot read the
   * session during a static render), so it renders the signed-out path — the
   * conservative answer, and one whose link is still correct for a signed-in
   * visitor, just one redirect longer.
   */
  const signedIn = session.phase === 'in';

  return <main className="auth-main">
    <div className="auth-card">
      <p className="eyebrow">You&rsquo;re invited</p>
      <h1>Your seat is ready.</h1>
      <p className="lede">{ALPHA_OFFER.rateNotice}</p>
      {signedIn
        ? <div className="panel mt-24"><PlanStep ctl={checkoutCtl} heading="Join the alpha" /></div>
        : <>
            <div className="panel mt-24">
              <p className="muted">Create your Merger account first — it takes a minute — and the
              alpha terms are waiting on the other side.</p>
              <p className="field-hint mt-16">{ALPHA_OFFER.billingNotice}</p>
              <Link className="btn btn-primary btn-block mt-24" href={ALPHA_OFFER.signupHref}>Create your account</Link>
            </div>
            <p className="form-foot">Already have an account? <Link href={`/login?next=${encodeURIComponent('/alpha')}`}>Sign in</Link></p>
          </>}
    </div>
  </main>;
}

export default function AlphaPage() {
  return <Shell>
    <Suspense fallback={<main className="auth-main"><p className="spinner-note" role="status">Loading…</p></main>}>
      <AlphaInvite />
    </Suspense>
  </Shell>;
}
