'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Shell from '../../components/Shell';
import { accountAccess, adminMetrics, errorMessage } from '../../lib/api';
import { waitlistPermissions } from '../../lib/waitlistPermissions';
import '../waitlist/waitlist-admin.css';
import '../campaigns/campaigns.css';
import './growth.css';

export const money = (cents, { exact = false } = {}) => {
  if (cents === null || cents === undefined) return '–';
  const dollars = cents / 100;
  return dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: exact || Math.abs(dollars) < 100 ? 2 : 0, minimumFractionDigits: (exact || (Math.abs(dollars) < 100 && !Number.isInteger(dollars))) ? 2 : 0 });
};
export const pct = (value) => (value === null || value === undefined ? '–' : `${(value * 100).toFixed(value < 0.1 ? 1 : 0)}%`);
const n = (value) => (Number(value) || 0).toLocaleString();
const monthLabel = (iso, long = false) => new Date(`${String(iso).slice(0, 7)}-15T12:00:00Z`).toLocaleDateString('en-US', { month: long ? 'long' : 'short', year: long ? 'numeric' : '2-digit', timeZone: 'UTC' });

const DIMENSIONS = [
  ['channel', 'Channel', 'How people first found Merger.'],
  ['campaign', 'Campaign', 'The campaign tag on their first visit, or the email campaign that invited them.'],
  ['plan', 'Plan', 'The plan they are on now, or were on when they left.'],
  ['product', 'Product', 'Parts of Merger they have used. People can use several, so rows overlap.'],
];

// The last 12 calendar months, oldest first, with empty months kept so gaps
// read as gaps rather than disappearing.
export function lastTwelve(rows, now = new Date()) {
  const byMonth = Object.fromEntries((rows || []).map((r) => [String(r.month).slice(0, 7), r]));
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1));
    const key = d.toISOString().slice(0, 7);
    return { month: `${key}-01`, cents: byMonth[key]?.cents || 0, customers: byMonth[key]?.customers || 0 };
  });
}

function RevenueChart({ months }) {
  const max = Math.max(...months.map((m) => m.cents), 1);
  const [active, setActive] = useState(null);
  return <div className="gr-chart" onMouseLeave={() => setActive(null)}>
    <div className="gr-bars" role="list" aria-label="Revenue collected by month">
      {months.map((m, i) => <div key={m.month} role="listitem" tabIndex={0} className={`gr-bar-col${active === i ? ' is-active' : ''}`}
        aria-label={`${monthLabel(m.month, true)}: ${money(m.cents)} from ${n(m.customers)} customers`}
        onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}>
        <span className="gr-bar" style={{ height: `${m.cents ? Math.max((m.cents / max) * 100, 1.5) : 0}%` }} />
        {active === i && <span className={`gr-tip${i > 8 ? ' is-left' : ''}`} role="tooltip"><strong>{money(m.cents)}</strong><span>{monthLabel(m.month, true)}</span><span>{n(m.customers)} paying {m.customers === 1 ? 'customer' : 'customers'}</span></span>}
      </div>)}
    </div>
    <div className="gr-axis" aria-hidden="true">{months.map((m, i) => <span key={m.month}>{i % 2 === 1 || months.length <= 6 ? monthLabel(m.month) : ''}</span>)}</div>
  </div>;
}

