'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { errorMessage, logout } from '../lib/api';
import { clearSessionHint } from '../lib/useSession';
import MarketingMark from './MarketingMark';

export default function Shell({ children, authed = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  async function onSignOut() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      // Drop the marketing nav's cached state in the same breath, or the
      // funnel keeps showing "Open dashboard" for an account just signed out.
      clearSessionHint();
      await logout();
      router.replace('/login?signedOut=1');
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      submitting.current = false;
      setBusy(false);
    }
  }
  const navLink = (href, label) => <Link href={href} aria-current={pathname === href ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#account-content">Skip to content</a>
      <header className="app-nav">
        <div className="app-nav-inner">
          <Link className="brand" href="/" aria-label="Merger home"><MarketingMark size={28} />merger</Link>
          <button className="account-menu" type="button" aria-expanded={open} aria-controls="account-navigation" onClick={() => setOpen(!open)}>{open ? 'Close menu' : 'Menu'}</button>
          <nav className={`app-nav-links${open ? ' is-open' : ''}`} id="account-navigation" aria-label="Account navigation">
            {authed ? <>{navLink('/dashboard', 'Account')}{navLink('/billing', 'Billing')}{navLink('/download', 'Download')}<button type="button" className="linklike" disabled={busy} onClick={onSignOut}>{busy ? 'Signing out…' : 'Sign out'}</button></> : <>{navLink('/#pricing', 'Pricing')}{navLink('/login', 'Sign in')}<Link className="nav-cta" href="/signup?offer=alpha">Join the alpha</Link></>}
          </nav>
        </div>
        {error && <div className="nav-error" role="alert">Sign out failed. {error} <button className="linklike" onClick={onSignOut}>Try again</button></div>}
      </header>
      <div id="account-content" className="account-content" tabIndex={-1}>{children}</div>
      <footer className="account-footer"><p>Merger · Windows alpha</p><nav aria-label="Footer"><Link href="/support">Support</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></nav></footer>
    </div>
  );
}
