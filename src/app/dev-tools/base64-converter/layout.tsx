import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Base64 Encoder/Decoder",
  description:
    "Easily encode text to Base64 or decode Base64 strings back to text. Handles UTF-8 characters. Free online developer tool for DevToolbox.",
};

export default function Base64ConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
