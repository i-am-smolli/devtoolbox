import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "QR Code Generator - Text, URL, WiFi, SMS, Email, Geo",
  description:
    "Generate custom QR codes for various data types including text, URLs, WiFi credentials, SMS, email, and geographic locations. Download as PNG.",
};

export default function QrCodeGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
