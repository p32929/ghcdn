import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';
import ServiceWorkerScript from '@/components/ServiceWorkerScript';

// Disable caching for the app
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'GitHub CDN',
  description: 'Convert GitHub or Gist URLs to CDN URLs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link href="https://rsms.me/inter/inter.css" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Suspense fallback={null}>
          {children}
        </Suspense>
        <ServiceWorkerScript />
      </body>
    </html>
  );
} 