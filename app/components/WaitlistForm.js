'use client';

/**
 * The public front door: join the list, then see where you are on it.
 *
 * TWO STATES IN ONE BOX, and the box never changes size when they swap. The
 * form and the status panel are both laid into the same grid cell with a
 * reserved min-height (see waitlist.css), because the status panel can appear
 * a beat after first paint — a returning visitor's stored code has to be
 * checked against the backend before we know which state is right — and a
 * panel that arrives by pushing the page down is a layout shift on the most
 * important element of the funnel.
 *
 * WHY THE FIRST RENDER IS ALWAYS THE FORM. localStorage cannot be read while
 * the server is rendering, and this page is statically prerendered. Reading it
 * during the first client render would produce markup that disagrees with the
 * server's and React would throw the server's HTML away to reconcile it. So
 * the form is the honest first frame for everyone, and a returning visitor is
 * swapped to their status one tick later — the same trick, and the same
 * reasoning, as lib/useSession.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './waitlist.css';
import { WAITLIST } from '../lib/billingOffer';
import {
  captureRef, forgetCode, joinWaitlist, rememberCode, referralLink,
  storedCode, trackJoin, waitlistError, waitlistStatus,
} from '../lib/waitlist';

/** A deliberately forgiving client-side check — the backend is the authority. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Position({ position }) {
  return <p className="wl-position">
    You&rsquo;re <strong>#{position}</strong> on the list.
  </p>;
}

/**
 * The status panel: position, referral link, count, and the pricing hook.
 * Rendered both straight after a join and for a returning visitor, from the
 * same shape, so the two can never drift apart.
 */
function Status({ row, justJoined }) {
  const link = referralLink(row.referralCode);
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(link);
      ok = true;
    } catch {
      // Clipboard API needs a secure context and a permission that an embedded
      // webview may simply refuse. The input below is selectable and readonly,
      // so there is always a manual path — select it for them and say nothing
      // that claims a copy happened when it did not.
      ok = false;
    }
    setCopied(ok);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2400);
  }, [link]);

  const share = useCallback(() => {
    try {
      navigator.share?.({
        title: 'Merger',
        text: 'Merger brings connected messages, deals and contacts into one desktop workspace.',
        url: link,
      }).catch(() => { /* the sheet was dismissed */ });
    } catch { /* not available */ }
  }, [link]);

  return <div className="wl-status">
    {/* role=status so the position is announced when it replaces the form,
        rather than a screen reader user submitting into silence. */}
    <div role="status">
      <p className="wl-kicker">{justJoined ? 'You’re on the list' : 'Your place in line'}</p>
      <Position position={row.position} />
      <p className="wl-sub">
        {justJoined
          ? 'Check your inbox for a confirmation. We email an invite when a seat opens.'
          : 'We email an invite when a seat opens.'}
      </p>
    </div>

    <div className="wl-refer">
      <label htmlFor="wl-link" className="wl-label">Your referral link</label>
      <div className="wl-link-row">
        <input id="wl-link" className="wl-link" type="text" readOnly value={link}
          onFocus={(event) => event.target.select()} />
        <button type="button" className="wl-copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
      {/* Announced politely rather than as an alert: a copy confirmation is
          not an interruption. */}
      <p className="wl-copy-note" role="status">{copied ? 'Link copied to your clipboard.' : ''}</p>

      <p className="wl-count">
        <strong>{row.referralCount}</strong>
        {row.referralCount === 1 ? ' referral so far.' : ' referrals so far.'}
        {' '}{WAITLIST.referPrompt}
      </p>

      {/* navigator.share exists on phones and almost nowhere else, so this is
          rendered only where it will actually do something. */}
      <ShareButton onShare={share} />
    </div>

    <p className="wl-hook"><strong>{WAITLIST.hook}</strong> {WAITLIST.hookNote}</p>
  </div>;
}

