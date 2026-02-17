import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://voicenativeapps.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'VoiceNative Directory - Discover Voice-First Applications',
    template: '%s | VoiceNative Directory',
  },
  description:
    'The curated directory for voice-native applications. Browse, search, and discover apps that put voice interaction first.',
  keywords: [
    'voice apps',
    'voice-native',
    'voice-first',
    'voice assistant apps',
    'voice control',
    'speech recognition apps',
    'voice UI',
    'conversational AI',
    'voice technology',
    'app directory',
  ],
  authors: [{ name: 'VoiceNative Directory' }],
  creator: 'VoiceNative Directory',
  publisher: 'VoiceNative Directory',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'VoiceNative Directory',
    title: 'VoiceNative Directory - Discover Voice-First Applications',
    description:
      'The curated directory for voice-native applications. Browse, search, and discover apps that put voice interaction first.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'VoiceNative Directory' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoiceNative Directory - Discover Voice-First Applications',
    description:
      'The curated directory for voice-native applications. Browse, search, and discover apps that put voice interaction first.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large' as const,
    'max-snippet': -1,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  verification: {
    google: 'fbECeHGs81gT-2uJ-hvd_UkzPbabq28c4V11cz7kImo',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
