
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ClientLayout from '@/components/client-layout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sarvagyna Billing',
  description: 'Modern Invoicing Application',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon1.png', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icon0.svg',
      }
    ]
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sarvagyna',
  },
  applicationName: 'Sarvagyna Billing',
  keywords: ['billing', 'invoice', 'sarvagyna'],
  creator: 'Sarvagyna',
  publisher: 'Sarvagyna',
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL('https://sarvagyna.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Sarvagyna Billing',
    description: 'Modern Invoicing Application',
    images: [
      {
        url: '/sarvagyna-logo.png',
        width: 800,
        height: 600,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sarvagyna Billing',
    description: 'Modern Invoicing Application',
    images: ['/sarvagyna-logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning // Add this line
      >
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
