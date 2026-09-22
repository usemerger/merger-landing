# Waitlist operations and rehearsal

The staff dashboard lives at `/admin/waitlist`. Verified staff also see **Manage waitlist** on their account page. Access is still checked by the backend; showing a link does not grant permission.

The dashboard starts with all enrolled waitlist entries. It separates account verification, invitation state, and email transport status. New account registrations finish waitlist enrollment after email verification; unverified new registrations are not included in the current admin API. Historical unlinked entries remain visible.

Select recipients and review the batch before sending. Issuing an invitation does not start a subscription. Reissuing invalidates the earlier unaccepted link. Revocation requires confirmation and preserves the account and waitlist history. Accepted members cannot be downgraded by these actions. “Sent” means the email transport accepted the message, not that a recipient opened it or that inbox delivery is proven.

## Isolated rehearsal

Use `https://merger-orbit-preview.vercel.app/signup` for a fictional customer and the preview staff dashboard for invitations. The preview uses a separate PostgreSQL database, Stripe test mode, and private Mailpit capture. It has no outgoing email relay. Never point the rehearsal at the production API.

1. Create a fresh fictional account ending in `@example.com`.
2. Open its captured verification email in the private test inbox and follow the link.
3. Confirm the account is waiting, without a subscription or download access.
4. In a separate staff session, search for that exact address, select it, review, then send one invitation.
5. Open the captured invitation, sign in as the matching customer, and accept it.
6. Confirm admission is accepted and billing has not started. Stop here for a signup/invitation rehearsal. Stripe test activation is a separate step.

Use separate browser profiles or the approved local staff origin to keep staff and customer cookies separate. Test credentials and captured verification links are private operator artifacts, excluded from this repository. Production staff passwords are not reused in the preview.

The backend repository's `deploy/account-preview-acceptance.py` exercises the real isolated services. Its assertions require the preview database, captured mail, and Stripe test credentials. It creates fictional test records, inspects Checkout terms, exercises signed test webhooks, and schedules the test subscription to end. It does not complete the hosted Checkout form or prove real email inbox placement or live desktop sign-in.
