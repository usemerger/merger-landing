/** @type {import('next').NextConfig} */
const API_ORIGIN = process.env.MERGER_API_ORIGIN || 'https://api.buildmerger.com';

const nextConfig = {
  // A stray lockfile in the parent dir makes Next infer the wrong workspace root.
  outputFileTracingRoot: __dirname,

  async headers() {
    return [
      ...(process.env.NEXT_PUBLIC_ACCOUNT_PREVIEW === '1' ? [{ source: '/:path*', headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ] }] : []),
      { source: '/:path*', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ] },
      { source: '/api/:path*', headers: [
        { key: 'Cache-Control', value: 'private, no-store' },
      ] },
      { source: '/:page(reset-password|invite|verify-email)', headers: [
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ] },
    ];
  },

  async rewrites() {
    // §1 Same-origin API. The browser only ever calls relative /api/... paths, so the
    // backend's HttpOnly SameSite=Lax session cookie is a first-party cookie and sticks.
    // Never call api.buildmerger.com directly from the browser.
    return [
      {
        source: '/api/:path*',
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
