
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hex to Binary Converter',
  description: 'Quickly and easily convert hexadecimal (hex) values to their binary representation with this free online developer tool from DevToolbox.',
};

export default function HexToBinaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
