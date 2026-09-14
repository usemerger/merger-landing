import Link from 'next/link';
import Shell from '../components/Shell';

export const metadata = { title: 'Help & support', description: 'Get help signing in, managing billing, downloading Merger, or reporting an alpha issue.' };

export default function SupportPage() {
  return <Shell><main className="legal-main"><p className="eyebrow">Here to help</p><h1>Get back to your conversations.</h1><p>Choose the account task you need, or email <a href="mailto:support@usemerger.com">support@usemerger.com</a>. Include your account email and a short description of the problem.</p><div className="support-grid">
    <section className="panel"><h2>Sign in or reset your password</h2><p>Use the same email you used to create your account. Password reset links are single-use; if a link has expired, request a new one.</p><div className="dl-row"><Link className="btn btn-primary" href="/login">Sign in</Link><Link className="btn" href="/forgot-password">Reset password</Link></div></section>
    <section className="panel"><h2>Billing, invoices, and cancellation</h2><p>Open your account’s billing page to manage payment details, view invoices, or cancel. If checkout was interrupted, your account is saved and you can resume from there.</p><Link className="btn" href="/billing">Open billing</Link><p className="mt-16">If billing management is unavailable, email support from your account email. Include the date and amount of any charge you are asking about.</p></section>
    <section className="panel"><h2>Install the Windows alpha</h2><p>Sign in to check access and get the current Windows installer. Mac and mobile downloads are not currently offered.</p><Link className="btn" href="/download">Go to downloads</Link></section>
    <section className="panel"><h2>Report a bug</h2><p>Tell us what you were trying to do, what happened, and your Windows and Merger versions. You can attach screenshots in your email. Leave out passwords, API keys, card details, and private message content.</p><a className="btn" href="mailto:support@usemerger.com?subject=Merger%20alpha%20bug%20report">Email a bug report</a><p className="field-hint mt-16">This opens your email app. If nothing opens, send an email directly to support@usemerger.com.</p></section>
    <section className="panel"><h2>Privacy or account deletion</h2><p>Email support from your account email to request access to your information or account deletion. See our <Link href="/privacy">privacy notice</Link> for details.</p></section>
  </div></main></Shell>;
}
