import './landing.css';
import './app.css';
import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';

// Three roles, not three fonts picked for variety — the pattern every reference
// site shares (docs/design-notes.md). Instrument Serif is the display voice,
// Inter does the reading, and the mono makes figures read as instruments
// rather than prose.
//
// `display: 'swap'` on all three: a finance audience on hotel wifi should get
// text immediately, and a swap is cheaper than a blank hero.
// §2. The display face is the design: a high-contrast editorial serif, set
// large and at weight 400. Instrument Serif ships a single 400 weight on
// purpose — it is drawn for exactly this job and nothing else.
const instrument = Instrument_Serif({
  subsets: ['latin'], weight: '400', style: ['normal', 'italic'],
  display: 'swap', variable: '--font-instrument',
});
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-jetbrains' });

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
  // The page is ink-dark everywhere; without this the browser paints white
  // chrome around it on mobile and the first frame flashes.
  themeColor: '#08090C',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${instrument.variable} ${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
