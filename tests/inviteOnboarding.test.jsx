import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ router: { replace: vi.fn(), refresh: vi.fn() }, query: '' }));
vi.mock('next/navigation', () => ({ useRouter: () => nav.router, useSearchParams: () => new URLSearchParams(nav.query), usePathname: () => '/' }));
vi.mock('next/link', () => ({ default: ({ children, replace, ...props }) => <a {...props}>{children}</a> }));
vi.mock('../app/components/Shell', () => ({ default: ({ children }) => <>{children}</> }));
vi.mock('../app/lib/api', async (original) => ({ ...await original(), accountAccess: vi.fn(), meOrNull: vi.fn(), signup: vi.fn(), resendVerification: vi.fn() }));

import * as api from '../app/lib/api';
import SignupPage from '../app/signup/page';
import VerifyEmailPage from '../app/verify-email/page';
import { clearPendingInvite, inviteReturnPath, loadPendingInvite, savePendingInvite } from '../app/lib/pendingInvite';

const pending = (token, email = '') => localStorage.setItem('merger_pending_invite', JSON.stringify({ token, email, at: Date.now() }));

beforeEach(() => {
  vi.clearAllMocks(); nav.query = ''; localStorage.clear(); sessionStorage.clear();
  api.meOrNull.mockResolvedValue(null);
});

describe('pending invitation', () => {
  it('keeps the email for the same token, forgets it for a new one, and expires', () => {
    savePendingInvite('a', 'ada@example.test');
    savePendingInvite('a');
    expect(loadPendingInvite()).toEqual({ token: 'a', email: 'ada@example.test' });
    savePendingInvite('b');
    expect(loadPendingInvite()).toEqual({ token: 'b', email: '' });
    expect(loadPendingInvite(Date.now() + 9 * 86400000)).toBeNull();
    expect(inviteReturnPath(loadPendingInvite())).toBe('/invite?token=b');
    clearPendingInvite();
    expect(loadPendingInvite()).toBeNull();
    expect(inviteReturnPath(null)).toBeNull();
  });
});

describe('sign-up from an invitation', () => {
  it('pre-fills the invited email and keeps the invite as the return path', async () => {
    pending('tok', 'invited@example.test');
    nav.query = 'next=%2Finvite%3Ftoken%3Dtok';
    render(<SignupPage />);
    expect(await screen.findByRole('heading', { name: 'Create your Merger account.' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('invited@example.test');
  });

  it('leaves an ordinary sign-up alone', async () => {
    pending('tok', 'invited@example.test');
    render(<SignupPage />);
    expect(await screen.findByRole('heading', { name: 'Your account. Your place in line.' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('');
  });
});

describe('email verification link', () => {
  it('returns a verified member to their pending invitation', async () => {
    pending('tok');
    nav.query = 'verified=1';
    api.accountAccess.mockResolvedValue({ user: { email: 'invited@example.test', emailVerified: true } });
    render(<VerifyEmailPage />);
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalledWith('/invite?token=tok'));
  });

  it('goes to the account without one', async () => {
    nav.query = 'verified=1';
    api.accountAccess.mockResolvedValue({ user: { email: 'p@example.test', emailVerified: true } });
    render(<VerifyEmailPage />);
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalledWith('/dashboard'));
  });
});