/** Rendered only once the client has confirmed the API exists (see above). */
function ShareButton({ onShare }) {
  const [can, setCan] = useState(false);
  useEffect(() => { setCan(typeof navigator !== 'undefined' && typeof navigator.share === 'function'); }, []);
  if (!can) return null;
  return <button type="button" className="wl-share" onClick={onShare}>Share your link</button>;
}

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [firm, setFirm] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [row, setRow] = useState(null);
  const [justJoined, setJustJoined] = useState(false);
  /** The inbound referral in force, captured on load and sent with the join. */
  const ref = useRef(null);
  const submitting = useRef(false);

  useEffect(() => {
    // §2. Capture BEFORE anything is submitted: the person who follows a
    // referral link usually reads the page, leaves, and comes back another day.
    ref.current = captureRef();

    // §3. A returning visitor sees their live position, not an empty form.
    const code = storedCode();
    if (!code) return;
    let live = true;
    waitlistStatus(code)
      .then((found) => { if (live) setRow(found); })
      .catch((err) => {
        // 404 means the backend no longer knows this code — a reset list, a
        // removed row. Forget it and show the form, which is the only thing
        // they can usefully do. Any other failure (offline, a 502) leaves the
        // code alone: it is probably still good and will resolve next visit.
        if (err?.status === 404) forgetCode();
      });
    return () => { live = false; };
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting.current) return;

    const address = email.trim();
    if (!EMAIL_SHAPE.test(address)) { setError('Enter a valid email address.'); return; }
    if (!role) { setError('Choose the option that best describes your work.'); return; }
    if (!consent) { setError('Please agree to be emailed about Merger.'); return; }

    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const found = await joinWaitlist({ email: address, role, firm: firm.trim(), ref: ref.current });
      rememberCode(found.referralCode);
      trackJoin({
        position: found.position,
        referralCount: found.referralCount,
        ref: ref.current,
        search: typeof location !== 'undefined' ? location.search : '',
      });
      setJustJoined(true);
      setRow(found);
    } catch (err) {
      setError(waitlistError(err));
    } finally {
      // Always, on every path. A button left spinning after a failure is the
      // one outcome this form is not allowed to produce.
      submitting.current = false;
      setBusy(false);
    }
  }

  if (row) return <div className="wl-slot"><Status row={row} justJoined={justJoined} /></div>;

  return <div className="wl-slot">
    <form className="wl-form" onSubmit={onSubmit} aria-busy={busy} noValidate>
      <div className="wl-field wl-field-email">
        <label htmlFor="wl-email">Work email</label>
        <input id="wl-email" name="email" type="email" required autoComplete="email"
          autoCapitalize="none" spellCheck={false} placeholder="you@firm.com"
          value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} />
      </div>

      <div className="wl-row">
        <div className="wl-field">
          <label htmlFor="wl-role">What you do</label>
          <select id="wl-role" name="role" required value={role} disabled={busy}
            onChange={(event) => setRole(event.target.value)}>
            <option value="">Select…</option>
            {WAITLIST.roles.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="wl-field">
          <label htmlFor="wl-firm">Firm <span className="wl-optional">(optional)</span></label>
          <input id="wl-firm" name="firm" type="text" autoComplete="organization"
            placeholder="Where you work" maxLength={200}
            value={firm} onChange={(event) => setFirm(event.target.value)} disabled={busy} />
        </div>
      </div>

      {/* THE LINE BREAK IS EXPLICIT, AND THAT IS A CLS FIX.
          Left to wrap, this label is two lines in the fallback face and one in
          Geist at exactly the width the hero column gives it — so the webfont
          swap reflowed it and lifted the submit button 19px, which was the
          whole of a 0.043 CLS. A reserved box was not enough on its own:
          Chrome scores the text's own line boxes moving, not just the
          container's. Breaking the two sentences deliberately makes the line
          count the same in any face, and neither line is long enough to wrap
          again at any width this form is laid out at (checked down to 280px). */}
      <label className="wl-consent">
        <input type="checkbox" name="consent" checked={consent} disabled={busy}
          onChange={(event) => setConsent(event.target.checked)} />
        <span>
          {WAITLIST.consent}<br />
          <span className="wl-consent-privacy">See the <Link href="/privacy">Privacy Policy</Link>.</span>
        </span>
      </label>

      {error && <p className="wl-error" role="alert">{error}</p>}

      <button className="mk-button wl-submit" type="submit" disabled={busy}>
        {busy ? 'Joining…' : WAITLIST.cta}
      </button>

      <p className="wl-terms">
        {WAITLIST.hook} No card, and nothing charged, to join the list.
      </p>
    </form>
  </div>;
}
