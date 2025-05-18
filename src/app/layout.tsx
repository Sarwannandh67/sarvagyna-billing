import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ClientLayout from '@/components/client-layout';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Sarvagyna Billing',
  description: 'Modern Invoicing Application',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo-symbol.png', type: 'image/png' }
    ],
    apple: [
      { url: '/logo-symbol.png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/logo-no-background.svg',
      }
    ]
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SarvBill',
  },
  applicationName: 'SarvBill',
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
    title: 'SarvBill',
    description: 'Modern Invoicing Application',
    images: [
      {
        url: '/logo-full.png',
        width: 800,
        height: 600,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SarvBill',
    description: 'Modern Invoicing Application',
    images: ['/logo-no-background.png'],
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
        <link rel="apple-touch-icon" href="/logo-symbol.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="SarvBill" />
      </head>
      <body 
        className={`${poppins.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning // Add this line
      >
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
