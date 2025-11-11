import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "What Is My Public IP Address? - IPv4 & IPv6 Lookup",
  description:
    "Quickly find your public IP address (both IPv4 and IPv6). This free online tool also provides a simple API endpoint for command-line use with curl or wget to get your public IP programmatically.",
  keywords: [
    "what is my ip",
    "ip address",
    "public ip",
    "ip lookup",
    "my ip",
    "ipv4 address",
    "ipv6 address",
    "ip api",
    "curl ip",
    "wget ip",
  ],
};

export default function WhatIsMyIpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
