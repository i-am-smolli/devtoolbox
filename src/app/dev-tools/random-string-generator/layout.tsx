import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Random String Generator",
  description:
    "Generate random strings with customizable length and character sets (uppercase, lowercase, numbers, symbols). Free online developer tool.",
};

export default function RandomStringGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
