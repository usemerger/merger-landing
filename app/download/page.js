'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '../components/Shell';
import PlanStep, { useStartCheckout } from '../components/PlanStep';
import { download, errorMessage, meOrNull, statusLabel } from '../lib/api';
import { normalizeInstallers } from '../lib/authFlow';

export default function DownloadPage() {
  const router = useRouter();
  const [state, setState] = useState({ phase: 'loading' });
  const checkoutCtl = useStartCheckout();
  const generation = useRef(0);
  const pending = useRef(false);

  const load = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    const request = ++generation.current;
    setState({ phase: 'loading' });
    try {
      const user = await meOrNull();
      if (request !== generation.current) return;
      if (!user) { router.replace('/login?next=/download'); return; }
      try {
        const payload = await download();
        if (request !== generation.current) return;
        setState({ phase: 'entitled', installers: normalizeInstallers(payload), version: typeof payload?.version === 'string' ? payload.version : null });
      } catch (error) {
        if (request !== generation.current) return;
        // Permission errors unrelated to subscription must remain errors.
        if (error?.code === 'subscription_required') {
          setState({ phase: 'locked', user, entitlementStatus: error.body?.entitlementStatus || 'none' });
          return;
        }
        throw error;
      }
    } catch (error) {
      if (request !== generation.current) return;
      if (error?.status === 401) { router.replace('/login?next=/download'); return; }
      setState({ phase: 'error', message: errorMessage(error) });
    } finally {
      if (request === generation.current) pending.current = false;
    }
  }, [router]);

  useEffect(() => { load(); return () => { generation.current += 1; pending.current = false; }; }, [load]);

  if (state.phase === 'loading') return <Shell authed><main className="dash-main"><p className="spinner-note" role="status">Checking download access…</p></main></Shell>;
  if (state.phase === 'error') return <Shell authed><main className="dash-main">
    <h1 className="dash-title">Downloads</h1>
    <div className="alert alert-error" role="alert">{state.message}</div>
    <div className="dl-row"><button className="btn btn-ghost btn-sm" type="button" onClick={load}>Try again</button><Link className="btn btn-ghost btn-sm" href="/dashboard">Your account</Link></div>
  </main></Shell>;

  if (state.phase === 'locked') {
    const canceled = state.entitlementStatus === 'canceled';
    const canSubscribe = state.user.handle && ['none', 'canceled', 'incomplete_expired'].includes(state.entitlementStatus);
    return <Shell authed><main className="dash-main">
      <p className="eyebrow">Downloads</p>
      <h1 className="dash-title">Alpha access unlocks Merger.</h1>
      <p className="dash-sub">Your membership status is <strong>{statusLabel(state.entitlementStatus).toLowerCase()}</strong>. Downloads unlock when the server confirms access.</p>
      <div className="panel mt-24">
        {canSubscribe ? <PlanStep ctl={checkoutCtl} heading={canceled ? 'Join again' : 'Join the alpha'} note={canceled ? 'Review the alpha terms before joining again.' : 'Your account and handle are ready. Review the terms to continue.'} /> : <>
          <h2>{!state.user.handle ? 'Finish your account' : 'Manage your membership'}</h2>
          <p className="muted mt-16">{!state.user.handle ? 'Reserve your handle from your account before joining.' : 'Review your payment and membership details from your account.'}</p>
          <div className="dl-row"><Link className="btn btn-primary btn-sm" href="/dashboard">Go to your account</Link></div>
        </>}
      </div>
      <div className="dl-row"><button className="btn btn-ghost btn-sm" type="button" onClick={load}>Check access again</button><Link className="btn btn-ghost btn-sm" href="/dashboard">Your account</Link></div>
    </main></Shell>;
  }

  const { windows, macos } = state.installers;
  const anyReady = Boolean(windows || macos);
  return <Shell authed><main className="dash-main">
    <p className="eyebrow">Downloads</p>
    <h1 className="dash-title">Get Merger for desktop.</h1>
    <p className="dash-sub">Your account has download access. Install Merger, sign in and connect your messaging accounts.</p>
    <div className="panel mt-24">
      {anyReady ? <>
        <div className="panel-head"><h2>Installers</h2>{state.version && <span className="pill neutral">Version {state.version}</span>}</div>
        <div className="dl-row">
          {windows && <a className="btn btn-primary btn-sm" href={windows} download>Download for Windows{state.version ? ` (v${state.version})` : ''}</a>}
          {macos && <a className="btn btn-ghost btn-sm" href={macos} download>Download for macOS{state.version ? ` (v${state.version})` : ''}</a>}
        </div>
        {!macos && <p className="field-hint mt-16">A macOS installer is not currently available.</p>}
        {!windows && <p className="field-hint mt-16">A Windows installer is not currently available.</p>}
        <p className="field-hint mt-16">If your download does not start, try the link again or refresh the installer list below.</p>
      </> : <>
        <h2>Download temporarily unavailable</h2>
        <p className="muted mt-16">Your account has access, but no installer is currently available. Please check again shortly.</p>
      </>}
      <div className="dl-row"><button className="btn btn-ghost btn-sm" type="button" onClick={load}>{anyReady ? 'Refresh installers' : 'Check again'}</button></div>
    </div>
    <p className="field-hint mt-16">Use the same email and password in the app as on this site.</p>
    <div className="dl-row"><Link className="btn btn-ghost btn-sm" href="/dashboard">Your account</Link></div>
  </main></Shell>;
}
