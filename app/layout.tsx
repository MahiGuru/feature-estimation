import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/lib/suppressWarnings';

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
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}