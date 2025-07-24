import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Text Case Converter - camelCase, snake_case, etc.",
  description:
    "Convert text between various casing styles like camelCase, snake_case, PascalCase, Title Case, UPPER CASE, lower case, and more. Free online tool.",
};

export default function CaseConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
