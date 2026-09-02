'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Shell from '../components/Shell';
import PasswordField from '../components/PasswordField';
import {
  ApiError,
  PLANS,
  checkout,
  claimHandle,
  errorMessage,
  handleAvailable,
  signup,
} from '../lib/api';

const HANDLE_RE = /^[a-z0-9_]{3,30}$/;

function SignupForm() {
  const params = useSearchParams();
  const planParam = params.get('plan');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [plan, setPlan] = useState(PLANS[planParam] ? planParam : 'operator');
  const [seats, setSeats] = useState(1);

  const [handleState, setHandleState] = useState({ status: 'idle', message: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('');

  // Signup is three backend calls. If a later one fails we must not re-run the
  // earlier ones on retry — the account (and handle) already exist.
  const progress = useRef({ accountCreated: false, handleClaimed: false });

  /* ---- live handle availability (§3), debounced ---- */
  useEffect(() => {
    const h = handle.trim().toLowerCase();
    if (!h) {
      setHandleState({ status: 'idle', message: '' });
      return;
    }
    if (!HANDLE_RE.test(h)) {
      setHandleState({
        status: 'bad',
        message: '3–30 characters: lowercase letters, numbers, underscore.',
      });
      return;
    }
    // Already claimed by this signup attempt — don't report it as taken.
    if (progress.current.handleClaimed) {
      setHandleState({ status: 'ok', message: 'Reserved for you.' });
      return;
    }

    let cancelled = false;
    setHandleState({ status: 'checking', message: 'Checking…' });
    const t = setTimeout(async () => {
      try {
        const res = await handleAvailable(h);
        if (cancelled) return;
        setHandleState(
          res && res.available
            ? { status: 'ok', message: `@${h} is available.` }
            : { status: 'bad', message: `@${h} is already taken.` }
        );
      } catch {
        if (!cancelled) setHandleState({ status: 'idle', message: '' });
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [handle]);

  const normalizedHandle = handle.trim().toLowerCase();
  const canSubmit =
    !busy &&
    email.trim() &&
    password.length >= 8 &&
    HANDLE_RE.test(normalizedHandle) &&
    handleState.status !== 'bad';

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (busy) return;
      setError('');
      setBusy(true);

      try {
        // 1. Create the account. It comes back un-entitled by design (§3).
        if (!progress.current.accountCreated) {
          setBusyLabel('Creating your account…');
          await signup(email.trim(), password, null);
          progress.current.accountCreated = true;
        }

        // 2. Claim the @handle.
        if (!progress.current.handleClaimed) {
          setBusyLabel('Reserving your handle…');
          await claimHandle(normalizedHandle);
          progress.current.handleClaimed = true;
        }

        // 3. Hand off to Stripe-hosted Checkout. Card is required; the 14-day
        //    trial only starts once Checkout completes. No card data touches us.
        setBusyLabel('Opening secure checkout…');
        const seatCount = plan === 'desk' ? Math.max(1, Number(seats) || 1) : 1;
        const res = await checkout(plan, seatCount);
        if (!res || !res.url) throw new Error('Checkout could not be started.');
        window.location.href = res.url;
        return; // keep the button disabled through the redirect
      } catch (err) {
        if (err instanceof ApiError && err.code === 'handle_taken') {
          setHandleState({ status: 'bad', message: `@${normalizedHandle} is already taken.` });
        }
        setError(errorMessage(err));
        setBusy(false);
        setBusyLabel('');
      }
    },
    [busy, email, password, normalizedHandle, plan, seats]
  );

  const accountExists = progress.current.accountCreated;

  return (
    <main className="auth-main">
      <div className="auth-card">
        <p className="eyebrow">Start your trial</p>
        <h1>Set up your deal desk.</h1>
        <p className="lede">
          14-day free trial on Operator and Desk. A card is required to start — you will not be
          charged until the trial ends, and you can cancel any time from your dashboard.
        </p>

        <form className="panel mt-24" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint={password && password.length < 8 ? 'Use at least 8 characters.' : ''}
            hintTone={password && password.length < 8 ? 'bad' : undefined}
          />

          <div className="field">
            <label htmlFor="handle">Your handle</label>
            <div className="handle-wrap">
              <span className="at">@</span>
              <input
                id="handle"
                type="text"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="yourdesk"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                required
              />
            </div>
            <p
              className={
                'field-hint' +
                (handleState.status === 'ok' ? ' ok' : '') +
                (handleState.status === 'bad' ? ' bad' : '')
              }
            >
              {handleState.message}
            </p>
          </div>

          <div className="field">
            <label>Plan</label>
            <div className="plan-grid">
              {Object.values(PLANS).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="plan-opt"
                  aria-pressed={plan === p.id}
                  onClick={() => setPlan(p.id)}
                >
                  <div className="pname">{p.name}</div>
                  <div className="pprice">
                    ${p.price} / MO{p.perSeat ? ' PER SEAT' : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {plan === 'desk' && (
            <div className="field">
              <label htmlFor="seats">Seats</label>
              <input
                id="seats"
                type="number"
                min={1}
                max={500}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
              />
              <p className="field-hint">
                ${PLANS.desk.price} per seat / month · {Math.max(1, Number(seats) || 1)} seat
                {Math.max(1, Number(seats) || 1) === 1 ? '' : 's'} = $
                {PLANS.desk.price * Math.max(1, Number(seats) || 1)} / month after trial
              </p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
              {accountExists && (
                <>
                  {' '}
                  Your account was created — press continue to finish checkout, or{' '}
                  <Link href="/dashboard">go to your dashboard</Link>.
                </>
              )}
            </div>
          )}

          <button className="btn btn-primary btn-block" type="submit" disabled={!canSubmit}>
            {busy ? busyLabel || 'Working…' : accountExists ? 'Continue to checkout' : 'Continue to checkout'}
          </button>

          <p className="field-hint center mt-16">
            Secure payment is handled by Stripe. Card required · cancel any time.
          </p>
        </form>

        <p className="form-foot">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Shell>
      <Suspense
        fallback={
          <main className="auth-main">
            <div className="auth-card">
              <p className="spinner-note">Loading…</p>
            </div>
          </main>
        }
      >
        <SignupForm />
      </Suspense>
    </Shell>
  );
}
