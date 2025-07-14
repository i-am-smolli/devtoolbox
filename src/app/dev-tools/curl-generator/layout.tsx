import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "cURL Command Generator",
  description:
    "Easily construct cURL commands with a guided interface. Specify URL, method, headers, and request body for HTTP requests. Free online dev tool.",
};

export default function CurlGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
