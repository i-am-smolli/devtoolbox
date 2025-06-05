
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CIDR Calculator & Subnet Visualizer - Networking Tool',
  description: 'Calculate network details from CIDR notation (network address, broadcast, usable hosts, subnet mask) and visualize subnets. Essential for network administrators.',
};

export default function CidrCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
