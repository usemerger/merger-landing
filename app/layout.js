import './landing.css';
import './app.css';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const space = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-space' });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-jetbrains' });

export const metadata = {
  title: { default: 'Merger — A place for the work in your conversations', template: '%s · Merger' },
  description:
    'Bring connected messages, reviewed deal suggestions, contact details, and your own DocuSign account into one Windows desktop workspace. Explore the Merger alpha.',
  applicationName: 'Merger',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
