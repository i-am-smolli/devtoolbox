import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Previewer",
  description:
    "Write Markdown text and see the rendered HTML in real-time. Supports GitHub Flavored Markdown (GFM). Perfect for content creators and developers.",
};

export default function MarkdownPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
