
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lorem Ipsum & Placeholder Text Generator',
  description: 'Generate placeholder text in various styles: standard Lorem Ipsum, DevOps jargon, or Tech Startup buzzwords. Customize paragraph and sentence counts.',
};

export default function LoremIpsumGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
