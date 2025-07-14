import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Nmap Command Generator",
  description:
    "Easily construct Nmap commands for network scanning and security auditing. Select common options and specify targets to generate the command.",
};

export default function NmapCommandGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
