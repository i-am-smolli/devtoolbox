
import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: 'DevToolbox - Essential Developer Utilities',
    template: '%s - Online Tool',
  },
  description: 'DevToolbox: A comprehensive suite of free online developer tools, including converters, generators, formatters, and utilities for JSON, YAML, Markdown, and more.',
  keywords: ['developer tools', 'online tools', 'converters', 'generators', 'formatters', 'json tools', 'yaml tools', 'markdown tools', 'dev utilities', 'devtoolbox', 'hex to binary', 'json analyzer', 'markdown preview'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
