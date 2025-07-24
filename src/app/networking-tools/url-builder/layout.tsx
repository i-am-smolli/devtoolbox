import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "URL Builder - Construct URLs Easily",
  description:
    "Construct well-formed URLs by specifying individual components like protocol, hostname, port, path, query parameters, and hash fragment. Online tool for developers.",
};

export default function UrlBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
