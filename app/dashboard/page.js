'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '../components/Shell';
import {
  ENTITLED_STATUSES,
  PLANS,
  billingPortal,
  billingStatus,
  errorMessage,
  formatDate,
  meOrNull,
  statusLabel,
} from '../lib/api';

function StatusPill({ status, grandfathered }) {
  if (grandfathered) return <span className="pill good">Complimentary</span>;
  const tone =
    status === 'active' || status === 'trialing'
      ? 'good'
      : status === 'past_due'
        ? 'warn'
        : status === 'canceled'
          ? 'bad'
          : 'neutral';
  return <span className={`pill ${tone}`}>{statusLabel(status)}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portalBusy, setPortalBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      // Auth gate: no session → send to login, remembering where we were headed.
      const u = await meOrNull();
      if (!u) {
        router.replace('/login?next=/dashboard');
        return;
      }
      setUser(u);
      setStatus(await billingStatus());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  // Returning from Stripe Checkout or the Portal, the webhook may land a moment
  // after the browser does. Re-check once on window focus so the page self-heals.
  useEffect(() => {
    const onFocus = () => {
      billingStatus().then(setStatus).catch(() => {});
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  async function openPortal() {
    if (portalBusy) return;
    setPortalBusy(true);
    setError('');
    try {
      // All billing management — card, plan, cancel, invoices — is Stripe-hosted.
      const res = await billingPortal();
      if (!res || !res.url) throw new Error('Could not open the billing portal.');
      window.location.href = res.url;
    } catch (err) {
      setError(errorMessage(err));
      setPortalBusy(false);
    }
  }

  if (loading) {
    return (
      <Shell authed>
        <main className="dash-main">
          <p className="spinner-note">Loading your account…</p>
        </main>
      </Shell>
    );
  }

  const s = status || {};
  const grandfathered = s.grandfathered === true;
  const entitled = s.entitled === true || ENTITLED_STATUSES.includes(s.entitlementStatus);
  const planMeta = s.plan ? PLANS[s.plan] : null;
  const planName = planMeta ? planMeta.name : s.plan || null;

  // Which date matters depends on where the subscription is in its life.
  const renewalDate = formatDate(s.currentPeriodEnd);
  const trialDate = formatDate(s.trialEndsAt);
  const graceDate = formatDate(s.graceEndsAt);

  return (
    <Shell authed>
      <main className="dash-main">
        <p className="eyebrow">Account</p>
        <h1 className="dash-title">{user ? user.email : 'Your account'}</h1>
        <p className="dash-sub">
          {grandfathered
            ? 'Founding account'
            : entitled
              ? 'Your subscription is in good standing.'
              : 'You do not have an active subscription.'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Billing is configured server-side? If not, say so rather than showing a broken plan. */}
        {s.configured === false && (
          <div className="alert alert-warn">
            Billing is not fully configured on this environment yet, so subscription details may be
            incomplete.
          </div>
        )}

        {/* §5 banners */}
        {!grandfathered && s.entitlementStatus === 'past_due' && (
          <div className="alert alert-warn">
            <strong>Your payment did not go through.</strong> Update your card to keep your desk
            running{graceDate ? ` — access continues until ${graceDate}.` : '.'}{' '}
            <button type="button" className="linklike" onClick={openPortal}>
              Update your card
            </button>
          </div>
        )}
        {!grandfathered && s.entitlementStatus === 'canceled' && (
          <div className="alert alert-warn">
            <strong>Your subscription is canceled.</strong> Resubscribe to get your desk and
            downloads back.{' '}
            <button type="button" className="linklike" onClick={openPortal}>
              Resubscribe
            </button>
          </div>
        )}
        {!grandfathered && s.entitlementStatus === 'none' && (
          <div className="alert alert-warn">
            <strong>You have not started a subscription yet.</strong> Merger will not run until you
            do. <Link href="/signup">Start your trial</Link>
          </div>
        )}

        <div className="panel mt-24">
          <div className="panel-head">
            <h2>Subscription</h2>
            <StatusPill status={s.entitlementStatus} grandfathered={grandfathered} />
          </div>

          {grandfathered ? (
            // Explicit grandfathered treatment (§5) — otherwise this reads as
            // "active, no plan, no renewal", which looks broken.
            <p className="muted mt-16">
              Founding account — complimentary. You have full access to Merger with no subscription
              and nothing to pay. There is no billing to manage.
            </p>
          ) : (
            <div className="stat-grid">
              <div className="stat">
                <div className="k">Plan</div>
                <div className="v">{planName || '—'}</div>
              </div>

              {(planName === 'Desk' || (s.seats && s.seats > 1)) && (
                <div className="stat">
                  <div className="k">Seats</div>
                  <div className="v">{s.seats || 1}</div>
                </div>
              )}

              {s.entitlementStatus === 'trialing' && trialDate && (
                <div className="stat">
                  <div className="k">Trial ends</div>
                  <div className="v">{trialDate}</div>
                </div>
              )}

              {s.entitlementStatus !== 'trialing' && renewalDate && (
                <div className="stat">
                  <div className="k">
                    {s.entitlementStatus === 'canceled' ? 'Access until' : 'Renews'}
                  </div>
                  <div className="v">{renewalDate}</div>
                </div>
              )}

              <div className="stat">
                <div className="k">Payment method</div>
                <div className="v">{s.hasPaymentMethod ? 'On file' : 'None'}</div>
              </div>
            </div>
          )}

          {!grandfathered && (
            <div className="dl-row">
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={openPortal}
                disabled={portalBusy}
              >
                {portalBusy ? 'Opening…' : 'Manage billing'}
              </button>
              {s.entitlementStatus === 'none' && (
                <Link className="btn btn-primary btn-sm" href="/signup">
                  Start your trial
                </Link>
              )}
            </div>
          )}
          {!grandfathered && (
            <p className="field-hint mt-16">
              Cards, plan changes, cancellation and invoices are handled on Stripe.
            </p>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Desktop app</h2>
          </div>
          <p className="muted mt-16">
            {entitled
              ? 'Your subscription is active — installers are ready.'
              : 'Downloads unlock once your trial starts.'}
          </p>
          <div className="dl-row">
            <Link className="btn btn-primary btn-sm" href="/download">
              {entitled ? 'Go to downloads' : 'Start your trial to download'}
            </Link>
          </div>
        </div>
      </main>
    </Shell>
  );
}
