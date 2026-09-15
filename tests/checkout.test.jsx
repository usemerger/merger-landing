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
    expect(screen.getByText(/Free during the alpha/)).toHaveTextContent('$0 is charged today');
    expect(screen.getByText(/Free during the alpha/)).toHaveTextContent('$49.99 USD/month instead of $99.99');
    expect(screen.getByText(/Free during the alpha/)).toHaveTextContent('a card is required');
    expect(checkout).not.toHaveBeenCalled();
  });

  it('answers a 403 with the invite-only panel and no way to pay full price', async () => {
    checkout.mockRejectedValue({ status: 403, code: 'not_on_alpha_list' });
    render(<TestCheckout />);
    fireEvent.click(join());
    expect(await screen.findByText('The alpha is invite-only right now')).toBeInTheDocument();
    // Calm, not an error: nothing on this panel is an alert.
    expect(screen.queryByRole('alert')).toBeNull();
    // And no second attempt to buy anything — the button is gone, not disabled.
    expect(screen.queryByRole('button', { name: 'Join the alpha' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Request access' }))
      .toHaveAttribute('href', expect.stringContaining('mailto:support@usemerger.com'));
  });

  it('sends an expired session to sign in and back again', async () => {
    checkout.mockRejectedValue({ status: 401, code: 'unauthorized' });
    render(<TestCheckout />);
    fireEvent.click(join());
    expect(await screen.findByRole('link', { name: 'Sign in and continue' }))
      .toHaveAttribute('href', '/login?next=%2Fbilling');
  });

  it('treats 503 as not available right now, with no retry button', async () => {
    checkout.mockRejectedValue({ status: 503, code: 'alpha_not_configured' });
    render(<TestCheckout />);
    fireEvent.click(join());
    expect(await screen.findByText('message:alpha_not_configured')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
    expect(join()).toBeEnabled();
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
