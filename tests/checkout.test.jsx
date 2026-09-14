import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlanStep, { useStartCheckout } from '../app/components/PlanStep';
import { billingOffers, checkout } from '../app/lib/api';

vi.mock('../app/lib/api', () => ({ billingOffers: vi.fn(), checkout: vi.fn(), errorMessage: () => 'Please try again.' }));
const available = { offers: [{ id: 'alpha', available: true, amount: 5000, currency: 'usd', interval: 'month', intervalCount: 1, perSeat: false, trialDays: 14, priceLockedWhileSubscribed: true }] };
function TestCheckout() { const ctl = useStartCheckout(); return <PlanStep ctl={ctl} />; }
beforeEach(() => { billingOffers.mockReset(); checkout.mockReset(); });
describe('checkout from an existing account', () => {
  it('makes the free trial, automatic monthly charge, and cancellation terms visible together', async () => {
    billingOffers.mockResolvedValue(available);
    render(<TestCheckout />);
    const button = screen.getByRole('button', { name: 'Start 14-day free trial' });
    await waitFor(() => expect(button).toBeEnabled());
    expect(screen.getByText(/14 days free, then \$50 USD\/month automatically/)).toHaveTextContent('Cancel before your trial ends to avoid the first charge.');
    expect(checkout).not.toHaveBeenCalled();
  });
  it('offers sign-in recovery after a session expires', async () => {
    billingOffers.mockResolvedValue(available);
    checkout.mockRejectedValue({ status: 401 });
    render(<TestCheckout />);
    const button = screen.getByRole('button', { name: /Start 14-day free trial/ });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    expect(await screen.findByRole('link', { name: 'Sign in again' })).toHaveAttribute('href', '/login?next=/billing');
  });
  it('blocks unavailable billing and offers recovery', async () => {
    billingOffers.mockResolvedValue({ offers: [] });
    render(<TestCheckout />);
    await screen.findByText(/Trial signup is temporarily unavailable/);
    expect(screen.getByRole('button', { name: /Start 14-day free trial/ })).toBeDisabled();
    expect(checkout).not.toHaveBeenCalled();
    billingOffers.mockResolvedValue(available);
    fireEvent.click(screen.getByRole('button', { name: 'Check again' }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Start 14-day free trial/ })).toBeEnabled());
  });
  it('rechecks the offer before checkout and prevents duplicate submissions', async () => {
    billingOffers.mockResolvedValue(available);
    let reject;
    checkout.mockReturnValue(new Promise((_resolve, fail) => { reject = fail; }));
    render(<TestCheckout />);
    const button = screen.getByRole('button', { name: /Start 14-day free trial/ });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(checkout).toHaveBeenCalledTimes(1));
    expect(billingOffers).toHaveBeenCalledTimes(2);
    reject(new Error('transient failure'));
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: /Start 14-day free trial/ })).toBeEnabled();
  });
  it('does not checkout after an offer is withdrawn', async () => {
    billingOffers.mockResolvedValueOnce(available).mockResolvedValue({ offers: [] });
    render(<TestCheckout />);
    const button = screen.getByRole('button', { name: /Start 14-day free trial/ });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    await screen.findByRole('alert');
    expect(checkout).not.toHaveBeenCalled();
  });
});
