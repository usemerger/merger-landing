import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bookingTarget } from '../app/book/booking';
import BookPage from '../app/book/page';

vi.mock('../app/lib/api', () => ({ meOrNull: vi.fn().mockResolvedValue(null), logout: vi.fn() }));

const page = async (v) => render(await BookPage({ searchParams: Promise.resolve(v ? { v } : {}) }));

afterEach(() => { delete process.env.NEXT_PUBLIC_BOOKING_URL; });

describe('booking link', () => {
  it('embeds a full Google appointment schedule and links anything else', () => {
    const embed = bookingTarget('https://calendar.google.com/calendar/appointments/schedules/AcZ123');
    expect(embed).toEqual({ kind: 'embed', src: 'https://calendar.google.com/calendar/appointments/schedules/AcZ123?gv=true', href: 'https://calendar.google.com/calendar/appointments/schedules/AcZ123' });
    expect(bookingTarget('https://calendar.app.google/abc')).toEqual({ kind: 'link', href: 'https://calendar.app.google/abc' });
    expect(bookingTarget('')).toEqual({ kind: 'email' });
    expect(bookingTarget('javascript:alert(1)')).toEqual({ kind: 'email' });
  });
});

describe('/book', () => {
  it('falls back to emailing hello@ when no booking page is set', async () => {
    await page();
    expect(screen.getByRole('link', { name: 'Email Owen to book' }).getAttribute('href')).toMatch(/^mailto:hello@usemerger\.com/);
  });

  it('frames the Google calendar when it is set', async () => {
    process.env.NEXT_PUBLIC_BOOKING_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZ123';
    await page('real_estate');
    expect(screen.getByTitle('Pick a time with Owen').getAttribute('src')).toContain('gv=true');
  });

  it('speaks to the vertical from the email and ignores unknown ones', async () => {
    await page('secondaries');
    expect(screen.getByText(/secondaries brokers personally/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /secondaries broker keeps 40/ })).toHaveAttribute('href', '/playbooks/secondaries-broker-counterparties-across-messaging-apps');
  });

  it('treats an unknown vertical as general', async () => {
    await page('toString');
    expect(screen.getByText(/dealmakers personally/)).toBeInTheDocument();
  });
});
