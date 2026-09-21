import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const nav = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => nav }));
vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
import WaitlistForm from '../app/components/WaitlistForm';
import { captureRef, storedRef, validCode, referralLink } from '../app/lib/waitlist';
import { WAITLIST } from '../app/lib/billingOffer';
beforeEach(() => { vi.restoreAllMocks(); nav.push.mockReset(); localStorage.clear(); sessionStorage.clear(); window.history.replaceState({}, '', '/'); });

describe('account-backed waitlist entry', () => {
  it('validates email before moving to signup and never anonymously enrolls', () => {
    const request = vi.spyOn(window, 'fetch');
    render(<WaitlistForm />);
    fireEvent.click(screen.getByRole('button', { name: WAITLIST.cta }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
    expect(nav.push).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: WAITLIST.cta }));
    expect(nav.push).toHaveBeenCalledWith('/signup');
    expect(JSON.parse(sessionStorage.getItem('merger_waitlist_draft')).email).toBe('person@example.com');
    expect(request).not.toHaveBeenCalled();
  });
  it('keeps referral attribution through signup navigation', () => {
    window.history.replaceState({}, '', '/?ref=source123');
    render(<WaitlistForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: WAITLIST.cta }));
    expect(nav.push).toHaveBeenCalledWith('/signup?ref=source123');
  });
  it('does not treat a public code in storage as ownership', () => {
    localStorage.setItem('merger_waitlist', JSON.stringify({ code: 'public123' }));
    render(<WaitlistForm />);
    expect(screen.getByLabelText('Email')).toBeVisible();
    expect(screen.queryByText(/your place in line/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  });
  it('works when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('blocked'); });
    render(<WaitlistForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: WAITLIST.cta }));
    expect(nav.push).toHaveBeenCalledWith('/signup');
  });
});

describe('referral attribution', () => {
  it('preserves first referral for a later visit', () => {
    expect(captureRef('?ref=first111')).toBe('first111');
    expect(captureRef('?ref=second22')).toBe('first111');
    expect(captureRef('')).toBe('first111');
  });
  it('expires attribution and ignores malformed codes', () => {
    localStorage.setItem('merger_ref', JSON.stringify({ code: 'expired1', exp: Date.now() - 1 }));
    expect(storedRef()).toBeNull();
    expect(captureRef('?ref=%3Cscript%3E')).toBeNull();
    expect(validCode('../../etc')).toBe(false);
  });
  it('uses the public site for referrals', () => { expect(referralLink('public123')).toBe('https://usemerger.com/?ref=public123'); });
});
