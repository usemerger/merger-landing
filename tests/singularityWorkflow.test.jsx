import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChannelOrbit from '../app/components/ChannelOrbit';
import DealStory from '../app/components/DealStory';

let observers;
let preference;

beforeEach(() => {
  vi.useFakeTimers();
  observers = [];
  preference = {
    matches: false,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => preference));
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback) { observers.push(callback); }
    observe() {}
    disconnect() {}
  });
  // Orbit motion does not drive the selectable inbox. Do not enqueue an
  // unbounded animation loop while testing the user-facing controls.
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function setVisible(visible = true) {
  act(() => observers.forEach(callback => callback([{ isIntersecting: visible }])));
}

function advance(milliseconds) {
  act(() => vi.advanceTimersByTime(milliseconds));
}

function stageButton(name) {
  return screen.getByRole('button', { name: new RegExp(`0[1-4]\\s*${name}`, 'i') });
}

describe('Singularity channel preview', () => {
  it('filters to a chosen channel and restores the unified conversation list', () => {
    render(<ChannelOrbit />);
    const inbox = screen.getByLabelText('Sample unified inbox');
    expect(within(inbox).getByRole('heading', { name: 'All conversations' })).toBeVisible();
    expect(within(inbox).getByText('Theo James')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Preview Telegram in Merger' }));
    expect(screen.getByRole('button', { name: 'Preview Telegram in Merger' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(inbox).getByRole('heading', { name: 'Telegram' })).toBeVisible();
    expect(within(inbox).getByText('The acquisition brief is ready for your review.')).toBeVisible();
    expect(within(inbox).queryByText('Theo James')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Showing a sample Telegram conversation.');

    fireEvent.click(screen.getByRole('button', { name: 'Show all channels in Merger' }));
    expect(screen.getByRole('button', { name: 'Show all channels in Merger' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(inbox).getByRole('heading', { name: 'All conversations' })).toBeVisible();
    expect(within(inbox).getByText('Theo James')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Sample conversations from connected channels.');
  });

  it('keeps channel selection available with reduced motion', () => {
    preference.matches = true;
    render(<ChannelOrbit />);
    setVisible();
    expect(requestAnimationFrame).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Preview WhatsApp in Merger' }));
    expect(screen.getByRole('heading', { name: 'WhatsApp' })).toBeVisible();
    expect(screen.getByText('The owner is ready to talk. Can I send the details?')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Show all channels', exact: true }));
    expect(screen.getByRole('heading', { name: 'All conversations' })).toBeVisible();
  });
});

describe('Singularity Deal Desk walkthrough', () => {
  it('lets a visitor review a suggestion, file it, and prepare a document using Rolodex', () => {
    render(<DealStory />);
    fireEvent.click(stageButton('Recognize'));
    expect(screen.getByText('Possible deal found')).toBeVisible();
    expect(screen.getByText(/Detected with Claude · Review required/)).toBeVisible();
    expect(screen.getByText('$2,000,000')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /Review & file as deal/ }));
    expect(stageButton('Organize')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Filed after review. Linked to the original message./)).toBeVisible();
    expect(screen.getByText('THE CONVERSATION STAYS WITH THE DEAL')).toBeVisible();
    expect(screen.getByText('alex@example.com')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /Open documents/ }));
    expect(stageButton('Move forward')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Riverside_NDA.pdf')).toBeVisible();
    expect(screen.getByText('Add a recipient')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /Use Rolodex contact/ }));
    expect(screen.queryByText('Add a recipient')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recipient ready/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Added to recipient/ })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Sample contact added: Alex Morgan, alex@example.com.');
    expect(screen.getByText(/No messages or documents are sent/)).toBeVisible();
  });

  it('allows a suggestion to be dismissed without filing a deal', () => {
    render(<DealStory />);
    fireEvent.click(stageButton('Recognize'));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(stageButton('Message')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText(/Filed after review/)).not.toBeInTheDocument();
    advance(20000);
    expect(stageButton('Message')).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not advance automatically with reduced motion but remains fully selectable', () => {
    preference.matches = true;
    render(<DealStory />);
    setVisible();
    advance(30000);
    expect(stageButton('Message')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: /Play workflow animation|Pause workflow animation/ })).not.toBeInTheDocument();

    fireEvent.click(stageButton('Recognize'));
    advance(30000);
    expect(stageButton('Recognize')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Review & file as deal/ }));
    expect(stageButton('Organize')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Replay workflow from the beginning' }));
    advance(30000);
    expect(stageButton('Message')).toHaveAttribute('aria-pressed', 'true');
  });

  it('preserves the focused action instead of auto-advancing, then honors explicit Play', () => {
    render(<DealStory />);
    setVisible();
    advance(6800);
    expect(stageButton('Recognize')).toHaveAttribute('aria-pressed', 'true');
    const fileAction = screen.getByRole('button', { name: /Review & file as deal/ });
    act(() => fileAction.focus());
    expect(fileAction).toHaveFocus();

    advance(20000);
    expect(stageButton('Recognize')).toHaveAttribute('aria-pressed', 'true');
    expect(fileAction).toHaveFocus();
    expect(fileAction).toBeInTheDocument();

    const play = screen.getByRole('button', { name: 'Play workflow animation' });
    act(() => play.focus());
    fireEvent.click(play);
    advance(6800);
    expect(stageButton('Organize')).toHaveAttribute('aria-pressed', 'true');
  });

  it('holds the current step while hovered and resumes when the pointer leaves', () => {
    render(<DealStory />);
    setVisible();
    const demo = screen.getByLabelText('Illustrative Merger Deal Desk demo');
    fireEvent.pointerOver(demo, { pointerType: 'mouse' });
    advance(12000);
    expect(stageButton('Message')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.pointerOut(demo, { pointerType: 'mouse' });
    advance(6800);
    expect(stageButton('Recognize')).toHaveAttribute('aria-pressed', 'true');
  });

  it('pauses offscreen and keeps an explicit pause when it returns', () => {
    render(<DealStory />);
    setVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Pause workflow animation' }));
    setVisible(false);
    advance(12000);
    setVisible();
    advance(12000);
    expect(stageButton('Message')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Play workflow animation' })).toBeVisible();
  });
});
