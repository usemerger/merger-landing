import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import Shell from '../app/components/Shell';
import { logout } from '../app/lib/api';
const { replace, refresh } = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard', useRouter: () => ({ replace, refresh }) }));
vi.mock('../app/lib/api', () => ({ logout: vi.fn(), errorMessage: () => 'Connection failed.' }));
it('keeps a session failure visible and retries sign-out before redirecting', async () => {
  logout.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({ ok: true });
  render(<Shell authed><main>Account</main></Shell>);
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Sign out failed');
  expect(replace).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/login?signedOut=1'));
});
