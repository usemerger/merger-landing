'use client';

import { useId } from 'react';

export default function HandleField({ ctl, disabled = false }) {
  const id = useId();
  const { availability } = ctl;
  return <>
    <div className="field">
      <label htmlFor={id}>Your handle</label>
      <div className="handle-wrap">
        <span className="at" aria-hidden="true">@</span>
        <input id={id} name="handle" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false}
          placeholder="yourdesk" value={ctl.handle} onChange={(event) => ctl.setHandle(event.target.value)}
          minLength={3} maxLength={30} required disabled={disabled}
          aria-invalid={availability.status === 'bad'} aria-describedby={`${id}-hint`} />
      </div>
      <p id={`${id}-hint`} className={`field-hint${availability.status === 'ok' ? ' ok' : availability.status === 'bad' ? ' bad' : ''}`} aria-live="polite">{availability.message}</p>
    </div>
    {ctl.needsVerification && <div className="alert alert-info">
      <p>Verify your email before reserving your handle. After opening the email link, try again here.</p>
      <button type="button" className="linklike" disabled={disabled || ctl.resending} onClick={ctl.resend}>{ctl.resending ? 'Sending…' : 'Resend verification email'}</button>
    </div>}
    {ctl.verificationMessage && <p className="field-hint" role="status">{ctl.verificationMessage}</p>}
  </>;
}
