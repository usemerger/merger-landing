'use client';

import { useRef } from 'react';
import './invite-code.css';

export const emptyCode = () => Array(6).fill('');

export default function InviteCodeInput({ digits, onChange, error }) {
  const inputs = useRef([]);

  function focus(index) {
    const input = inputs.current[index];
    if (input) { input.focus(); input.select(); }
  }

  function enter(index, raw) {
    const value = raw.replace(/\D/g, '');
    if (!value && raw) return;
    const next = [...digits];
    // Autofill and paste can deliver the complete code to any focused box.
    const start = value.length >= digits.length ? 0 : index;
    if (!value) next[start] = '';
    else [...value.slice(0, digits.length - start)].forEach((digit, offset) => { next[start + offset] = digit; });
    onChange(next);
    if (value) focus(Math.min(start + value.length, digits.length - 1));
  }

  function navigate(event, index) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      focus(Math.max(0, Math.min(digits.length - 1, index + (event.key === 'ArrowLeft' ? -1 : 1))));
    } else if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      enter(index - 1, '');
      focus(index - 1);
    } else if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      enter(index, event.key);
    }
  }

  return <div className="field">
    <label id="invite-code-label" htmlFor="deal-code-0">Verification code</label>
    <div role="group" aria-labelledby="invite-code-label" className="invite-code">
      {digits.map((digit, index) => <input key={index} id={`deal-code-${index}`}
        ref={node => { inputs.current[index] = node; }} type="text" inputMode="numeric"
        autoComplete={index === 0 ? 'one-time-code' : 'off'} value={digit}
        aria-label={`Digit ${index + 1} of 6`} aria-invalid={error || undefined}
        aria-describedby={error ? 'invite-code-error' : undefined}
        onFocus={event => event.target.select()} onClick={event => event.target.select()}
        onKeyDown={event => navigate(event, index)} onChange={event => enter(index, event.target.value)}
        onPaste={event => { event.preventDefault(); const text = event.clipboardData.getData('text'); if (text) enter(index, text); }}
      />)}
    </div>
  </div>;
}
