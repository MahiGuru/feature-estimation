import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/lib/suppressWarnings";
import SuppressWarnings from "@/components/SuppressWarnings";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Estimation Tool",
  description: "AI-powered project estimation and analytics platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Immediate suppression for browser extension warnings
              (function() {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('Extra attributes from the server') ||
                      message.includes('data-sharkid') ||
                      message.includes('data-ad-block') ||
                      message.includes('data-extension') ||
                      message.includes('at select') ||
                      message.includes('Warning: Prop')) {
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('Extra attributes from the server') ||
                      message.includes('data-sharkid') ||
                      message.includes('data-ad-block') ||
                      message.includes('data-extension') ||
                      message.includes('at select')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <SuppressWarnings />
        {children}
      </body>
    </html>
  );
}
