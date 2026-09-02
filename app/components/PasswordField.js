'use client';

import { useId, useState } from 'react';

function EyeIcon({ off }) {
  return off ? (
    // Eye with a slash: the password is currently visible, click to hide.
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1.5 8s2.4-4.2 6.5-4.2S14.5 8 14.5 8s-2.4 4.2-6.5 4.2S1.5 8 1.5 8z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.9" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 13.5L13.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1.5 8s2.4-4.2 6.5-4.2S14.5 8 14.5 8s-2.4 4.2-6.5 4.2S1.5 8 1.5 8z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.9" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/**
 * A password input with a show/hide toggle.
 *
 * Hidden by default. The toggle only ever flips the input's `type` — the value
 * lives in the caller's state and is never logged, copied or persisted here.
 *
 * The toggle is a real <button>, so it is keyboard-operable for free; it carries
 * aria-pressed for its on/off state and an aria-label describing the action.
 */
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  placeholder,
  hint,
  hintTone,
  required = true,
}) {
  const [visible, setVisible] = useState(false);
  const generated = useId();
  const inputId = id || generated;

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <div className="pw-wrap">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          // Keep the plaintext out of spellcheck/autocorrect pipelines.
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          title={visible ? 'Hide password' : 'Show password'}
        >
          <EyeIcon off={visible} />
          <span>{visible ? 'Hide' : 'Show'}</span>
        </button>
      </div>
      {hint !== undefined && (
        <p className={'field-hint' + (hintTone ? ` ${hintTone}` : '')}>{hint}</p>
      )}
    </div>
  );
}
