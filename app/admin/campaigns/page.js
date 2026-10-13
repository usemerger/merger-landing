'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Shell from '../../components/Shell';
import { accountAccess, adminCampaigns, errorMessage } from '../../lib/api';
import { waitlistPermissions } from '../../lib/waitlistPermissions';
import '../waitlist/waitlist-admin.css';
import './campaigns.css';

// The funnel, in order. Each stage is a share of the one before it except the
// account stages, which are a share of everyone invited.
const STAGES = [
  ['invited', 'Invited', null],
  ['delivered', 'Delivered', 'invited'],
  ['clicked', 'Clicked', 'delivered'],
  ['accounts', 'Accounts', 'invited'],
  ['verified', 'Verified', 'accounts'],
  ['accepted', 'Accepted', 'verified'],
  ['trials', 'Trials', 'accepted'],
  ['paid', 'Paid', 'trials'],
];
const COLUMNS = ['invited', 'delivered', 'clicked', 'bounced', 'complained', 'accounts', 'verified', 'accepted', 'trials', 'paid'];
const STATUS = {
  running: ['Sending on schedule', 'good'],
  no_start_date: ['Not scheduled: no start date set', 'muted'],
  not_started: ['Scheduled, not started yet', 'muted'],
  bad_start_date: ['Start date is invalid', 'warn'],
  no_ramp: ['No ramp configured', 'warn'],
  bounce_rate: ['Paused: bounce rate too high', 'warn'],
  complaint_rate: ['Paused: complaint rate too high', 'warn'],
};

