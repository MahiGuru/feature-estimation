import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/lib/suppressWarnings';
import SuppressWarnings from '@/components/SuppressWarnings';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Project Estimation Tool',
  description: 'AI-powered project estimation and analytics platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SuppressWarnings />
        {children}
      </body>
    </html>
  );
}