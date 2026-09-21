import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WaitlistForm from '../app/components/WaitlistForm';
import { ALPHA_OFFER, WAITLIST } from '../app/lib/billingOffer';
import {
  captureRef, referralLink, storedCode, storedRef, validCode, waitlistError,
} from '../app/lib/waitlist';

/**
 * The waitlist is the only public action on the funnel now, so the things
 * tested here are the things that lose signups when they break: a referral
 * that is not attributed, a button that never stops spinning, a returning
 * visitor shown an empty form, and a stale code that traps someone forever.
 */

const joined = {
  ok: true, referralCode: 'aB3dE5f7', position: 42, referralCount: 3, status: 'waiting',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(joined)));
});

/** Fill every required field with something valid. */
function fillIn({ email = 'kate@cedar.com', role = 'Search Fund', firm = 'Cedar Partners' } = {}) {
  fireEvent.change(screen.getByLabelText(/work email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/what you do/i), { target: { value: role } });
  if (firm) fireEvent.change(screen.getByLabelText(/firm/i), { target: { value: firm } });
  fireEvent.click(screen.getByRole('checkbox'));
}

const submit = () => fireEvent.click(screen.getByRole('button', { name: WAITLIST.cta }));
const bodyOf = (call) => JSON.parse(call[1].body);

/**
 * Wait for the status panel. Keyed on the referral field rather than on the
 * position sentence: "on the list" appears in both the <p> and the role=status
 * wrapper around it, and a matcher that hits two nodes fails on the ambiguity
 * rather than on anything being wrong.
 */
const awaitJoined = () => screen.findByLabelText(/your referral link/i);

/**
 * The count reads "<strong>3</strong> referrals so far." — three text nodes, so
 * a whole-string matcher never matches. Read the element instead.
 */
const textOf = (selector) => document.querySelector(selector)?.textContent || '';

describe('joining the waitlist', () => {
  it('will not submit without an email, a role, or consent', async () => {
    render(<WaitlistForm />);

    fireEvent.change(screen.getByLabelText(/work email/i), { target: { value: 'not-an-email' } });
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);

    fireEvent.change(screen.getByLabelText(/work email/i), { target: { value: 'kate@cedar.com' } });
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(/best describes/i);

    fireEvent.change(screen.getByLabelText(/what you do/i), { target: { value: 'PE' } });
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(/agree to be emailed/i);

    // Nothing reached the network on any of those three.
    expect(fetch).not.toHaveBeenCalled();
  });

  it('posts the fields the contract accepts, and omits the ones left blank', async () => {
    render(<WaitlistForm />);
    fillIn({ firm: '' });
    submit();

    await awaitJoined();
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/waitlist/join');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    // `firm` and `ref` are absent rather than empty strings — the backend would
    // otherwise store "" as a firm name.
    expect(bodyOf(fetch.mock.calls[0])).toEqual({ email: 'kate@cedar.com', role: 'Search Fund' });
  });

  it('shows position, referral link, count and the price hook after joining', async () => {
    render(<WaitlistForm />);
    fillIn();
    submit();

    expect(await awaitJoined()).toHaveValue('https://usemerger.com/?ref=aB3dE5f7');
    expect(textOf('.wl-position')).toMatch(/#42/);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeVisible();
    expect(textOf('.wl-count')).toMatch(/3 referrals so far/i);
    expect(textOf('.wl-count')).toContain(WAITLIST.referPrompt);
    // The hook has to quote the same number the offer charges.
    expect(textOf('.wl-hook')).toContain(`${ALPHA_OFFER.priceLabel}/month`);
    expect(textOf('.wl-hook')).toContain('membership stays active');
    expect(screen.queryByRole('button', { name: WAITLIST.cta })).toBeNull();
  });

  it('says "1 referral", not "1 referrals"', async () => {
    fetch.mockResolvedValue(jsonResponse({ ...joined, referralCount: 1 }));
    render(<WaitlistForm />);
    fillIn();
    submit();
    await awaitJoined();
    expect(textOf('.wl-count')).toMatch(/1 referral so far/i);
    expect(textOf('.wl-count')).not.toMatch(/1 referrals/i);
  });

  it('reports a refusal and leaves the button usable', async () => {
    fetch.mockResolvedValue(jsonResponse({ error: 'rate_limited' }, 429));
    render(<WaitlistForm />);
    fillIn();
    submit();

    expect(await screen.findByRole('alert')).toHaveTextContent(/too many attempts/i);
    // The one outcome this form may never produce: a button stuck spinning.
    await waitFor(() => expect(screen.getByRole('button', { name: WAITLIST.cta })).toBeEnabled());
  });

  it('survives a network failure without losing what was typed', async () => {
    fetch.mockRejectedValue(new TypeError('offline'));
    render(<WaitlistForm />);
    fillIn();
    submit();

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
    expect(screen.getByLabelText(/work email/i)).toHaveValue('kate@cedar.com');
    expect(screen.getByRole('button', { name: WAITLIST.cta })).toBeEnabled();
  });
});

