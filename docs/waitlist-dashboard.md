# Waitlist operations and rehearsal

The staff dashboard lives at `/admin/waitlist`. Verified staff also see **Manage waitlist** on their account page. Access is still checked by the backend; showing a link does not grant permission.

The dashboard starts with enrolled waitlist entries, imported contacts, and unverified accounts that submitted waitlist details. Use **Needs verification** to find people awaiting a verified email. Unverified signup intents have no queue position until verification completes; they remain visible to staff without earning referrals or gaining access. Historical unlinked entries remain visible. Only verified, linked accounts are selectable for invitations.

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

## Import contacts

1. Open **Import contacts** in the staff dashboard.
2. Choose `.csv`, `.xls`, or `.xlsx` (up to 5 MB, 1,000 contacts, and 100 columns). A CSV template is available in the panel. UTF-8/UTF-16 CSVs support comma, semicolon, or tab separators.
3. Choose the worksheet if applicable, set whether the first row contains headers, and match columns. Email is required; full name or first/last names, company, and role are optional. Formula cells in mapped columns must be pasted as values first.
   Common contact-export headers such as Recommended Email and Employer are recognized. Long unused columns (for example, skills or notes) do not block the file. Selected fields over 4,096 characters produce an error naming the row and contact field; oversized values are never silently imported as shortened text.
4. **Review contacts** validates the selected fields on the server. The review separates new contacts, existing signups, duplicates in the file, and invalid rows. Correct invalid entries in the source file; valid new entries can be imported independently.
5. **Add N to waitlist** commits the batch and refreshes the dashboard. Download the results for correction or recordkeeping. A retry of the same review safely returns the same completed result after a lost connection.

Importing never sends email, creates a user, verifies an address, grants access, starts a subscription, or automatically issues an invitation. Existing signup details, referral credits, and invitation history are preserved. New contacts use the ordinary referral-based queue ordering, with their file order preserved within a batch. They can create and verify a Merger account using the imported email to link to the queued entry.

The raw spreadsheet is parsed in a browser worker, with a 15-second timeout. Only mapped contact fields reach the same-origin admin API. Both preview and commit endpoints enforce staff authorization and backend validation. The server stores batch ID, actor, source filename, result, and per-entry provenance for audit and idempotency. No contact data or credentials are stored in browser local storage.

The admin API returns at most 20,000 combined queued and pending entries, with `totalCount` and `truncated`. If capped, the UI labels the partial list and its scoped search/counts. The dashboard displays 50 entries per page, and invitation reviews also display 50 recipients per page. Search and counts cover all loaded entries, selections persist across pages, and sending uses every selected recipient in the reviewed batch. This limits mounted browser rows; the API still returns its bounded list in one response, without server-side pagination.

Validation: parser tests generate actual XLS and XLSX workbooks, including Unicode, multiple sheets, formulas, empty sheets, bounds, and CSV quoting. UI tests cover review, partial corrections, authorization failure, repeat submissions, retry identity, and verification filters. Backend tests exercise the migration and imports against disposable PostgreSQL, including concurrent batches, preservation, and verified account linking. Rehearse browser imports only with fictional contacts on the isolated preview; import itself must leave the captured-mail count unchanged.
