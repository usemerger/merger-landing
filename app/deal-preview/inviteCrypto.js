import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { validToken } from './previewLinks';
const purpose = Buffer.from('merger.riverfront.preview.private.v1');
const sevenDays = 7 * 24 * 60 * 60 * 1000;
export function recipientAddress(value) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return Buffer.byteLength(email) <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
function getKey() {
  const value = process.env.RIVERFRONT_INVITE_KEY?.trim();
  if (!/^[0-9a-f]{64}$/i.test(value || '')) throw Error('Preview invitation service is unavailable.');
  return Buffer.from(value, 'hex');
}
export function issueInvite(email) {
  const recipient = recipientAddress(email);
  if (!recipient) throw Error('Invalid recipient');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  cipher.setAAD(purpose);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify({recipient, expires: Date.now() + sevenDays}), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}
export function openInvite(token) {
  if (!validToken(token)) return null;
  const key = getKey();
  try {
    const bytes = Buffer.from(token, 'base64url');
    if (bytes.toString('base64url') !== token) return null;
    const decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(0,12));
    decipher.setAAD(purpose);
    decipher.setAuthTag(bytes.subarray(12,28));
    const invite = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString());
    return recipientAddress(invite.recipient) && invite.expires > Date.now() ? invite : null;
  } catch { return null; }
}
