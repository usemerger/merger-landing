'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '../lib/api';

function Mark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2 15V5l5 5 5-5v10"
        stroke="var(--brass)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="6" r="2.2" stroke="var(--brass)" strokeWidth="1.6" />
    </svg>
  );
}

/**
 * Shared chrome for the account surface.
 * `authed` toggles between the signed-out (Sign in / Get Merger) and
 * signed-in (Dashboard / Download / Sign out) link sets.
 */
export default function Shell({ children, authed = false }) {
  const router = useRouter();

  async function onSignOut() {
    try {
      await logout();
    } catch {
      // Clearing the cookie is best-effort; always land the user signed out.
    }
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <div className="app-nav-inner">
          <Link className="brand" href="/" aria-label="Merger home">
            <Mark />
            MERGER
          </Link>
          <div className="app-nav-links">
            {authed ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/download">Download</Link>
                <button type="button" className="linklike" onClick={onSignOut}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/#pricing">Pricing</Link>
                <Link href="/login">Sign in</Link>
                <Link className="nav-cta" href="/signup">
                  GET MERGER
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
