
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'URL Explorer - Analyze URL Components | DevToolbox',
  description: 'Paste a URL to break it down into its constituent parts: protocol, hostname, port, path, query parameters, and hash fragment. Useful for debugging and understanding URLs.',
};

export default function UrlExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
