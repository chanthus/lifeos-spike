'use client';

import 'raf/polyfill';
import { Inter } from 'next/font/google';
import { PortalHost } from '@rn-primitives/portal';
import StyleRegistry from '../lib/StyleRegistry';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <title>Marketing</title>
      <body className={inter.className}>
        <StyleRegistry>
          {children}
          <PortalHost />
        </StyleRegistry>
      </body>
    </html>
  );
}
