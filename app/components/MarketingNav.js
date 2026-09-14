'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import MarketingMark from './MarketingMark';

export default function MarketingNav({ signupHref }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  function escape(event) {
    if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
  }
  return <header className="mk-nav" onKeyDown={escape}>
    <div className="mk-wrap mk-nav-inner">
      <Link className="mk-brand" href="/" aria-label="Merger home"><MarketingMark /><span>merger</span></Link>
      <button ref={toggle} className="mk-menu-toggle" type="button" aria-expanded={open} aria-controls="marketing-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>
        <span>{open ? 'Close' : 'Menu'}</span><svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d={open ? 'm4 4 10 10M14 4 4 14' : 'M2 5h14M2 9h14M2 13h14'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      <nav id="marketing-navigation" aria-label="Main navigation" className={`mk-nav-links${open ? ' is-open' : ''}`} onClick={event => { if (event.target.closest('a')) setOpen(false); }}>
        <a href="#product">Product</a><a href="#workflow">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
        <Link className="mk-nav-signin" href="/login">Sign in</Link>
        <Link className="mk-button mk-button-small" href={signupHref}>Join the alpha <span aria-hidden="true">↗</span></Link>
      </nav>
    </div>
  </header>;
}
