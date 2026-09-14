import './landing.css';
import './app.css';
import { Archivo, Source_Serif_4, JetBrains_Mono } from 'next/font/google';

// Three roles, not three fonts picked for variety — the pattern the reference
// sites all share (see docs/design-notes.md). Archivo carries display and UI,
// Source Serif 4 is reserved for editorial accents, and the mono is what makes
// figures read as instruments rather than prose.
//
// `display: 'swap'` on all three: a finance audience on a hotel wifi should get
// text immediately, and a swap is cheaper than a blank hero.
const archivo = Archivo({ subsets: ['latin'], display: 'swap', variable: '--font-archivo' });
const serif = Source_Serif_4({ subsets: ['latin'], display: 'swap', variable: '--font-serif' });
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
  themeColor: '#0F1319',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
