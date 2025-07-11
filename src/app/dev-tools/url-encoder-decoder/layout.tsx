import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "URL Encoder / Decoder",
  description:
    "Encode strings to be URL-safe (percent-encoding) or decode URL-encoded strings back to their original form.",
};

export default function UrlEncoderDecoderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
