
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UUID Generator - Generate V4 UUIDs',
  description: 'Generate one or more Version 4 UUIDs (Universally Unique Identifiers) quickly and easily. Free online developer tool.',
};

export default function UuidGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
