// Remembers an invitation between the invite link and the end of sign-up, so a
// new member goes invite -> create account -> verify -> accepted without having
// to find the email again. Kept in this browser only, for the life of the
// invitation; it holds the token the person already has in their inbox.

const KEY = 'merger_pending_invite';
const MAX_AGE = 8 * 24 * 60 * 60 * 1000;

export function savePendingInvite(token, email = '') {
  if (!token) return;
  try {
    const prior = loadPendingInvite();
    const keep = prior?.token === token ? prior.email : '';
    localStorage.setItem(KEY, JSON.stringify({ token, email: email || keep || '', at: Date.now() }));
  } catch { /* Storage is a convenience; the invite link still works without it. */ }
}

export function loadPendingInvite(now = Date.now()) {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!value || typeof value.token !== 'string' || !value.token || !(now - value.at < MAX_AGE)) return null;
    return { token: value.token, email: typeof value.email === 'string' ? value.email : '' };
  } catch { return null; }
}

export function clearPendingInvite() {
  try { localStorage.removeItem(KEY); } catch { /* Nothing to clear. */ }
}

export function inviteReturnPath(invite) {
  return invite?.token ? `/invite?token=${encodeURIComponent(invite.token)}` : null;
}
