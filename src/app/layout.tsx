import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/toaster";
import { Inter, Source_Code_Pro } from "next/font/google";

export const metadata: Metadata = {
  title: {
    default: "DevToolbox - Essential Developer Utilities",
    template: "%s - Online Tool",
  },
  description:
    "DevToolbox: A comprehensive suite of free online developer tools, including converters, generators, formatters, and utilities for JSON, YAML, Markdown, and more.",
  keywords: [
    "developer tools",
    "online tools",
    "converters",
    "generators",
    "formatters",
    "json tools",
    "yaml tools",
    "markdown tools",
    "dev utilities",
    "devtoolbox",
    "hex to binary",
    "json analyzer",
    "markdown preview",
  ],
  //  Once openGraph is set, no Metadata will be displayed
  //  openGraph: {
  //    title: "DevToolbox - Essential Developer Utilities",
  //    description:
  //      "DevToolbox: A comprehensive suite of free online developer tools, including converters, generators, formatters, and utilities for JSON, YAML, Markdown, and more.",
  //    url: "https://devtoolbox.icu",
  //    siteName: "DevToolbox",
  //    locale: "en_US",
  //    type: "website",
  //  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceCodePro.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
      </head>
      <body className="font-body antialiased">
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
