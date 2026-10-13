import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams(''), usePathname: () => '/admin/growth' }));
vi.mock('next/link', () => ({ default: ({ children, replace, ...props }) => <a {...props}>{children}</a> }));
vi.mock('../app/components/Shell', () => ({ default: ({ children }) => <>{children}</> }));
vi.mock('../app/lib/api', async (original) => ({ ...await original(), accountAccess: vi.fn(), adminMetrics: vi.fn() }));

import * as api from '../app/lib/api';
import AdminGrowthPage, { lastTwelve, money, pct } from '../app/admin/growth/page';

const seg = (name, extra = {}) => ({ name, accounts: 10, verified: 9, trials: 6, everPaid: 4, paying: 3, mrrCents: 15000, revenueCents: 40000, conversion: 0.4, trialToPaid: 0.5, arpaCents: 5000, ltvCents: 10000, ...extra });
const report = {
  summary: { mrrCents: 450000, arrCents: 5400000, payingCustomers: 90, trialing: 40, trialPipelineMrrCents: 200000, arpaCents: 5000, trialToPaid: 0.42, trialsMatured: 120, monthlyChurn: null, churnSample: 0, revenueLast30Cents: 410000, revenueLifetimeCents: 900000, realizedLtvCents: 9000, predictedLtvCents: null, accounts: 400, verified: 350, leads: 118000 },
  movement: { new_mrr: 60000, expansion_mrr: 0, contraction_mrr: 0, churned_mrr: 5000 },
  revenueByMonth: [{ month: '2026-10-01', cents: 410000, customers: 82 }],
  revenueSince: '2026-09-01T00:00:00Z',
  segments: { channel: [seg('Paid ads', { leads: 40 }), seg('Imported list', { leads: 118000, accounts: 0 })], campaign: [seg('launch-windows')], plan: [seg('Pilot · monthly'), seg('Pilot · annual')], product: [seg('Messaging'), seg('Deal Desk')] },
  cohorts: [{ month: '2026-10-01', ...seg('x') }],
};

beforeEach(() => {
  vi.clearAllMocks();
  api.accountAccess.mockResolvedValue({ user: { email: 's@example.test' }, capabilities: { isAdmin: true } });
  api.adminMetrics.mockResolvedValue(report);
});

describe('growth dashboard', () => {
  it('formats money and percentages', () => {
    expect(money(450000)).toBe('$4,500');
    expect(money(4999)).toBe('$49.99');
    expect(money(4660)).toBe('$46.60');
    expect(money(5000)).toBe('$50');
    expect(money(null)).toBe('–');
    expect(pct(0.42)).toBe('42%');
    expect(pct(0.05)).toBe('5.0%');
  });
  it('fills twelve months, keeping empty ones', () => {
    const months = lastTwelve([{ month: '2026-10-01', cents: 5, customers: 1 }], new Date('2026-11-15T00:00:00Z'));
    expect(months).toHaveLength(12);
    expect(months[11]).toMatchObject({ month: '2026-11-01', cents: 0 });
    expect(months[10]).toMatchObject({ month: '2026-10-01', cents: 5 });
  });
  it('shows the headline numbers and explains missing churn', async () => {
    render(<AdminGrowthPage />);
    const revenue = await screen.findByRole('region', { name: 'Revenue' });
    expect(within(revenue).getByText('$4,500')).toBeInTheDocument();
    expect(within(revenue).getByText('$54,000')).toBeInTheDocument();
    const retention = screen.getByRole('region', { name: 'Retention and value' });
    expect(within(retention).getByText('Shown after 30 days of history')).toBeInTheDocument();
    expect(within(retention).getByText('42%')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Pipeline' })).getByText('118,000')).toBeInTheDocument();
  });
  it('switches the breakdown between channel, plan and product', async () => {
    render(<AdminGrowthPage />);
    const table = await screen.findByRole('region', { name: 'Breakdown' });
    expect(within(table).getByText('Paid ads')).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Waitlist' })).toBeInTheDocument();
    fireEvent.click(within(table).getByRole('tab', { name: 'Plan' }));
    expect(within(table).getByText('Pilot · annual')).toBeInTheDocument();
    expect(within(table).queryByRole('columnheader', { name: 'Waitlist' })).toBeNull();
    fireEvent.click(within(table).getByRole('tab', { name: 'Product' }));
    expect(within(table).getByText('Deal Desk')).toBeInTheDocument();
    expect(within(table).getByText(/rows overlap/)).toBeInTheDocument();
  });
  it('refuses non-staff', async () => {
    api.adminMetrics.mockRejectedValue(new api.ApiError(403));
    render(<AdminGrowthPage />);
    expect(await screen.findByRole('heading', { name: 'Staff access required' })).toBeInTheDocument();
  });
});
