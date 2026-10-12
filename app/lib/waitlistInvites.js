// Invitation eligibility and status for a waitlist row. Shared by the waitlist
// dashboard and the per-account invite on Users & access, so both agree on who
// can be invited and what their status is called.

export function inviteStatus(row, now = Date.now()) {
  if (row.invitation?.status === 'pending' && row.invitation.expiresAt && new Date(row.invitation.expiresAt).getTime() <= now) return 'expired';
  return row.invitation?.status;
}
export function canSelect(row, status = inviteStatus(row)) { return row.accountLinked && row.emailVerified && !row.admitted && status !== 'accepted'; }
export function isReady(row, status = inviteStatus(row)) { return canSelect(row, status) && status !== 'pending'; }
export function rowStatus(row, status = inviteStatus(row)) {
  if (row.admitted || status === 'accepted') return { label: 'Admitted', tone: 'good' };
  if (status === 'pending') return { label: 'Invited', tone: 'gold' };
  if (status === 'expired') return { label: 'Expired', tone: 'muted' };
  if (status === 'revoked') return { label: 'Revoked', tone: 'muted' };
  if (isReady(row, status)) return { label: 'Ready to invite', tone: 'ready' };
  return { label: 'Waiting', tone: 'muted' };
}
