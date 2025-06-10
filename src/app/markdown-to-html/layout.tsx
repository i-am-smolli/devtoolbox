
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Markdown to HTML Converter',
  description: 'Convert your Markdown text into raw HTML code. Useful for developers needing to transform Markdown for web display or other uses.',
};

export default function MarkdownToHtmlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
