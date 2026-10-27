import './landing.css';
import './app.css';
import './preview-notice.css';
import { Geist, Geist_Mono } from 'next/font/google';
import FirstTouch from './components/FirstTouch';
import { KEYWORDS, SHORT_DESCRIPTION, SITE, SITE_NAME } from './lib/seo';

/**
 * ONE SANS, EVERYWHERE. §3 drops the editorial-serif direction entirely: the
 * brief is the minimalist, professional feel of Apple's and Google's own
 * interfaces, and that look comes from a single neutral grotesque used with
 * discipline rather than from a display face doing the talking.
 *
 * Geist rather than SF Pro or Product Sans — those are not licensed for web
 * use, and shipping them would be a licensing problem, not a design decision.
 * Geist is OFL, served from Google Fonts, and is drawn in that same register:
 * tall x-height, closed apertures, no personality competing with the content.
 *
 * Variable weights so the wordmark can sit at 500 and body at 400 without a
 * second file.
 */
const geist = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-geist-mono' });

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Merger: one inbox and deal desk for dealmakers', template: '%s · Merger' },
  description: SHORT_DESCRIPTION,
  keywords: [...KEYWORDS],
  authors: [{ name: SITE_NAME, url: SITE }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Every route inherits these. Pages with their own openGraph override the
  // title/description; the share image comes from app/opengraph-image.js.
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    title: 'Merger: one inbox and deal desk for dealmakers',
    description: SHORT_DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', site: '@usemerger', creator: '@usemerger' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  appleWebApp: { title: SITE_NAME },
  itunes: { appId: '6817136478' },
  alternates: { types: { 'text/plain': `${SITE}/llms.txt` } },
  applicationName: 'Merger',
  icons: {
    // The gold mark, not the glossy-black gem. A browser tab is usually a dark
    // strip and the old artwork disappeared into it for the same reason it
    // disappeared on the page — see MarketingMark. Solid gold needs no rescue,
    // and a favicon is the one place a drop-shadow rim could never have been
    // applied anyway.
    icon: [{ url: '/merger-logo-gold.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/merger-logo-gold.svg' }],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // Matches --ink. Without it the browser paints white chrome around the page
  // on mobile and the first frame flashes.
  themeColor: '#08090C',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body><FirstTouch />{children}{process.env.NEXT_PUBLIC_ACCOUNT_PREVIEW === '1' && <aside className="account-preview-notice" aria-label="Preview environment">Preview · Test accounts and payments. Emails stay in the test inbox.</aside>}</body>
    </html>
  );
}
