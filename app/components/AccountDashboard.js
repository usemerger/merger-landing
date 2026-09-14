'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Shell from './Shell';
import PlanStep, { useStartCheckout } from './PlanStep';
import HandleField from './HandleField';
import { billingPortal, billingStatus, errorMessage, formatDate, meOrNull, statusLabel } from '../lib/api';
import { pollEntitlement, safeReturnPath, stripeRedirectURL, validHandle } from '../lib/authFlow';
import { ALPHA_OFFER } from '../lib/billingOffer';
import useHandleClaim from '../lib/useHandleClaim';

function StatusPill({ status, grandfathered }) {
  if (grandfathered) return <span className="pill good">Complimentary</span>;
  const tone = ['active', 'trialing'].includes(status) ? 'good' : status === 'past_due' ? 'warn' : status === 'canceled' ? 'bad' : 'neutral';
  return <span className={`pill ${tone}`}>{statusLabel(status)}</span>;
}

function priceLabel(pricing) {
  if (!Number.isFinite(pricing?.amount) || !/^[a-z]{3}$/i.test(pricing?.currency || '')) return null;
  try {
    const amount = new Intl.NumberFormat(undefined, { style: 'currency', currency: pricing.currency }).format(pricing.amount / 100);
    const period = ['day', 'week', 'month', 'year'].includes(pricing.interval) ? pricing.interval : null;
    if (!period) return amount;
    const count = Number.isInteger(pricing.intervalCount) && pricing.intervalCount > 0 ? pricing.intervalCount : 1;
    return `${amount} / ${count > 1 ? `${count} ${period}s` : period}${pricing.quantity > 1 ? ' total' : ''}`;
  } catch { return null; }
}

