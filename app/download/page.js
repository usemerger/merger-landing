'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '../components/Shell';
import { ApiError, download, errorMessage, meOrNull, statusLabel } from '../lib/api';

/**
 * Pull installer URLs out of the /api/download payload.
 *
 * Installer packaging and code-signing certs are still landing, so the backend may
 * legitimately answer with the platform keys present but the URLs empty. That is a
 * "coming shortly" state, not an error — we gate on entitlement either way.
 */
function normalizeInstallers(payload) {
  if (!payload || typeof payload !== 'object') return { macos: null, windows: null };

  const src = payload.downloads || payload.installers || payload.urls || payload;
  const pick = (...keys) => {
    for (const k of keys) {
      const v = src[k];
      if (!v) continue;
      if (typeof v === 'string' && v.trim()) return v.trim();
      if (typeof v === 'object' && typeof v.url === 'string' && v.url.trim()) return v.url.trim();
    }
    return null;
  };

  return {
    macos: pick('macos', 'mac', 'macOS', 'darwin', 'osx'),
    windows: pick('windows', 'win', 'win32', 'windows64'),
  };
}

function AppleIcon() {
  return (
    <svg width="15" height="17" viewBox="0 0 15 18" fill="none" aria-hidden="true">
      <path
        d="M12.4 9.6c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.3.8-.7 0-1.8-.8-3-.8C1.3 4.6 0 6 0 8.7c0 1.6.3 3.3 1 5 .6 1.4 1.9 3.1 3.2 3.1 1.1 0 1.6-.7 3-.7s1.8.7 3 .7 2.4-1.5 3-2.9c.4-.9.6-1.4.9-2.3-2.4-.9-2.7-4-2.7-4z"
        fill="currentColor"
        opacity=".9"
      />
      <path
        d="M10.1 2.4C10.7 1.7 11.1.7 11 0c-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.4 1 0 1.9-.5 2.5-1.3z"
        fill="currentColor"
        opacity=".9"
      />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M0 2.3l6.4-.9v6.2H0V2.3zm7.2-1L16 0v7.6H7.2V1.3zM0 8.4h6.4v6.2L0 13.7V8.4zm7.2 0H16V16l-8.8-1.2V8.4z"
        fill="currentColor"
        opacity=".9"
      />
    </svg>
  );
}

export default function DownloadPage() {
  const router = useRouter();
  const [state, setState] = useState({ phase: 'loading' });

  const load = useCallback(async () => {
    try {
      const user = await meOrNull();
      if (!user) {
        router.replace('/login?next=/download');
        return;
      }

      try {
        const payload = await download();
        setState({ phase: 'entitled', installers: normalizeInstallers(payload), payload });
      } catch (err) {
        // The backend is the real gate. 402/403 (or a subscription_required
        // envelope) means "pay first" — this page just reflects that decision.
        if (
          err instanceof ApiError &&
          (err.code === 'subscription_required' || err.status === 402 || err.status === 403)
        ) {
          setState({
            phase: 'locked',
            entitlementStatus: (err.body && err.body.entitlementStatus) || 'none',
          });
          return;
        }
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/login?next=/download');
          return;
        }
        setState({ phase: 'error', message: errorMessage(err) });
      }
    } catch (err) {
      setState({ phase: 'error', message: errorMessage(err) });
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.phase === 'loading') {
    return (
      <Shell authed>
        <main className="dash-main">
          <p className="spinner-note">Checking your subscription…</p>
        </main>
      </Shell>
    );
  }

  if (state.phase === 'error') {
    return (
      <Shell authed>
        <main className="dash-main">
          <h1 className="dash-title">Downloads</h1>
          <div className="alert alert-error">{state.message}</div>
          <div className="dl-row">
            <button className="btn btn-ghost btn-sm" type="button" onClick={load}>
              Try again
            </button>
          </div>
        </main>
      </Shell>
    );
  }

  /* ---- locked: no entitlement (§6) ---- */
  if (state.phase === 'locked') {
    const canceled = state.entitlementStatus === 'canceled';
    const pastDue = state.entitlementStatus === 'past_due';
    return (
      <Shell authed>
        <main className="dash-main">
          <p className="eyebrow">Downloads</p>
          <h1 className="dash-title">Start your trial to download.</h1>
          <p className="dash-sub">
            Merger is licensed per account. Your subscription is currently{' '}
            <strong>{statusLabel(state.entitlementStatus).toLowerCase()}</strong>, so installers are
            locked.
          </p>

          <div className="panel mt-24">
            <p className="muted">
              {canceled
                ? 'Your subscription was canceled. Resubscribe from your dashboard and downloads come straight back.'
                : pastDue
                  ? 'Your last payment did not go through. Update your card and downloads unlock again.'
                  : 'Start your 14-day trial — a card is required, and you can cancel any time before it ends.'}
            </p>
            <div className="dl-row">
              {canceled || pastDue ? (
                <Link className="btn btn-primary btn-sm" href="/dashboard">
                  {canceled ? 'Resubscribe' : 'Update your card'}
                </Link>
              ) : (
                <Link className="btn btn-primary btn-sm" href="/signup">
                  Start your trial
                </Link>
              )}
              <Link className="btn btn-ghost btn-sm" href="/dashboard">
                Back to dashboard
              </Link>
            </div>
          </div>
        </main>
      </Shell>
    );
  }

  /* ---- entitled ---- */
  const { macos, windows } = state.installers;
  const anyReady = Boolean(macos || windows);

  return (
    <Shell authed>
      <main className="dash-main">
        <p className="eyebrow">Downloads</p>
        <h1 className="dash-title">Get Merger for desktop.</h1>
        <p className="dash-sub">
          Your subscription is active. Install Merger, connect your networks, and your desk starts
          filling itself in.
        </p>

        <div className="panel mt-24">
          {anyReady ? (
            <>
              <h2>Installers</h2>
              <div className="dl-row">
                {macos && (
                  <a className="btn btn-primary btn-sm" href={macos}>
                    <AppleIcon />
                    Download for macOS
                  </a>
                )}
                {windows && (
                  <a className="btn btn-ghost btn-sm" href={windows}>
                    <WindowsIcon />
                    Download for Windows
                  </a>
                )}
              </div>
              {(!macos || !windows) && (
                <p className="field-hint mt-16">
                  The {macos ? 'Windows' : 'macOS'} build is coming shortly.
                </p>
              )}
            </>
          ) : (
            // Entitlement is confirmed, but packaging/signing is not done yet.
            <>
              <h2>Coming shortly</h2>
              <p className="muted mt-16">
                Your subscription is active and your download is unlocked — the signed installers
                are in final packaging right now. We will email you the moment they are up, and this
                page will show them automatically.
              </p>
              <div className="dl-row">
                <button className="btn btn-ghost btn-sm" type="button" onClick={load}>
                  Check again
                </button>
              </div>
            </>
          )}
        </div>

        <p className="field-hint mt-16">
          Signing in to the app uses the same email and password as this site.
        </p>
      </main>
    </Shell>
  );
}
