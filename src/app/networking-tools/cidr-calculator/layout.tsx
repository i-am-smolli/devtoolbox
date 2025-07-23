import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "CIDR Calculator & Subnet Visualizer",
  description:
    "Calculate network details from CIDR notation (network address, broadcast, usable hosts, subnet mask) and visualize subnets. Essential for network administrators.",
};

export default function CidrCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
