'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import MarketingMark from './MarketingMark';
import useSession, { clearSessionHint } from '../lib/useSession';
import { logout } from '../lib/api';

export default function MarketingNav({ signupHref, checkoutLabel }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const session = useSession();
  const [signingOut, setSigningOut] = useState(false);

  /**
   * §2 The header is invisible at the top of the page and grows a hairline
   * once you have scrolled past it.
   *
   * At the top it is just the mark and the links floating over the hero — no
   * fill, no border, nothing drawing a box around them. The line exists to
   * separate the nav from content passing underneath it, so it appears when
   * there IS content passing underneath and not before.
   *
   * A threshold rather than a continuous value: this drives one CSS class, and
   * a class that changes on every scroll frame is a re-render on every scroll
   * frame. 24px is far enough not to fire on a trackpad twitch.
   */
  const [lifted, setLifted] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > 24;
      setLifted((was) => (was === past ? was : past));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function escape(event) {
    if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
  }

  async function onSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    // Forget the cached nav state FIRST. If the request fails halfway the
    // worst outcome is a nav that offers Sign in to someone still signed in,
    // which the next check corrects — far better than one that keeps
    // advertising an account the server has already dropped.
    clearSessionHint();
    try { await logout(); } catch { /* the cookie may already be gone */ }
    window.location.assign('/');
  }

  const who = session.user?.handle
    ? `@${session.user.handle}`
    : session.user?.displayName || session.user?.email || 'Your account';

  /**
   * THE SLOT IS ALWAYS THE SAME WIDTH, whichever of the three states is in it.
   * The marketing page is statically prerendered, so the signed-in answer can
   * only ever arrive after first paint; if the slot resized when it did, every
   * link to its left would jump and the page would book a layout shift for it.
   * `unknown` renders nothing, but it renders nothing *of the same size*.
   */
  const auth = session.phase === 'unknown'
    ? <span className="mk-nav-auth-wait" aria-hidden="true" />
    : session.phase === 'in'
      ? <>
          <span className="mk-nav-you" title={session.user?.email || undefined}>{who}</span>
          <Link className="mk-button mk-button-small" href="/dashboard">Open dashboard</Link>
          <button type="button" className="mk-nav-signout" disabled={signingOut} onClick={onSignOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </>
      : <>
          <Link className="mk-nav-signin" href="/login">Sign in</Link>
          <Link className="mk-button mk-button-small" href={signupHref}>{checkoutLabel}</Link>
        </>;

  return <header className={`mk-nav${lifted ? ' is-lifted' : ''}`} onKeyDown={escape}>
    <div className="mk-wrap mk-nav-inner">
      <Link className="mk-brand" href="/" aria-label="Merger home"><MarketingMark hover /><span>merger</span></Link>
      <button ref={toggle} className="mk-menu-toggle" type="button" aria-expanded={open} aria-controls="marketing-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>
        <span>{open ? 'Close' : 'Menu'}</span><svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d={open ? 'm4 4 10 10M14 4 4 14' : 'M2 5h14M2 9h14M2 13h14'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      <nav id="marketing-navigation" aria-label="Main navigation" className={`mk-nav-links${open ? ' is-open' : ''}`} onClick={event => { if (event.target.closest('a')) setOpen(false); }}>
        <a href="#product">Product</a><a href="#workflow">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
        <span className="mk-nav-auth">{auth}</span>
      </nav>
    </div>
  </header>;
}
