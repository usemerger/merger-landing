import Link from 'next/link';
import Shell from '../components/Shell';

export const metadata = { title: 'Reset your password — Merger' };

// §4: the backend exposes POST /api/auth/password/forgot and /password/reset, but
// delivery depends on transactional email, which is not wired up yet. Rather than
// show a form that silently sends nothing, this page states the situation plainly
// and routes people to a channel that actually works.
export default function ForgotPasswordPage() {
  return (
    <Shell>
      <main className="auth-main">
        <div className="auth-card narrow">
          <p className="eyebrow">Password reset</p>
          <h1>Reset is not self-serve yet.</h1>

          <div className="panel mt-24">
            <p className="muted">
              Password reset emails are not being delivered yet — transactional email is still
              being wired up. Until it is live, email{' '}
              <a href="mailto:support@usemerger.com" style={{ color: 'var(--brass)' }}>
                support@usemerger.com
              </a>{' '}
              from the address on your account and we will reset it by hand.
            </p>
            <Link className="btn btn-ghost btn-block" href="/login">
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    </Shell>
  );
}
