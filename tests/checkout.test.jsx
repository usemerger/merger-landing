import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlanStep, { useStartCheckout } from '../app/components/PlanStep';
import { checkout } from '../app/lib/api';

// PlanStep resumes to the page it is ON after a 401, so the path is part of
// the contract these tests cover.
vi.mock('next/navigation', () => ({ usePathname: () => '/billing' }));
vi.mock('../app/lib/api', () => ({
  checkout: vi.fn(),
  // The real errorMessage is exercised in api.test.js; here the point is which
  // STATE each reply produces, not the sentence it produces.
  errorMessage: (err) => `message:${err?.code || err?.status || 'unknown'}`,
}));

function TestCheckout() { const ctl = useStartCheckout(); return <PlanStep ctl={ctl} />; }
const join = () => screen.getByRole('button', { name: 'Join the alpha' });

beforeEach(() => { checkout.mockReset(); });

describe('joining the alpha', () => {
  it('goes straight to checkout with no availability call in front of it', async () => {
    // THE REGRESSION THIS GUARDS. The button used to be disabled until
    // GET /api/billing/offers answered, and that route is a 404 — so it was
    // disabled always. Nothing may gate it again.
    checkout.mockReturnValue(new Promise(() => {}));
    render(<TestCheckout />);
    expect(join()).toBeEnabled();
    fireEvent.click(join());
    await waitFor(() => expect(checkout).toHaveBeenCalledTimes(1));
  });

  it('states what is charged today and what is charged later, together', () => {
    render(<TestCheckout />);
    // $0 must never be the only number on screen. The price it becomes is one
    // line below it, before any of the small print.
    // Split across a <p> and its <span>, so match on the container's text
    // rather than a string Testing Library would have to span elements to find.
    expect(document.querySelector('.alpha-amount').textContent).toBe('$0due today');
    expect(document.querySelector('.alpha-then').textContent).toBe('First 2 weeks free, then $50/ month');
    const terms = screen.getByText(/\$50 USD\/month, and your first 2 weeks are free/);
    expect(terms).toHaveTextContent('A card is required');
    expect(terms).toHaveTextContent('$0 is charged today');
    expect(terms).toHaveTextContent('Cancel any time before then and you are never charged');
    expect(screen.getByText(/Alpha members keep \$50\/month for life/)).toBeInTheDocument();
    expect(checkout).not.toHaveBeenCalled();
  });

  it('shows the closed-alpha state for a shut window, whatever it is called', async () => {
    // The backend does not document its error bodies, so the closed-window
    // code cannot be confirmed from outside. Every one of these has to land in
    // the same calm state — including a bare 403 with a code nobody predicted,
    // because with the allowlist gone a 403 can no longer mean anything else.
    for (const err of [
      { status: 403, code: 'alpha_closed' },
      { status: 403, code: 'alpha_ended' },
      { status: 403, code: 'alpha_full' },
      { status: 403, code: 'some_code_we_did_not_predict' },
      { status: 503, code: 'alpha_not_configured' },
    ]) {
      checkout.mockReset();
      checkout.mockRejectedValue(err);
      const { unmount } = render(<TestCheckout />);
      fireEvent.click(join());
      expect(await screen.findByText('The alpha isn’t taking new members right now')).toBeInTheDocument();
      // Calm, not an error: nothing on this panel is an alert.
      expect(screen.queryByRole('alert')).toBeNull();
      // And no second attempt — the button is gone, not merely disabled.
      expect(screen.queryByRole('button', { name: 'Join the alpha' })).toBeNull();
      expect(screen.getByRole('link', { name: 'Join the waitlist' }))
        .toHaveAttribute('href', expect.stringContaining('mailto:support@usemerger.com'));
      unmount();
    }
  });

  it('does not mistake an origin rejection for a closed alpha', async () => {
    // The backend Origin-allowlists state-changing requests, so a preview
    // deployment gets 403 origin_not_allowed. That must not read as "the
    // alpha has closed" — it is a deployment problem, not an offer one.
    checkout.mockRejectedValue({ status: 403, code: 'origin_not_allowed' });
    render(<TestCheckout />);
    fireEvent.click(join());
    expect(await screen.findByRole('alert')).toHaveTextContent('message:origin_not_allowed');
    expect(screen.queryByText(/isn’t taking new members/)).toBeNull();
  });

  it('has no invite gate left anywhere in the join flow', async () => {
    render(<TestCheckout />);
    expect(screen.queryByText(/invite/i)).toBeNull();
    expect(join()).toBeEnabled();
  });

  it('sends an expired session to sign in and back again', async () => {
    checkout.mockRejectedValue({ status: 401, code: 'unauthorized' });
    render(<TestCheckout />);
    fireEvent.click(join());
    expect(await screen.findByRole('link', { name: 'Sign in and continue' }))
      .toHaveAttribute('href', '/login?next=%2Fbilling');
  });

  it('offers a retry for a transient provider failure', async () => {
    checkout.mockRejectedValue({ status: 502, code: 'billing_provider_error' });
    render(<TestCheckout />);
    fireEvent.click(join());
    const retry = await screen.findByRole('button', { name: 'Try again' });
    checkout.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/cs_test' });
    fireEvent.click(retry);
    await waitFor(() => expect(checkout).toHaveBeenCalledTimes(2));
  });

  it('never fires two checkouts from a double click', async () => {
    let reject;
    checkout.mockReturnValue(new Promise((_resolve, fail) => { reject = fail; }));
    render(<TestCheckout />);
    // The same element, twice — its label changes to "Opening secure checkout…"
    // on the first press, so re-querying by name would find nothing and the
    // test would pass without ever attempting the second submission.
    const button = join();
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(checkout).toHaveBeenCalledTimes(1));
    reject({ status: 500 });
    await screen.findByRole('alert');
    expect(join()).toBeEnabled();
  });
});
