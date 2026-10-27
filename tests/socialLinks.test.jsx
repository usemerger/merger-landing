import { render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import SocialLinks, { SOCIALS } from '../app/components/SocialLinks';
import Shell from '../app/components/Shell';
import PlaybooksChrome from '../app/playbooks/PlaybooksChrome';

vi.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }) }));
vi.mock('../app/lib/api', () => ({ logout: vi.fn(), errorMessage: () => '' }));

const EXPECTED = ['Instagram', 'X', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube', 'Threads'];

it('links every Merger profile over https in a new tab, with an accessible name', () => {
  render(<SocialLinks />);
  const list = screen.getByRole('list', { name: 'Merger on social media' });
  const links = within(list).getAllByRole('link');
  expect(links.map((a) => a.getAttribute('title'))).toEqual(EXPECTED);
  for (const a of links) {
    expect(a.getAttribute('href')).toMatch(/^https:\/\//);
    expect(a).toHaveAttribute('target', '_blank');
    expect(a.getAttribute('rel')).toContain('noopener');
    expect(a).toHaveAccessibleName(/^Merger on /);
  }
  expect(SOCIALS.every((s) => s.d.length > 20)).toBe(true);
});

it('appears in the account footer and the marketing footer', () => {
  const { unmount } = render(<Shell><main>x</main></Shell>);
  expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Merger on LinkedIn' })).toBeInTheDocument();
  unmount();
  render(<PlaybooksChrome><p>x</p></PlaybooksChrome>);
  expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Merger on Instagram' })).toBeInTheDocument();
});
