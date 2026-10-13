import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams(''), usePathname: () => '/admin/campaigns' }));
vi.mock('next/link', () => ({ default: ({ children, replace, ...props }) => <a {...props}>{children}</a> }));
vi.mock('../app/components/Shell', () => ({ default: ({ children }) => <>{children}</> }));
vi.mock('../app/lib/api', async (original) => ({ ...await original(), accountAccess: vi.fn(), adminCampaigns: vi.fn() }));

import * as api from '../app/lib/api';
import AdminCampaignsPage, { totals } from '../app/admin/campaigns/page';

const day = (d, values) => ({ day: d, invited: 0, delivered: 0, clicked: 0, bounced: 0, complained: 0, accounts: 0, verified: 0, accepted: 0, trials: 0, paid: 0, ...values });
const report = {
  days: [day('2026-10-14', { invited: 500, delivered: 490, clicked: 120, bounced: 6, accounts: 60, verified: 55, accepted: 50, trials: 30, paid: 2 }),
         day('2026-10-15', { invited: 1000, delivered: 980, clicked: 200, accounts: 90, trials: 40 })],
  cohorts: [{ cohort: 'launch-windows', n: 1500 }],
  runs: [{ ran_at: '2026-10-15T14:05:00Z', cohort: 'launch-windows', quota: 1000, sent: 84, failed: 0, paused_reason: null }],
  remaining: 116500,
  ramp: { campaign: 'launch-windows', start: '2026-10-14', schedule: [500, 1000], todayQuota: 1000, sentToday: 420, status: 'running', health: { sent: 1500, bounced: 6, complained: 0 }, webhookConfigured: true },
};

beforeEach(() => {
  vi.clearAllMocks();
  api.accountAccess.mockResolvedValue({ user: { email: 'staff@example.test' }, capabilities: { isAdmin: true } });
  api.adminCampaigns.mockResolvedValue(report);
});

describe('campaigns dashboard', () => {
  it('adds up the days', () => {
    expect(totals(report.days)).toMatchObject({ invited: 1500, clicked: 320, trials: 70, paid: 2 });
  });

  it('shows the schedule, totals, funnel and daily rows', async () => {
    render(<AdminCampaignsPage />);
    expect(await screen.findByText('Sending on schedule')).toBeInTheDocument();
    expect(screen.getByText('116,500')).toBeInTheDocument();
    const tiles = screen.getByRole('region', { name: 'Totals' });
    expect(within(tiles).getByText('1,500')).toBeInTheDocument();
    expect(within(tiles).getByText('70')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Funnel' })).toHaveTextContent('Paid2');
    expect(screen.getAllByRole('row').length).toBeGreaterThan(3);
    expect(api.adminCampaigns).toHaveBeenCalledWith({ cohort: '', days: 30 });
    expect(screen.queryByText(/Email tracking is not connected/)).not.toBeInTheDocument();
  });

  it('warns when tracking is not connected and when paused', async () => {
    api.adminCampaigns.mockResolvedValue({ ...report, ramp: { ...report.ramp, status: 'bounce_rate', webhookConfigured: false } });
    render(<AdminCampaignsPage />);
    expect(await screen.findByText('Paused: bounce rate too high')).toBeInTheDocument();
    expect(screen.getByText(/Email tracking is not connected/)).toBeInTheDocument();
  });

  it('refuses non-staff', async () => {
    api.adminCampaigns.mockRejectedValue(new api.ApiError(403));
    render(<AdminCampaignsPage />);
    expect(await screen.findByRole('heading', { name: 'Staff access required' })).toBeInTheDocument();
  });
});
