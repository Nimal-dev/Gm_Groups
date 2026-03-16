import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Preloader } from '@/components/preloader';
import { SmoothScrolling } from '@/components/smooth-scrolling';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GM Groups Xlantis | Dominating the Streets',
  description: 'GM Groups - The powerhouse of Xlantis. Dominating business, streets, and luxury. Join the elite network of KOI Cafe, GM Industries, and more.',
  keywords: ['GM Groups', 'Xlantis', 'RP', 'KOI Cafe', 'Roleplay', 'Business', 'Gang', 'GTA V', 'FiveM', 'Gaming Community'],
  authors: [{ name: 'GM Groups Team' }],
  openGraph: {
    title: 'GM Groups Xlantis',
    description: 'Dominating the Streets of Xlantis with style, power, and unity.',
    url: 'https://gmgroups.xlantis.com',
    siteName: 'GM Groups',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GM Groups Xlantis',
    description: 'The powerhouse of Xlantis. Join the legacy.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${inter.variable} font-body antialiased`}>
        <SmoothScrolling>
          <Preloader />
          {children}
          <Toaster />
        </SmoothScrolling>
      </body>
    </html>
  );
}
