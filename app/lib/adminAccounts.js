import { ApiError, errorMessage } from './api';

export const ACCOUNT_ROLES = [
  ['none', 'Member'], ['waitlist_viewer', 'Waitlist viewer'],
  ['waitlist_importer', 'Waitlist importer'], ['admin', 'Administrator'],
];
export function roleLabel(role) { return ACCOUNT_ROLES.find(([value]) => value === role)?.[1] || 'Unknown role'; }
export function canManageUsers(capabilities) { return capabilities?.isAdmin === true; }
export function hasPaidSubscription(status) { return ['active', 'trialing', 'past_due', 'unpaid', 'incomplete', 'paused'].includes(status); }
export function activeComplimentary(access) { return access?.billing?.complimentary?.status === 'active'; }

async function request(path, { body, signal } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(abort, 20000);
  try {
    const response = await fetch(`/api/admin/accounts${path}`, {
      method: body ? 'POST' : 'GET', credentials: 'include', cache: 'no-store',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined, signal: controller.signal,
    });
    let data;
    try { data = await response.json(); } catch { throw new ApiError(response.status, 'invalid_response'); }
    const code = data?.error || (typeof data?.detail === 'string' ? data.detail : data?.detail?.error);
    if (!response.ok || code) throw new ApiError(response.status, code, data);
    if (!data || typeof data !== 'object') throw new ApiError(response.status, 'invalid_response');
    return data;
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, controller.signal.aborted ? 'request_timeout' : 'network_error');
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
export const adminAccounts = ({ page = 0, pageSize = 50, q = '', signal } = {}) => request(`?${new URLSearchParams({ page: String(page), pageSize: String(pageSize), q })}`, { signal });
export const adminAccount = (id, signal) => request(`/${encodeURIComponent(id)}`, { signal });
export const adminAccountRole = (id, body) => request(`/${encodeURIComponent(id)}/role`, { body });
export const adminAccountGrant = (id, body) => request(`/${encodeURIComponent(id)}/complimentary`, { body });
export const adminAccountRevoke = (id, body) => request(`/${encodeURIComponent(id)}/complimentary/revoke`, { body });

export function accountAdminError(error) {
  const messages = {
    revision_conflict: 'This account changed while you were reviewing it. Refresh its details before making a new change.',
    protected_admin: 'This administrator is protected. Its administrator role cannot be changed here.',
    cannot_change_own_role: 'You cannot change your own administrator role.',
    email_not_verified: 'This user must verify their email before receiving staff permissions or complimentary access.',
    admin_required: 'Administrator access is required to manage users.',
  };
  return messages[error?.code] || errorMessage(error);
}
