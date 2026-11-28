export const dealPath = '/deal-preview/riverfront';
const tokenFormat = /^[A-Za-z0-9_-]{40,768}$/;
export const validToken = value => typeof value === 'string' && tokenFormat.test(value);
export function dealURL(token) {
  return validToken(token) ? dealPath + '/private/' + token : dealPath;
}
export function readRecent(id) {
  if (!id) return null;
  try {
    const record = JSON.parse(localStorage.getItem('riverfront.recent.' + id));
    if (!record || (record.token !== null && !validToken(record.token))) return null;
    return record;
  } catch { return null; }
}
export function rememberDeal(id, token, section, documentOpen) {
  if (!id) return;
  try {
    localStorage.setItem('riverfront.recent.' + id, JSON.stringify({token, section, documentOpen}));
  } catch { /* Account navigation is still available with browser storage disabled. */ }
}
