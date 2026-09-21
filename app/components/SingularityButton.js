'use client';

import { forwardRef } from 'react';
import './singularity-button.css';

/**
 * A quiet pill action. The existing component name keeps consumers compatible.
 * Keep children as the resting label; busyLabel overlays it without resizing.
 */
const SingularityButton = forwardRef(function SingularityButton({
  children,
  href,
  className = '',
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
    <span className="singularity-button__content">
      <span className="singularity-button__label">
        <span className="singularity-button__rest-label" aria-hidden={busy && busyLabel ? true : undefined}>{children}</span>
        {busy && busyLabel && <span className="singularity-button__busy-label">{busyLabel}</span>}
      </span>
    </span>
  </Tag>;
});

export default SingularityButton;
