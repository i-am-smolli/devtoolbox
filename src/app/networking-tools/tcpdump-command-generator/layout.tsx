import type { Metadata } from "next";
import React from "react";


export const metadata: Metadata = {
  title: "tcpdump Command Generator",
  description:
    "Easily construct tcpdump commands for network packet analysis. Select interfaces, filters, and output options to generate the precise command you need.",
};

export default function TcpdumpCommandGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
