'use client';

import { useEffect, useRef, useState } from 'react';
import { claimHandle, errorMessage, handleAvailable, meOrNull, resendVerification } from './api';
import { normalizeHandle, validHandle } from './authFlow';

export default function useHandleClaim() {
  const [handle, setHandle] = useState('');
  const [availability, setAvailability] = useState({ status: 'idle', message: '' });
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [resending, setResending] = useState(false);
  const resendPending = useRef(false);

  useEffect(() => {
    const value = normalizeHandle(handle);
    if (!value) { setAvailability({ status: 'idle', message: '3–30 letters, numbers or underscores.' }); return; }
    if (!validHandle(value)) { setAvailability({ status: 'bad', message: 'Use 3–30 letters, numbers or underscores.' }); return; }
    let canceled = false;
    setAvailability({ status: 'checking', message: 'Checking availability…' });
    const timer = setTimeout(async () => {
      try {
        const result = await handleAvailable(value);
        if (!canceled) setAvailability(result?.available === true
          ? { status: 'ok', message: `@${value} is available.` }
          : { status: 'bad', message: `@${value} is unavailable. Choose another handle.` });
      } catch {
        if (!canceled) setAvailability({ status: 'idle', message: 'Availability could not be checked. You can still try reserving this handle.' });
      }
    }, 400);
    return () => { canceled = true; clearTimeout(timer); };
  }, [handle]);

  async function claim() {
    const value = normalizeHandle(handle);
    if (!validHandle(value)) throw new Error('Choose a handle with 3–30 letters, numbers or underscores.');
    try {
      const result = await claimHandle(value);
      if (normalizeHandle(result?.handle) !== value) throw new Error('Your handle could not be confirmed. Please try again.');
      setNeedsVerification(false);
      return result.handle;
    } catch (error) {
      // The request may have succeeded before its response was lost. Read the
      // account's actual handle before asking the user to claim it again.
      if (!error?.status || error.status >= 500) {
        try {
          const account = await meOrNull();
          if (normalizeHandle(account?.handle) === value) return account.handle;
        } catch { /* Preserve the original actionable error. */ }
      }
      if (error?.code === 'email_not_verified') setNeedsVerification(true);
      if (['handle_taken', 'handle_reserved'].includes(error?.code)) {
        setAvailability({ status: 'bad', message: `@${value} is unavailable. Choose another handle.` });
      }
      throw error;
    }
  }

  async function resend() {
    if (resendPending.current) return;
    resendPending.current = true;
    setResending(true);
    setVerificationMessage('');
    try { await resendVerification(); setVerificationMessage('Verification email sent. Open its link, then try reserving your handle again.'); }
    catch (error) { setVerificationMessage(errorMessage(error)); }
    finally { resendPending.current = false; setResending(false); }
  }

  return { handle, setHandle, availability, claim, needsVerification, verificationMessage, resending, resend };
}
