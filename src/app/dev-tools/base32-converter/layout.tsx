import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Base32 Encoder/Decoder",
  description:
    "Easily encode text to Base32 or decode Base32 strings back to text. Handles UTF-8 characters. Free online developer tool for DevToolbox.",
};

export default function Base32ConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