export default function AdminGrowthPage() {
  const [permissions, setPermissions] = useState(() => waitlistPermissions());
  const [phase, setPhase] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [dimension, setDimension] = useState('channel');
  const [refreshing, setRefreshing] = useState(false);
  const request = useRef(0);
  const first = useRef(true);

  const load = useCallback(async () => {
    const id = ++request.current; setRefreshing(true); setError('');
    try {
      if (first.current) {
        const access = await accountAccess();
        if (id !== request.current) return;
        setPermissions(waitlistPermissions(access.capabilities));
        first.current = false;
      }
      const result = await adminMetrics();
      if (id !== request.current) return;
      setData(result); setPhase('ready');
    } catch (err) {
      if (id !== request.current) return;
      if (err?.status === 401 || err?.status === 403) setPhase('forbidden');
      else { setError(errorMessage(err)); setPhase((p) => (p === 'loading' ? 'error' : p)); }
    } finally { if (id === request.current) setRefreshing(false); }
  }, []);
  useEffect(() => { load(); return () => { request.current += 1; }; }, [load]);

  const s = data?.summary;
  const mv = data?.movement || {};
  const months = useMemo(() => lastTwelve(data?.revenueByMonth), [data]);
  const rows = data?.segments?.[dimension] || [];
  const maxRevenue = Math.max(...rows.map((r) => r.revenueCents || 0), 1);
  const net = (mv.new_mrr || 0) + (mv.expansion_mrr || 0) - (mv.contraction_mrr || 0) - (mv.churned_mrr || 0);
  const dim = DIMENSIONS.find(([key]) => key === dimension);

  return <Shell authed capabilities={permissions}><main className="wa-main">
    <header className="wa-heading"><div><p className="eyebrow">Staff workspace</p><h1>Growth</h1><p className="wa-lede">Revenue, retention and lifetime value, by where members came from and what they use.</p></div>
      {phase === 'ready' && <div className="wa-actions"><Link className="btn btn-ghost" href="/admin/campaigns">Campaigns</Link><button type="button" className="btn btn-ghost wa-refresh" disabled={refreshing} onClick={load}>{refreshing ? 'Refreshing…' : 'Refresh'}</button></div>}</header>
    {phase === 'loading' && <section className="wa-empty wa-loading" role="status"><span className="wa-loader" /><h2>Loading growth metrics…</h2></section>}
    {phase === 'forbidden' && <section className="wa-empty"><h2>Staff access required</h2><p>Sign in with a verified staff account to see growth metrics.</p><Link className="btn btn-ghost" href="/dashboard">Your account</Link></section>}
    {error && <div className="wa-notice wa-notice-error" role="alert"><p>{error}</p><button type="button" className="btn btn-ghost" onClick={load}>Try again</button></div>}

    {phase === 'ready' && s && <>
      <section className="cp-tiles gr-tiles" aria-label="Revenue">{[
        ['MRR', money(s.mrrCents), `${n(s.payingCustomers)} paying`],
        ['ARR', money(s.arrCents), 'MRR × 12'],
        ['ARPA', money(s.arpaCents), 'Average monthly revenue per paying account'],
        ['Revenue, 30 days', money(s.revenueLast30Cents), `${money(s.revenueLifetimeCents)} lifetime`],
      ].map(([label, value, note]) => <div key={label} className="wa-stat cp-tile"><span className="wa-stat-label">{label}</span><strong>{value}</strong><span className="wa-stat-description">{note}</span></div>)}</section>
      <section className="cp-tiles gr-tiles" aria-label="Retention and value">{[
        ['Trial to paid', pct(s.trialToPaid), s.trialsMatured ? `of ${n(s.trialsMatured)} finished trials` : 'No trials have finished yet'],
        ['Monthly churn', pct(s.monthlyChurn), s.monthlyChurn === null ? 'Shown after 30 days of history' : `of ${n(s.churnSample)} paying 30 days ago`],
        ['LTV, realized', money(s.realizedLtvCents), 'Revenue so far per paying customer'],
        ['LTV, predicted', money(s.predictedLtvCents), s.predictedLtvCents === null ? 'Needs a churn rate first' : 'ARPA ÷ monthly churn'],
      ].map(([label, value, note]) => <div key={label} className="wa-stat cp-tile"><span className="wa-stat-label">{label}</span><strong>{value}</strong><span className="wa-stat-description">{note}</span></div>)}</section>

      <section className="cp-panel gr-strip" aria-label="Pipeline">
        <dl className="cp-ramp-grid">
          <div><dt>Waitlist, no account</dt><dd>{n(s.leads)}</dd></div>
          <div><dt>Accounts</dt><dd>{n(s.accounts)} <span>{n(s.verified)} verified</span></dd></div>
          <div><dt>In trial</dt><dd>{n(s.trialing)} <span>{money(s.trialPipelineMrrCents)} MRR if all convert</span></dd></div>
          <div><dt>Paying</dt><dd>{n(s.payingCustomers)}</dd></div>
          <div><dt>MRR change, 30 days</dt><dd className={net < 0 ? 'gr-neg' : ''}>{net >= 0 ? '+' : '−'}{money(Math.abs(net))}</dd></div>
        </dl>
        <p className="gr-movement">New {money(mv.new_mrr || 0)} · Expansion {money(mv.expansion_mrr || 0)} · Contraction −{money(mv.contraction_mrr || 0)} · Churned −{money(mv.churned_mrr || 0)}</p>
      </section>

      <section className="cp-panel" aria-label="Revenue by month">
        <div className="gr-panel-head"><h2>Revenue collected by month</h2><p>Paid Stripe invoices{data.revenueSince ? '' : '. None recorded yet'}.</p></div>
        <RevenueChart months={months} />
      </section>

      <section className="cp-panel" aria-label="Breakdown">
        <div className="gr-panel-head"><h2>Breakdown</h2>
          <div className="gr-segmented" role="tablist" aria-label="Break down by">{DIMENSIONS.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={dimension === key} className={dimension === key ? 'is-active' : ''} onClick={() => setDimension(key)}>{label}</button>)}</div>
        </div>
        <p className="gr-hint">{dim[2]}</p>
        {rows.length === 0 ? <p className="cp-empty">No accounts yet.</p> : <div className="cp-scroll"><table className="cp-table gr-table">
          <thead><tr><th scope="col">{dim[1]}</th>{dimension === 'channel' && <th scope="col">Waitlist</th>}<th scope="col">Accounts</th><th scope="col">Trials</th><th scope="col">Paying</th><th scope="col">Converted</th><th scope="col">Trial → paid</th><th scope="col">MRR</th><th scope="col">ARPA</th><th scope="col">Revenue</th><th scope="col">LTV</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.name}>
            <th scope="row">{r.name}</th>{dimension === 'channel' && <td>{n(r.leads)}</td>}<td>{n(r.accounts)}</td><td>{n(r.trials)}</td><td>{n(r.paying)}</td><td>{pct(r.conversion)}</td><td>{pct(r.trialToPaid)}</td><td>{money(r.mrrCents)}</td><td>{money(r.arpaCents)}</td>
            <td className="gr-rev"><span className="gr-rev-bar" style={{ width: `${((r.revenueCents || 0) / maxRevenue) * 100}%` }} aria-hidden="true" /><span>{money(r.revenueCents)}</span></td><td>{money(r.ltvCents)}</td>
          </tr>)}</tbody>
        </table></div>}
      </section>

      <section className="cp-panel" aria-label="Signup cohorts">
        <div className="gr-panel-head"><h2>Signup cohorts</h2><p>Accounts grouped by the month they signed up.</p></div>
        {data.cohorts.length === 0 ? <p className="cp-empty">No accounts in the last 12 months.</p> : <div className="cp-scroll"><table className="cp-table">
          <thead><tr><th scope="col">Signed up</th><th scope="col">Accounts</th><th scope="col">Trials</th><th scope="col">Ever paid</th><th scope="col">Paying now</th><th scope="col">Converted</th><th scope="col">Revenue</th><th scope="col">Per account</th></tr></thead>
          <tbody>{data.cohorts.map((c) => <tr key={c.month}><th scope="row">{monthLabel(c.month, true)}</th><td>{n(c.accounts)}</td><td>{n(c.trials)}</td><td>{n(c.everPaid)}</td><td>{n(c.paying)}</td><td>{pct(c.conversion)}</td><td>{money(c.revenueCents)}</td><td>{money(c.accounts ? Math.round(c.revenueCents / c.accounts) : null)}</td></tr>)}</tbody>
        </table></div>}
      </section>

      <details className="cp-panel gr-defs"><summary>How these are calculated</summary><ul>
        <li><strong>MRR</strong>: monthly value of every active or past-due subscription with a price. Annual plans count as 1/12 a month. Complimentary access is not revenue.</li>
        <li><strong>Revenue</strong>: paid Stripe invoices. Refunds are not subtracted yet.</li>
        <li><strong>LTV, realized</strong>: revenue collected so far divided by everyone who has ever paid. <strong>Predicted</strong>: ARPA divided by monthly churn, once there are 30 days of history and at least 10 paying customers.</li>
        <li><strong>Churn</strong>: paying customers 30 days ago who are no longer paying.</li>
        <li><strong>Channel</strong>: first visit only, in this order: paid ads, email, social, referral, search, other campaign tags, imported list, other websites, direct. Visits before this dashboard launched count as direct unless they came by referral link, email invite or import.</li>
      </ul></details>
    </>}
  </main></Shell>;
}