export function totals(days = []) {
  const sum = Object.fromEntries(COLUMNS.map((key) => [key, 0]));
  for (const day of days) for (const key of COLUMNS) sum[key] += Number(day[key]) || 0;
  return sum;
}
const pct = (part, whole) => (whole ? `${((part / whole) * 100).toFixed(part / whole < 0.1 ? 1 : 0)}%` : '–');
// Funnel days and the start date are calendar dates in UTC; show them as such.
const dayLabel = (value) => new Date(`${String(value).slice(0, 10)}T12:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const n = (value) => (Number(value) || 0).toLocaleString();

export default function AdminCampaignsPage() {
  const [permissions, setPermissions] = useState(() => waitlistPermissions());
  const [phase, setPhase] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [cohort, setCohort] = useState('');
  const [days, setDays] = useState(30);
  const [refreshing, setRefreshing] = useState(false);
  const request = useRef(0);

  const load = useCallback(async () => {
    const id = ++request.current; setRefreshing(true); setError('');
    try {
      if (phase === 'loading') {
        const access = await accountAccess();
        if (id !== request.current) return;
        setPermissions(waitlistPermissions(access.capabilities));
      }
      const result = await adminCampaigns({ cohort, days });
      if (id !== request.current) return;
      setData(result); setPhase('ready');
    } catch (err) {
      if (id !== request.current) return;
      if (err?.status === 401 || err?.status === 403) setPhase('forbidden');
      else { setError(errorMessage(err)); setPhase((current) => (current === 'loading' ? 'error' : current)); }
    } finally { if (id === request.current) setRefreshing(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohort, days]);
  useEffect(() => { load(); return () => { request.current += 1; }; }, [load]);

  const sum = totals(data?.days);
  const ramp = data?.ramp;
  const [statusLabel, statusTone] = STATUS[ramp?.status] || [ramp?.status || '', 'muted'];
  const health = ramp?.health || {};

  return <Shell authed capabilities={permissions}><main className="wa-main">
    <header className="wa-heading"><div><p className="eyebrow">Staff workspace</p><h1>Campaigns</h1><p className="wa-lede">Who was invited, who opened the door, and who became a member. Counted once per person, on the day they were first invited.</p></div>
      {phase === 'ready' && <div className="wa-actions"><Link className="btn btn-ghost" href="/admin/growth">Growth</Link><Link className="btn btn-ghost" href="/admin/waitlist">Waitlist</Link><button type="button" className="btn btn-ghost wa-refresh" disabled={refreshing} onClick={load}>{refreshing ? 'Refreshing…' : 'Refresh'}</button></div>}</header>
    {phase === 'loading' && <section className="wa-empty wa-loading" role="status"><span className="wa-loader" /><h2>Loading campaigns…</h2></section>}
    {phase === 'forbidden' && <section className="wa-empty"><h2>Staff access required</h2><p>Sign in with a verified staff account to see campaign results.</p><Link className="btn btn-ghost" href="/dashboard">Your account</Link></section>}
    {error && <div className="wa-notice wa-notice-error" role="alert"><p>{error}</p><button type="button" className="btn btn-ghost" onClick={load}>Try again</button></div>}

    {phase === 'ready' && data && <>
      <section className="cp-ramp" aria-label="Sending schedule">
        <div className="cp-ramp-head"><div><p className="wa-kicker">Sending schedule</p><h2>{ramp.campaign}</h2></div><span className={`cp-status cp-status-${statusTone}`}>{statusLabel}</span></div>
        <dl className="cp-ramp-grid">
          <div><dt>Sent today</dt><dd>{n(ramp.sentToday)} <span>of {n(ramp.todayQuota)}</span></dd></div>
          <div><dt>Still to invite</dt><dd>{n(data.remaining)}</dd></div>
          <div><dt>Bounce rate, 3 days</dt><dd>{pct(health.bounced, health.sent)} <span>limit 3%</span></dd></div>
          <div><dt>Complaint rate, 3 days</dt><dd>{pct(health.complained, health.sent)} <span>limit 0.1%</span></dd></div>
          <div><dt>Started</dt><dd>{ramp.start ? dayLabel(ramp.start) : 'Not set'}</dd></div>
        </dl>
        {!ramp.webhookConfigured && <p className="cp-warning" role="status">Email tracking is not connected yet, so delivered, clicked, bounced and complained will read zero and the safety brake cannot see bounces.</p>}
      </section>

      <div className="cp-filters" role="group" aria-label="Filters">
        <label>Campaign<select value={cohort} onChange={(event) => setCohort(event.target.value)}><option value="">All campaigns</option>{data.cohorts.map((c) => <option key={c.cohort} value={c.cohort}>{c.cohort} ({n(c.n)})</option>)}</select></label>
        <label>Period<select value={days} onChange={(event) => setDays(Number(event.target.value))}>{[7, 30, 90, 180].map((d) => <option key={d} value={d}>Last {d} days</option>)}</select></label>
      </div>

      <section className="cp-tiles" aria-label="Totals">{[
        ['Invited', sum.invited, `${n(sum.bounced)} bounced`],
        ['Clicked', sum.clicked, `${pct(sum.clicked, sum.delivered)} of delivered`],
        ['Accounts', sum.accounts, `${pct(sum.accounts, sum.invited)} of invited`],
        ['Trials', sum.trials, `${pct(sum.trials, sum.invited)} of invited`],
        ['Paid', sum.paid, `${pct(sum.paid, sum.trials)} of trials`],
      ].map(([label, value, note]) => <div key={label} className="wa-stat cp-tile"><span className="wa-stat-label">{label}</span><strong>{n(value)}</strong><span className="wa-stat-description">{note}</span></div>)}</section>

      <section className="cp-panel" aria-label="Funnel">
        <h2>Funnel</h2>
        <ol className="cp-funnel">{STAGES.map(([key, label, base]) => {
          const width = sum.invited ? Math.max((sum[key] / sum.invited) * 100, sum[key] ? 0.6 : 0) : 0;
          return <li key={key} title={`${label}: ${n(sum[key])}${base ? ` (${pct(sum[key], sum[base])} of ${base})` : ''}`}>
            <span className="cp-funnel-label">{label}</span>
            <span className="cp-funnel-track"><span className="cp-funnel-bar" style={{ width: `${width}%` }} /></span>
            <span className="cp-funnel-value">{n(sum[key])}<small>{base ? pct(sum[key], sum[base]) : ''}</small></span>
          </li>;
        })}</ol>
      </section>

      <section className="cp-panel" aria-label="By day of invitation">
        <h2>By day of invitation</h2>
        {data.days.length === 0 ? <p className="cp-empty">No invitations in this period yet.</p> : <div className="cp-scroll"><table className="cp-table">
          <thead><tr><th scope="col">Day</th>{COLUMNS.map((key) => <th key={key} scope="col">{key[0].toUpperCase() + key.slice(1)}</th>)}</tr></thead>
          <tbody>{[...data.days].reverse().map((day) => <tr key={day.day}><th scope="row">{dayLabel(day.day)}</th>{COLUMNS.map((key) => <td key={key}>{n(day[key])}</td>)}</tr>)}</tbody>
        </table></div>}
      </section>

      <section className="cp-panel" aria-label="Recent sending runs">
        <h2>Recent sending runs</h2>
        {data.runs.length === 0 ? <p className="cp-empty">The scheduled sender has not run yet.</p> : <div className="cp-scroll"><table className="cp-table">
          <thead><tr><th scope="col">When</th><th scope="col">Campaign</th><th scope="col">Day quota</th><th scope="col">Sent</th><th scope="col">Failed</th><th scope="col">Note</th></tr></thead>
          <tbody>{data.runs.map((run) => <tr key={run.ran_at}><th scope="row">{new Date(run.ran_at).toLocaleString()}</th><td>{run.cohort}</td><td>{n(run.quota)}</td><td>{n(run.sent)}</td><td>{n(run.failed)}</td><td>{run.paused_reason ? (STATUS[run.paused_reason]?.[0] || run.paused_reason) : ''}</td></tr>)}</tbody>
        </table></div>}
      </section>
    </>}
  </main></Shell>;
}
