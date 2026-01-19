import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GM Groups Xlantis | Dominating the Streets',
  description: 'GM Groups - The powerhouse of Xlantis. Dominating business, streets, and luxury. Join the elite network of Burgershot, GM Industries, and more.',
  keywords: ['GM Groups', 'Xlantis', 'RP', 'Burgershot', 'Roleplay', 'Business', 'Gang', 'GTA V', 'FiveM', 'Gaming Community'],
  authors: [{ name: 'GM Groups Team' }],
  openGraph: {
    title: 'GM Groups Xlantis',
    description: 'Dominating the Streets of Xlantis with style, power, and unity.',
    url: 'https://gmgroups.xlantis.com', // Replace with actual URL if different
    siteName: 'GM Groups',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GM Groups Xlantis',
    description: 'The powerhouse of Xlantis. Join the legacy.',
    // creator: '@gm_groups', // Add if available
  },
};

import SessionProvider from '@/components/providers/SessionProvider';

// ... (existing imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} font-body antialiased`}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
