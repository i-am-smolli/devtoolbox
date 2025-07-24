import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Secure Password Generator - Create Strong Passwords",
  description:
    "Generate strong, random, and secure passwords with customizable options for length, uppercase, lowercase, numbers, and symbols.",
};

export default function SecurePasswordGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
