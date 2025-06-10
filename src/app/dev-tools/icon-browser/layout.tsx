import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lucide Icon Browser",
  description:
    "Browse, search, and find the perfect Lucide React icon for your project. Copy icon names and import statements easily.",
};

export default function IconBrowserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