describe('referrals', () => {
  it('attributes an inbound ?ref= on the join', async () => {
    window.history.replaceState({}, '', '/?ref=fHkGTUA7&utm_source=x');
    render(<WaitlistForm />);
    fillIn();
    submit();

    await awaitJoined();
    expect(bodyOf(fetch.mock.calls[0]).ref).toBe('fHkGTUA7');
  });

  it('keeps a referral for a later visit that has no ?ref= on it', () => {
    expect(captureRef('?ref=fHkGTUA7')).toBe('fHkGTUA7');
    // A second landing, no parameter: the referral is still in force.
    expect(captureRef('')).toBe('fHkGTUA7');
    expect(storedRef()).toBe('fHkGTUA7');
  });

  it('gives the credit to whoever sent the FIRST link', () => {
    captureRef('?ref=first111');
    captureRef('?ref=second22');
    expect(storedRef()).toBe('first111');
  });

  it('forgets a referral once it has lapsed', () => {
    localStorage.setItem('merger_ref', JSON.stringify({ code: 'old12345', exp: Date.now() - 1 }));
    expect(storedRef()).toBeNull();
  });

  it('ignores a ?ref= that could not be a code', () => {
    expect(captureRef('?ref=' + encodeURIComponent('<script>'))).toBeNull();
    expect(captureRef('?ref=ab')).toBeNull();
    expect(localStorage.getItem('merger_ref')).toBeNull();
  });

  it('fires one analytics event carrying the source and the campaign', async () => {
    window.history.replaceState({}, '', '/?ref=fHkGTUA7&utm_source=newsletter&utm_campaign=alpha');
    const seen = [];
    window.addEventListener('merger:waitlist-join', (event) => seen.push(event.detail));
    render(<WaitlistForm />);
    fillIn();
    submit();

    await awaitJoined();
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({
      event: 'waitlist_join',
      position: 42,
      referralSource: 'fHkGTUA7',
      utm_source: 'newsletter',
      utm_campaign: 'alpha',
    });
    expect(window.dataLayer.at(-1)).toMatchObject({ event: 'waitlist_join' });
  });

  it('marks a direct arrival as direct rather than as nothing', async () => {
    const seen = [];
    window.addEventListener('merger:waitlist-join', (event) => seen.push(event.detail));
    render(<WaitlistForm />);
    fillIn();
    submit();
    await awaitJoined();
    expect(seen[0].referralSource).toBe('direct');
  });
});

