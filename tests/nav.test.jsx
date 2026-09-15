import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MarketingNav from '../app/components/MarketingNav';
import { logout, meOrNull } from '../app/lib/api';

vi.mock('../app/lib/api', () => ({ meOrNull: vi.fn(), logout: vi.fn() }));

const nav = () => render(<MarketingNav signupHref="/signup?offer=alpha" checkoutLabel="Join the alpha" />);
const account = { userId: 'u1', email: 'dana@firm.test', handle: 'danadesk', displayName: 'Dana' };

beforeEach(() => {
  meOrNull.mockReset();
  logout.mockReset();
  localStorage.clear();
});

describe('the marketing nav and the session it never used to ask about', () => {
  it('shows the account, a dashboard link and sign out when a session exists', async () => {
    meOrNull.mockResolvedValue(account);
    nav();
    expect(await screen.findByText('@danadesk')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
    // The whole point: no invitation to sign in to an account you are in.
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Join the alpha' })).toBeNull();
  });

  it('shows sign in and the CTA when there is no session', async () => {
    meOrNull.mockResolvedValue(null);
    nav();
    expect(await screen.findByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Join the alpha' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull();
  });

  it('never flashes "Sign in" while the check is still in flight', async () => {
    // The regression this file exists for. A prerendered page cannot know the
    // answer at first paint, so the first frame must say nothing rather than
    // say the wrong thing.
    let resolve;
    meOrNull.mockReturnValue(new Promise((r) => { resolve = r; }));
    nav();
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Open dashboard' })).toBeNull();
    resolve(account);
    expect(await screen.findByRole('link', { name: 'Open dashboard' })).toBeInTheDocument();
  });

  it('paints the last-known state before the network answers', async () => {
    localStorage.setItem('merger_nav_session', JSON.stringify({ handle: 'danadesk', email: 'dana@firm.test' }));
    meOrNull.mockReturnValue(new Promise(() => {}));   // never settles
    nav();
    // No await on the network: the hint alone has to be enough to paint.
    expect(await screen.findByRole('link', { name: 'Open dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
  });

  it('corrects a stale hint once the server disagrees', async () => {
    localStorage.setItem('merger_nav_session', JSON.stringify({ handle: 'danadesk' }));
    meOrNull.mockResolvedValue(null);
    nav();
    expect(await screen.findByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open dashboard' })).toBeNull();
    expect(localStorage.getItem('merger_nav_session')).toBe('out');
  });

  it('keeps the signed-in nav when the check fails, rather than lying either way', async () => {
    localStorage.setItem('merger_nav_session', JSON.stringify({ handle: 'danadesk' }));
    meOrNull.mockRejectedValue({ status: 0, code: 'network_error' });
    nav();
    expect(await screen.findByRole('link', { name: 'Open dashboard' })).toBeInTheDocument();
  });

  it('falls back to signed out when the check fails with nothing remembered', async () => {
    meOrNull.mockRejectedValue({ status: 0, code: 'network_error' });
    nav();
    expect(await screen.findByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('forgets the cached account on sign out, before the request finishes', async () => {
    const assign = vi.fn();
    Object.defineProperty(window, 'location', { value: { assign }, writable: true });
    meOrNull.mockResolvedValue(account);
    logout.mockResolvedValue({ ok: true });
    nav();
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(logout).toHaveBeenCalled());
    expect(localStorage.getItem('merger_nav_session')).toBeNull();
    await waitFor(() => expect(assign).toHaveBeenCalledWith('/'));
  });
});
