'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '../components/Shell';
import PlanStep, { useStartCheckout } from '../components/PlanStep';
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

  // The live API answers entitled requests with {builds: {...}, version: ...},
  // where builds is empty until packaging lands. The other keys are accepted
  // defensively so a backend rename does not silently blank the page.
  const src = payload.builds || payload.downloads || payload.installers || payload.urls || payload;
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
  // Lets an existing un-entitled account pay from this page instead of bouncing
  // to signup, where its own handle would come back as taken.
  const checkoutCtl = useStartCheckout();

  const load = useCallback(async () => {
    try {
      const user = await meOrNull();
      if (!user) {
        router.replace('/login?next=/download');
        return;
      }

      try {
        const payload = await download();
        setState({
          phase: 'entitled',
          installers: normalizeInstallers(payload),
          version: typeof payload?.version === 'string' ? payload.version : null,
          payload,
        });
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

          {pastDue ? (
            <div className="panel mt-24">
              <p className="muted">
                Your last payment did not go through. Update your card and downloads unlock again.
              </p>
              <div className="dl-row">
                <Link className="btn btn-primary btn-sm" href="/dashboard">
                  Update your card
                </Link>
                <Link className="btn btn-ghost btn-sm" href="/dashboard">
                  Back to dashboard
                </Link>
              </div>
            </div>
          ) : (
            // This account already exists, so paying resumes right here — picking a
            // plan is all that is left. It must never route back to the signup form.
            <>
              <div className="panel mt-24">
                <PlanStep
                  ctl={checkoutCtl}
                  heading={canceled ? 'Resubscribe' : 'Start your 14-day trial'}
                  note={
                    canceled
                      ? 'Choose a plan to start a new subscription and get your downloads back.'
                      : 'Your account is already set up — just choose a plan and downloads unlock.'
                  }
                />
              </div>
              <div className="dl-row">
                <Link className="btn btn-ghost btn-sm" href="/dashboard">
                  Back to dashboard
                </Link>
              </div>
            </>
          )}
        </main>
      </Shell>
    );
  }

  /* ---- entitled ---- */
  const { macos, windows } = state.installers;
  // Version comes straight from the response, never from anything baked in here,
  // so a new release shows up on reload with no redeploy of this site.
  const version = state.version;
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
              <div className="panel-head">
                <h2>Installers</h2>
                {version && <span className="pill neutral">Version {version}</span>}
              </div>

              <div className="dl-row">
                {windows && (
                  // Plain anchor straight to the releases host: a normal file
                  // download, not a fetch, so no CORS is involved.
                  <a className="btn btn-primary btn-sm" href={windows} download>
                    <WindowsIcon />
                    {version ? `Download Merger v${version}` : 'Download Merger for Windows'}
                  </a>
                )}
                {macos && (
                  <a className="btn btn-ghost btn-sm" href={macos} download>
                    <AppleIcon />
                    {version ? `Download for macOS (v${version})` : 'Download for macOS'}
                  </a>
                )}
              </div>

              {!macos && (
                <p className="field-hint mt-16">
                  <AppleIcon /> macOS coming soon — the Windows build is available now.
                </p>
              )}
              {!windows && (
                <p className="field-hint mt-16">The Windows build is coming soon.</p>
              )}
            </>
          ) : (
            // Entitled, but the release manifest has no builds in it right now.
            // Never render a dead button — say so and let them retry.
            <>
              <h2>Download temporarily unavailable</h2>
              <p className="muted mt-16">
                Your subscription is active and your download is unlocked, but no installer is being
                published right now. This is usually brief — try again in a few minutes.
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