export default function AccountDashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const returnPath = safeReturnPath(`${pathname}${params.toString() ? `?${params}` : ''}`);
  const loginPath = `/login?next=${encodeURIComponent(returnPath)}`;
  const justCheckedOut = params.get('checkout') === 'success';
  const canceledCheckout = ['cancelled', 'canceled'].includes(params.get('checkout'));
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [portalBusy, setPortalBusy] = useState(false);
  const [handleBusy, setHandleBusy] = useState(false);
  const [pollState, setPollState] = useState('idle');
  const [pollCycle, setPollCycle] = useState(0);
  const checkoutCtl = useStartCheckout();
  const handleCtl = useHandleClaim();
  const request = useRef(0);
  const loadingRef = useRef(false);
  const portalPending = useRef(false);
  const handlePending = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const current = ++request.current;
    setLoading(true);
    setError('');
    try {
      const account = await meOrNull();
      if (current !== request.current) return;
      if (!account) { router.replace(loginPath); return; }
      const billing = await billingStatus();
      if (current !== request.current) return;
      setUser(account);
      setStatus(billing);
    } catch (err) {
      if (current !== request.current) return;
      if (err?.status === 401) { router.replace(loginPath); return; }
      setError(errorMessage(err));
      setStatus(null);
    } finally {
      if (current === request.current) { loadingRef.current = false; setLoading(false); }
    }
  }, [router, loginPath]);

  useEffect(() => {
    load();
    const onFocus = () => { if (!portalPending.current && !handlePending.current) load(); };
    window.addEventListener('focus', onFocus);
    return () => { request.current += 1; loadingRef.current = false; window.removeEventListener('focus', onFocus); };
  }, [load]);

  useEffect(() => {
    if (!justCheckedOut || loading || !user || !status || status.entitled === true) return;
    const controller = new AbortController();
    setPollState('running');
    pollEntitlement({
      read: billingStatus,
      signal: controller.signal,
      onStatus: setStatus,
    }).then((result) => {
      if (!controller.signal.aborted) setPollState(result.entitled ? 'complete' : result.error ? 'error' : 'waiting');
    }).catch((err) => {
      if (controller.signal.aborted) return;
      if (err?.status === 401) router.replace(loginPath);
      else setPollState('error');
    });
    return () => controller.abort();
    // Status updates from this same poll must not tear it down after one attempt.
    // A fresh account load or explicit retry starts a new bounded cycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justCheckedOut, loading, user?.userId, pollCycle, router, loginPath]);

  async function openPortal() {
    if (portalPending.current) return;
    portalPending.current = true;
    setPortalBusy(true);
    setActionError('');
    try {
      const result = await billingPortal();
      window.location.assign(stripeRedirectURL(result?.url));
    } catch (err) {
      if (err?.status === 401) { router.replace(loginPath); return; }
      setActionError(errorMessage(err));
      portalPending.current = false;
      setPortalBusy(false);
    }
  }

  async function finishHandle(event) {
    event.preventDefault();
    if (handlePending.current) return;
    if (!validHandle(handleCtl.handle)) { setActionError('Choose a handle with 3–30 letters, numbers or underscores.'); return; }
    handlePending.current = true;
    setHandleBusy(true);
    setActionError('');
    try {
      const handle = await handleCtl.claim();
      setUser((account) => ({ ...account, handle }));
    } catch (err) {
      if (err?.status === 401) { router.replace(loginPath); return; }
      setActionError(errorMessage(err));
    } finally { handlePending.current = false; setHandleBusy(false); }
  }

  if (loading) return <Shell authed><main className="dash-main"><p className="spinner-note" role="status">Loading your account…</p></main></Shell>;
  if (error || !status || !user) return <Shell authed><main className="dash-main">
    <h1 className="dash-title">Your account</h1>
    <div className="alert alert-error" role="alert">{error || 'Your account could not be loaded.'}</div>
    <button type="button" className="btn btn-ghost" onClick={load}>Try again</button>
  </main></Shell>;

  const s = status;
  const grandfathered = s.grandfathered === true;
  const entitled = s.entitled === true;
  const pendingPayment = justCheckedOut && !entitled;
  const hasSubscription = !['none', 'canceled', 'incomplete_expired'].includes(s.entitlementStatus);
  const canSubscribe = !grandfathered && !entitled && !pendingPayment && !hasSubscription && Boolean(user.handle);
  const renewalDate = formatDate(s.currentPeriodEnd);
  const trialDate = formatDate(s.trialEndsAt);
  const graceDate = formatDate(s.graceEndsAt);
  const planName = s.offer === 'alpha' ? ALPHA_OFFER.name : s.plan === 'operator' ? 'Operator' : s.plan === 'desk' ? 'Desk' : '—';
  const price = priceLabel(s.pricing);

  return <Shell authed><main className="dash-main">
    <p className="eyebrow">Account</p>
    <h1 className="dash-title">{user.email}</h1>
    {user.handle && <p className="dash-handle">@{user.handle}</p>}
    <p className="dash-sub">{grandfathered ? 'Founding account' : entitled ? 'Your account has access to Merger.' : 'Your subscription does not currently include app access.'}</p>
    {actionError && <div className="alert alert-error" role="alert">{actionError}</div>}
    {s.configured === false && <div className="alert alert-warn">Billing is temporarily unavailable. Your account is saved; please check again later.</div>}
    {s.billingDetailsUnavailable && <div className="alert alert-warn">Current billing details could not be retrieved. <button type="button" className="linklike" onClick={load}>Try again</button></div>}
    {canceledCheckout && !entitled && <div className="alert alert-info" role="status">Checkout was not completed. Your account is saved, and you can continue below.</div>}
    {justCheckedOut && entitled && <div className="alert alert-info" role="status"><strong>Your account is ready.</strong> You can download Merger below.</div>}
    {pendingPayment && <div className="alert alert-info" role="status">
      {pollState === 'running' || pollState === 'idle' ? 'Confirming your subscription with Stripe…' : <>
        {pollState === 'error' ? 'We could not check your payment status.' : 'Your payment has not been confirmed yet.'} If you completed checkout, allow a moment for confirmation before starting another subscription.{' '}
        <button type="button" className="linklike" onClick={() => setPollCycle((value) => value + 1)}>Check payment again</button>
      </>}
    </div>}
    {!grandfathered && s.entitlementStatus === 'past_due' && <div className="alert alert-warn">
      <strong>Your payment did not go through.</strong>{entitled && graceDate ? ` Access continues until ${graceDate}.` : ' Update your payment method to restore access.'}{' '}
      <button type="button" className="linklike" disabled={portalBusy} onClick={openPortal}>Update payment method</button>
    </div>}
    {!grandfathered && s.cancelAtPeriodEnd && <div className="alert alert-warn">Your subscription is set to end{renewalDate ? ` on ${renewalDate}` : ' at the end of this billing period'}. {s.alphaPriceLocked && 'Your alpha price guarantee ends when the subscription ends.'}{' '}
      <button type="button" className="linklike" onClick={openPortal} disabled={portalBusy}>Manage cancellation</button>
    </div>}

    {!user.handle && <form className="panel mt-24" onSubmit={finishHandle} noValidate aria-busy={handleBusy}>
      <h2>Reserve your handle</h2>
      <p className="muted mt-16">Finish this account using your existing sign-in. You do not need to create another account.</p>
      <HandleField ctl={handleCtl} disabled={handleBusy} />
      <button type="submit" className="btn btn-primary" disabled={handleBusy}>{handleBusy ? 'Reserving…' : 'Reserve handle'}</button>
    </form>}

    <div className="panel mt-24">
      <div className="panel-head"><h2>Subscription</h2><StatusPill status={s.entitlementStatus} grandfathered={grandfathered} /></div>
      {grandfathered ? <p className="muted mt-16">Founding account — complimentary. You have access to Merger with no subscription and nothing to pay.</p> : <>
        <div className="stat-grid">
          <div className="stat"><div className="k">Plan</div><div className="v">{planName}</div></div>
          {price && <div className="stat"><div className="k">Subscription price</div><div className="v">{price}</div></div>}
          {s.seats > 1 && <div className="stat"><div className="k">Seats</div><div className="v">{s.seats}</div></div>}
          {s.entitlementStatus === 'trialing' && trialDate && <div className="stat"><div className="k">Trial ends</div><div className="v">{trialDate}</div></div>}
          {s.entitlementStatus !== 'trialing' && renewalDate && <div className="stat"><div className="k">{s.cancelAtPeriodEnd || s.entitlementStatus === 'canceled' ? 'Access until' : 'Current period ends'}</div><div className="v">{renewalDate}</div></div>}
          <div className="stat"><div className="k">Payment method</div><div className="v">{s.hasPaymentMethod ? 'On file' : 'None on file'}</div></div>
        </div>
        {price && <p className="field-hint mt-16">Recurring subtotal before tax, credits, or invoice adjustments. View invoices in Manage billing for final amounts.</p>}
        {s.alphaPriceLocked && <p className="field-hint mt-16">{ALPHA_OFFER.rateNotice}</p>}
        {(hasSubscription || s.hasPaymentMethod || s.entitlementStatus === 'canceled') && <>
          <div className="dl-row"><button className="btn btn-ghost btn-sm" type="button" onClick={openPortal} disabled={portalBusy}>{portalBusy ? 'Opening…' : 'Manage billing'}</button></div>
          <p className="field-hint mt-16">Manage your payment method, cancellation and invoices on Stripe.</p>
        </>}
      </>}
    </div>
    {canSubscribe && <div className="panel"><PlanStep ctl={checkoutCtl} heading={s.entitlementStatus === 'canceled' ? 'Subscribe again' : 'Join the paid alpha'} note={s.entitlementStatus === 'canceled' ? 'A new subscription uses the offer currently available below.' : 'Your account and handle are ready. Review the offer before continuing to checkout.'} /></div>}
    <div className="panel">
      <div className="panel-head"><h2>Desktop app</h2></div>
      <p className="muted mt-16">{entitled ? 'Check the available installers for your computer.' : 'Downloads unlock when your subscription is confirmed.'}</p>
      {entitled && <div className="dl-row"><Link className="btn btn-primary btn-sm" href="/download">Go to downloads</Link></div>}
    </div>
  </main></Shell>;
}
