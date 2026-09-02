'use client';

import { useCallback, useState } from 'react';
import { PLANS, checkout, errorMessage } from '../lib/api';

/**
 * Starts Stripe Checkout for the ALREADY LOGGED-IN account.
 *
 * The session cookie identifies the user, so this never re-collects email,
 * password or handle — that is what dead-ended people who bounced off Checkout
 * once and then got sent back to the signup form, where their own handle was
 * reported as taken.
 *
 * /api/billing/checkout requires a plan (an empty body returns invalid_request)
 * and billing status reports plan:null before the first payment, so the plan is
 * the one thing that genuinely has to be asked for again.
 */
export function useStartCheckout(initialPlan = 'operator') {
  const [plan, setPlan] = useState(PLANS[initialPlan] ? initialPlan : 'operator');
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const start = useCallback(
    async (overridePlan, overrideSeats) => {
      if (busy) return;
      setError('');
      setBusy(true);
      try {
        const p = PLANS[overridePlan] ? overridePlan : plan;
        const rawSeats = overrideSeats === undefined ? seats : overrideSeats;
        const s = p === 'desk' ? Math.max(1, Number(rawSeats) || 1) : 1;
        const res = await checkout(p, s);
        if (!res || !res.url) throw new Error('Checkout could not be started.');
        window.location.href = res.url;
        // Deliberately leave busy=true so controls stay disabled through the redirect.
      } catch (err) {
        setError(errorMessage(err));
        setBusy(false);
      }
    },
    [busy, plan, seats]
  );

  return { plan, setPlan, seats, setSeats, busy, error, start };
}

/** Plan picker + checkout button. Identity fields are deliberately absent. */
export default function PlanStep({ ctl, heading = 'Choose your plan', note }) {
  const { plan, setPlan, seats, setSeats, busy, error, start } = ctl;
  const seatCount = Math.max(1, Number(seats) || 1);

  return (
    <div id="start-trial" className="plan-step">
      <h2>{heading}</h2>
      {note && <p className="muted mt-16">{note}</p>}

      <div className="field">
        <div className="plan-grid">
          {Object.values(PLANS).map((p) => (
            <button
              key={p.id}
              type="button"
              className="plan-opt"
              aria-pressed={plan === p.id}
              onClick={() => setPlan(p.id)}
              disabled={busy}
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
          <label htmlFor="resume-seats">Seats</label>
          <input
            id="resume-seats"
            type="number"
            min={1}
            max={500}
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            disabled={busy}
          />
          <p className="field-hint">
            ${PLANS.desk.price} per seat / month · {seatCount} seat{seatCount === 1 ? '' : 's'} = $
            {PLANS.desk.price * seatCount} / month after the trial
          </p>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <button
        className="btn btn-primary btn-block"
        type="button"
        onClick={() => start()}
        disabled={busy}
      >
        {busy ? 'Opening secure checkout…' : 'Continue to checkout'}
      </button>
      <p className="field-hint center mt-16">
        14-day free trial · card required · cancel any time. Payment is handled by Stripe.
      </p>
    </div>
  );
}
