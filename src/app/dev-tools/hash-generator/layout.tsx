import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hash Generator - SHA-1, SHA-256, SHA-384, SHA-512",
  description:
    "Generate cryptographic hashes (SHA-1, SHA-256, SHA-384, SHA-512) from your input text. Secure and client-side.",
};

export default function HashGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
