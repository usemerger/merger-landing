import Link from 'next/link';
import Shell from '../components/Shell';

export const metadata = { title: 'Privacy', description: 'How the Merger alpha handles account information, messages, billing, and connected services.' };

export default function PrivacyPage() {
  return <Shell><main className="legal-main"><p className="eyebrow">Merger alpha</p><h1>How your information is used.</h1><p>Updated September 20, 2026. This notice covers the Merger website and Windows alpha. Contact <a href="mailto:support@usemerger.com">support@usemerger.com</a> with privacy questions or requests about your information.</p>
    {/* NEW COLLECTION, NEW SECTION. The waitlist takes an email address, a
        role, an optional firm and a referral relationship from people who do
        not have an account and may never create one — none of which the
        sections below describe, because they are all written about account
        holders. It is placed first because for most visitors it is now the
        only processing that applies to them.

        DESCRIPTIVE, NOT PROMISSORY. Every sentence states what the system
        does and what the reader can ask for; none of it invents a retention
        period, a legal basis, or a transfer mechanism, because those are
        claims only a lawyer should make. FLAGGED FOR REAL LEGAL REVIEW
        before this goes to production. */}
    <h2>Alpha waitlist</h2><p>Joining the alpha waitlist records the email address you enter, the role you select, the firm name if you provide one, your position in the queue, and a referral code generated for you. If you arrived from someone else’s referral link, the referral code from that link is recorded with your entry so the referral can be credited.</p><p>Your email address is used to confirm that you joined and to send you an invitation when a seat becomes available, which is the consent you give when you submit the form. Your browser also stores your referral code and any referral code you arrived with, so that returning to this site shows your position instead of an empty form; clearing your browser’s site data removes both.</p><p>Waitlist entries are used to operate the alpha rollout and are not sold. Contact <a href="mailto:support@usemerger.com">support@usemerger.com</a> to be removed from the waitlist or to ask what is held for your address.</p>
    <h2>Account and service information</h2><p>Merger processes your email address, display name, handle, password hash, and account identifiers to create your account and sign you in. Session cookies keep you signed in. Subscription identifiers, payment status, and billing dates are used to determine access and display your account status.</p>
    <h2>Messages and connected accounts</h2><p>Connecting a messaging service lets Merger process the messages, contact details, and connection credentials needed to provide that integration. Information may be processed and stored by Merger’s server infrastructure as well as on your device. Do not assume that connected messages remain only on your computer.</p><p>Contacts and deals you save are used to provide the Rolodex and Deal Desk. The connected messaging providers continue to process information under their own privacy policies.</p>
    <h2>Optional Claude features</h2><p>When you enable an AI scan, message content and relevant context are sent to Anthropic to generate suggestions using your API key. Review the scan settings before enabling automatic scanning. Anthropic’s policies and your Anthropic account terms govern its processing of those requests. AI results may include contact details or deal information drawn from the messages you choose to scan.</p>
    <h2>Billing and DocuSign</h2><p>Stripe hosts checkout and billing management and processes payment details. Merger receives subscription and payment-status information; card details are entered on Stripe’s hosted pages.</p><p>DocuSign sign-in and document activity take place with DocuSign. When you copy or insert Rolodex information into DocuSign, that information is shared with DocuSign. Review recipients and documents before sending.</p>
    <h2>Support and operational data</h2><p>Support requests can include your email, report text, and diagnostic information you provide. Service logs may include technical details needed to operate the service, investigate failures, and prevent abuse. Avoid including passwords, API keys, card details, or unnecessary private messages in a report.</p>
    <h2>Providers and retention</h2><p>Merger uses hosting, messaging infrastructure, email delivery, and payment providers to operate the service. Information is processed by those providers as needed for their functions. Connected services may process information outside your country.</p><p>Data can remain in your account, service logs, or backups after you disconnect a service. Billing or operational records may need to be retained for legal, accounting, or security purposes. Contact support for information about access, deletion, and retention for your account.</p>
    <h2>Your choices</h2><p>You can disconnect integrations and control AI scanning in the app. To request access to, correction of, or deletion of account information, contact support from your account email. We may need to verify account ownership. You can manage your subscription separately on the <Link href="/billing">Billing page</Link>.</p>
    <h2>Updates</h2><p>This notice may change as the alpha develops. The date above identifies the current version. See the <Link href="/terms">alpha terms</Link> for subscription and cancellation details.</p>
  </main></Shell>;
}
