'use client';

import { forwardRef } from 'react';
import './singularity-button.css';

/**
 * A native link or button with an animated obsidian shell.
 * Keep children as the resting label; busyLabel overlays it without resizing.
 */
const SingularityButton = forwardRef(function SingularityButton({
  children,
  href,
  className = '',
  arrow = true,
  busy = false,
  busyLabel,
  disabled = false,
  type = 'button',
  onClick,
  tabIndex,
  ...props
}, ref) {
  const Tag = href !== undefined ? 'a' : 'button';
  const unavailable = disabled || busy;

  function handleClick(event) {
    if (unavailable) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return <Tag
    {...props}
    ref={ref}
    {...(Tag === 'a'
      ? { href: unavailable ? undefined : href, role: 'link', 'aria-disabled': unavailable || undefined }
      : { type, disabled: unavailable })}
    tabIndex={Tag === 'a' && unavailable ? -1 : tabIndex}
    aria-busy={busy || undefined}
    data-busy={busy || undefined}
    className={`singularity-button ${className}`.trim()}
    onClick={handleClick}
  >
    <span className="singularity-button__field" aria-hidden="true">
      <span className="singularity-button__halo" />
      <span className="singularity-button__core" />
      <svg className="singularity-button__threads" viewBox="0 0 300 60" preserveAspectRatio="none">
        <path d="M8 14 147 30 290 8M4 45 147 30 286 52M61 2 147 30 239 58M117 0 147 30 186 60" />
        <ellipse cx="147" cy="30" rx="102" ry="20" />
      </svg>
      <span className="singularity-button__fragment singularity-button__fragment--1" />
      <span className="singularity-button__fragment singularity-button__fragment--2" />
      <span className="singularity-button__fragment singularity-button__fragment--3" />
      <span className="singularity-button__fragment singularity-button__fragment--4" />
      <span className="singularity-button__fragment singularity-button__fragment--5" />
      <span className="singularity-button__fragment singularity-button__fragment--6" />
      <span className="singularity-button__finish" />
    </span>
    <span className="singularity-button__content">
      <span className="singularity-button__label">
        <span className="singularity-button__rest-label" aria-hidden={busy && busyLabel ? true : undefined}>{children}</span>
        {busy && busyLabel && <span className="singularity-button__busy-label">{busyLabel}</span>}
      </span>
      {arrow && <span className="singularity-button__icon" aria-hidden="true">
        {busy ? <span className="singularity-button__spinner" /> : <svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" /></svg>}
      </span>}
    </span>
  </Tag>;
});

export default SingularityButton;
