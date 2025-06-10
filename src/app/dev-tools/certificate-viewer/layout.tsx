
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'X.509 Certificate Viewer',
  description: 'Paste a PEM-encoded X.509 certificate to view its details, including subject, issuer, validity, extensions, and more. Free online developer tool.',
};

export default function CertificateViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
