import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "JSON Explorer - Navigate & View JSON Tree",
  description:
    "Interactively navigate and explore complex JSON data structures in a collapsible tree view. Easy to use online tool for developers.",
};

export default function JsonExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
