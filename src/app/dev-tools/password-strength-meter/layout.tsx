import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Password Strength Meter - Analyze Password Security",
  description:
    "Check the strength of your password and get suggestions for improvement. Securely analyze password complexity. Free online developer tool.",
};

export default function PasswordStrengthMeterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
