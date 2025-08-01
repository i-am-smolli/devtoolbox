import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import { Inter, Source_Code_Pro } from "next/font/google";
import { AppLayout } from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  metadataBase: new URL(`https://devtoolbox.icu`),
  title: {
    default: "DevToolbox - Essential Developer Utilities",
    template: "%s - Online Tool",
  },
  alternates: {
    canonical: "./",
  },
  description:
    "DevToolbox is a lightweight, privacy-first suite of web-based tools for developers. From encoders to generators and analyzers — no cookies, no fluff, just tools that work.",
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
        <script
          defer
          data-domain="devtoolbox.icu"
          src="https://plausible.devtoolbox.icu/js/script.js"
        ></script>
      </head>
      <body className="font-body antialiased">
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
