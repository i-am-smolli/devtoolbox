import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: ".env File Parser & Viewer",
  description:
    "Paste your .env file content to parse and view environment variables in a structured table. Securely manage and inspect your .env files.",
};

export default function EnvFileParserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
