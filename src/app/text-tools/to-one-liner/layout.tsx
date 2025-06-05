
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'To One Liner - Text Converter Tool',
  description: 'Convert multi-line text or code snippets into a single continuous line. Useful for preparing text for specific formats or commands.',
};

export default function ToOneLinerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
