import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AOSProvider } from '@/components/aos-provider';
import { AutoplayMusicPlayer } from '@/components/autoplay-music-player';

export const metadata: Metadata = {
  title: 'GM Groups Xlantis',
  description: 'Dominating the Streets of Xlantis',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AOSProvider>
          {children}
          <AutoplayMusicPlayer />
          <Toaster />
        </AOSProvider>
      </body>
    </html>
  );
}
