import { beforeEach, describe, expect, it } from 'vitest';
import { captureFirstTouch, readFirstTouch, touchFrom } from '../app/lib/attribution';

beforeEach(() => localStorage.clear());

describe('first touch', () => {
  it('reads UTM tags and keeps only the referrer host and the path', () => {
    const t = touchFrom('?utm_source=meta_ads&utm_medium=cpc&utm_campaign=oct&token=x', 'https://l.facebook.com/l.php?u=secret', '/pricing', 0);
    expect(t).toEqual({ source: 'meta_ads', medium: 'cpc', campaign: 'oct', referrer: 'https://l.facebook.com/', landingPath: '/pricing', firstSeenAt: '1970-01-01T00:00:00.000Z' });
  });
  it('ignores visits with no signal and our own pages as referrers', () => {
    expect(touchFrom('', '', '/')).toBeNull();
    expect(touchFrom('', 'https://usemerger.com/billing', '/')).toBeNull();
    expect(touchFrom('?ref=ABC', '', '/').source).toBe('referral');
  });
  it('keeps the first touch and never overwrites it', () => {
    const win = (search, referrer = '') => ({ location: { search, pathname: '/' }, document: { referrer }, localStorage });
    expect(captureFirstTouch(win(''))).toBeNull();
    captureFirstTouch(win('?utm_source=linkedin&utm_medium=social'));
    captureFirstTouch(win('?utm_source=google&utm_medium=cpc'));
    expect(readFirstTouch()).toMatchObject({ source: 'linkedin', medium: 'social' });
    expect(readFirstTouch(Date.now() + 200 * 86400000)).toBeNull();
  });
});
