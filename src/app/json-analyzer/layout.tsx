import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "JSON Analyzer - Validate & Format JSON",
  description:
    "Validate, format, and inspect your JSON data. Free online tool to ensure your JSON is well-formed and to pretty-print it.",
};

export default function JsonAnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