describe('coming back', () => {
  it('shows a live position instead of an empty form', async () => {
    localStorage.setItem('merger_waitlist', JSON.stringify({ code: 'aB3dE5f7', at: Date.now() }));
    fetch.mockResolvedValue(jsonResponse({
      referralCode: 'aB3dE5f7', position: 9, referralCount: 5, status: 'waiting',
    }));

    render(<WaitlistForm />);
    await awaitJoined();
    expect(textOf('.wl-position')).toMatch(/#9/);
    expect(textOf('.wl-count')).toMatch(/5 referrals so far/i);
    // Read back by code, which is the only key the contract offers.
    expect(fetch.mock.calls[0][0]).toBe('/api/waitlist/status?code=aB3dE5f7');
    expect(screen.getByText(/your place in line/i)).toBeVisible();
  });

  it('remembers the code so the next visit can look it up', async () => {
    render(<WaitlistForm />);
    fillIn();
    submit();
    await awaitJoined();
    expect(storedCode()).toBe('aB3dE5f7');
  });

  it('falls back to the form when the backend has forgotten the code', async () => {
    localStorage.setItem('merger_waitlist', JSON.stringify({ code: 'gone1234', at: Date.now() }));
    fetch.mockResolvedValue(jsonResponse({ error: 'not_found' }, 404));

    render(<WaitlistForm />);
    await waitFor(() => expect(storedCode()).toBeNull());
    expect(screen.getByRole('button', { name: WAITLIST.cta })).toBeVisible();
  });

  it('keeps the code when the lookup merely failed, rather than binning it', async () => {
    localStorage.setItem('merger_waitlist', JSON.stringify({ code: 'aB3dE5f7', at: Date.now() }));
    fetch.mockResolvedValue(jsonResponse({ error: 'server_error' }, 502));

    render(<WaitlistForm />);
    await waitFor(() => expect(screen.getByRole('button', { name: WAITLIST.cta })).toBeVisible());
    // A 502 says nothing about whether the row exists. Throwing the code away
    // would lock someone out of their own position for good.
    expect(storedCode()).toBe('aB3dE5f7');
  });

  it('survives storage being unavailable entirely', () => {
    const boom = () => { throw new Error('blocked'); };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(boom);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(boom);
    // Private mode, blocked site data, an embedded webview: the form still
    // renders and can still be submitted; only the conveniences are lost.
    expect(() => render(<WaitlistForm />)).not.toThrow();
    expect(screen.getByRole('button', { name: WAITLIST.cta })).toBeVisible();
    // The referral still works for THIS page view — it is held in memory and
    // sent with the join. All that is lost is surviving a reload, which is the
    // right trade: a browser that cannot store anything should still be able
    // to credit the person whose link was just followed.
    expect(captureRef('?ref=fHkGTUA7')).toBe('fHkGTUA7');
    expect(storedRef()).toBeNull();
  });
});

describe('the waitlist vocabulary', () => {
  it('translates every reply the join can produce', () => {
    expect(waitlistError({ status: 400, code: 'invalid_email' })).toMatch(/does not look right/i);
    expect(waitlistError({ status: 429, code: 'rate_limited' })).toMatch(/too many attempts/i);
    expect(waitlistError({ status: 0, code: 'network_error' })).toMatch(/could not reach/i);
    expect(waitlistError({ status: 0, code: 'request_timeout' })).toMatch(/longer than expected/i);
    expect(waitlistError({ status: 500 })).toMatch(/on our end/i);
    // Never a bare code in front of a person.
    expect(waitlistError({ status: 418, code: 'teapot' })).toBe('Something went wrong. Please try again.');
  });

  it('names the preview origin problem for what it is', () => {
    // The backend Origin-allowlists state-changing requests, so a preview
    // deployment gets this and the live site never can. It must not read as
    // "the waitlist is broken".
    const message = waitlistError({ status: 403, code: 'origin_not_allowed' });
    expect(message).toMatch(/preview/i);
    expect(message).toMatch(/live site is unaffected/i);
  });

  it('accepts the codes the backend mints and rejects junk', () => {
    expect(validCode('xziioYB0')).toBe(true);
    expect(validCode('aB3dE5f7')).toBe(true);
    expect(validCode('')).toBe(false);
    expect(validCode('ab')).toBe(false);
    expect(validCode('../../etc/passwd')).toBe(false);
    expect(validCode(null)).toBe(false);
  });

  it('always points a referral link at the live site, never at a preview', () => {
    expect(referralLink('aB3dE5f7')).toBe('https://usemerger.com/?ref=aB3dE5f7');
  });
});
