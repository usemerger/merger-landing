'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import MarketingMark from './MarketingMark';

export default function MarketingNav({ signupHref, checkoutLabel }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);

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
  return <header className={`mk-nav${lifted ? ' is-lifted' : ''}`} onKeyDown={escape}>
    <div className="mk-wrap mk-nav-inner">
      <Link className="mk-brand" href="/" aria-label="Merger home"><MarketingMark hover /><span>merger</span></Link>
      <button ref={toggle} className="mk-menu-toggle" type="button" aria-expanded={open} aria-controls="marketing-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>
        <span>{open ? 'Close' : 'Menu'}</span><svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d={open ? 'm4 4 10 10M14 4 4 14' : 'M2 5h14M2 9h14M2 13h14'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      <nav id="marketing-navigation" aria-label="Main navigation" className={`mk-nav-links${open ? ' is-open' : ''}`} onClick={event => { if (event.target.closest('a')) setOpen(false); }}>
        <a href="#product">Product</a><a href="#workflow">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
        <Link className="mk-nav-signin" href="/login">Sign in</Link>
        <Link className="mk-button mk-button-small" href={signupHref}>{checkoutLabel} <span aria-hidden="true">↗</span></Link>
      </nav>
    </div>
  </header>;
}
