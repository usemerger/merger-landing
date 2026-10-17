/**
 * How /book should show the booking link in NEXT_PUBLIC_BOOKING_URL.
 *   embed  a full Google appointment-schedule URL, framed with ?gv=true
 *   link   any other https URL (calendar.app.google short link, Calendly)
 *   email  nothing usable set: fall back to emailing hello@usemerger.com
 */
export function bookingTarget(raw) {
  const url = (raw || '').trim();
  if (!/^https:\/\//.test(url)) return { kind: 'email' };
  if (/^https:\/\/calendar\.google\.com\/calendar\/appointments\//.test(url)) {
    return { kind: 'embed', src: `${url}${url.includes('?') ? '&' : '?'}gv=true`, href: url };
  }
  return { kind: 'link', href: url };
}

