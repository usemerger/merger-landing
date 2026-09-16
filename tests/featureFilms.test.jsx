import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FeatureFilms from '../app/components/FeatureFilms';

let observers;
let preference;
let play;
let pause;
beforeEach(() => {
  observers = [];
  preference = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal('matchMedia', vi.fn(() => preference));
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback) { observers.push(callback); }
    observe() {}
    disconnect() {}
  });
  play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

describe('feature animation playback', () => {
  it('loads only the selected film and lets the keyboard change films', () => {
    const { container } = render(<FeatureFilms />);
    expect(container.querySelectorAll('video')).toHaveLength(1);
    const first = screen.getByRole('tab', { name: /One inbox/ });
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /AI deal detection/ })).toHaveFocus();
    expect(container.querySelector('source')).toHaveAttribute('src', '/feature-films/deals.mp4');
    expect(pause).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('tab', { name: /People & paperwork/ }));
    expect(container.querySelector('source')).toHaveAttribute('src', '/feature-films/documents.mp4');
    expect(screen.getByText('Review and send from your own DocuSign account.')).toBeVisible();
  });

  it('pauses offscreen without overriding an intentional user pause on return', () => {
    const { container } = render(<FeatureFilms />);
    act(() => observers[0]([{ isIntersecting: true }]));
    expect(play).toHaveBeenCalledTimes(1);
    fireEvent.pause(container.querySelector('video'));
    act(() => observers[0]([{ isIntersecting: false }]));
    expect(pause).toHaveBeenCalled();
    act(() => observers[0]([{ isIntersecting: true }]));
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('does not autoplay with reduced motion and keeps controls available', () => {
    preference.matches = true;
    const { container } = render(<FeatureFilms />);
    act(() => observers[0]([{ isIntersecting: true }]));
    expect(play).not.toHaveBeenCalled();
    expect(container.querySelector('video')).toHaveAttribute('controls');
    fireEvent.error(container.querySelector('video'));
    expect(screen.getByRole('status')).toHaveTextContent('could not load');
    expect(screen.getByRole('link', { name: /Try opening/ })).toHaveAttribute('href', '/feature-films/channels.mp4');
  });
});
