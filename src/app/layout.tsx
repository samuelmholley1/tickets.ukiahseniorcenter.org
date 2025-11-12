import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { title } from '@/lib/copy';

export const metadata: Metadata = {
  metadataBase: new URL('https://tickets.ukiahseniorcenter.org'),
  title,
  description: "Purchase tickets for events at the Ukiah Senior Center. Join us for exciting programs, activities, and community gatherings.",
  openGraph: {
    title,
    description: "Purchase tickets for events at the Ukiah Senior Center. Join us for exciting programs, activities, and community gatherings.",
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: "Purchase tickets for events at the Ukiah Senior Center. Join us for exciting programs, activities, and community gatherings.",
    images: ['/og.png'],
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '48x48' }
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.zeffy.com" crossOrigin="" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ToastProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}
