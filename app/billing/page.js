'use client';

// Stripe Checkout and the Customer Portal both return to /billing (the backend
// builds that return URL, e.g. https://usemerger.com/billing?checkout=success),
// so this route has to exist and show the account. It renders the same dashboard
// as /dashboard rather than redirecting, so the return lands somewhere useful.

import { Suspense } from 'react';
import AccountDashboard from '../components/AccountDashboard';
import Shell from '../components/Shell';

function Loading() {
  return (
    <Shell authed>
      <main className="dash-main">
        <p className="spinner-note">Loading your account…</p>
      </main>
    </Shell>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AccountDashboard />
    </Suspense>
  );
}
