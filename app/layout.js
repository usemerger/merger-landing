import './landing.css';
import './app.css';
import { Geist, Geist_Mono } from 'next/font/google';

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
  title: { default: 'Merger — A place for the work in your conversations', template: '%s · Merger' },
  description:
    'Bring connected messages, reviewed deal suggestions, contact details, and your own DocuSign account into one Windows desktop workspace. Explore the Merger alpha.',
  applicationName: 'Merger',
  icons: {
    icon: [{ url: '/merger-logo.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/merger-logo.svg' }],
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
      <body>{children}</body>
    </html>
  );
}
