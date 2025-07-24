import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Dockerfile Linter - Online Validator",
  description:
    "Analyze Dockerfiles for common syntax errors, structural issues, and best practice recommendations. Validate your Dockerfile online.",
};

export default function DockerfileLinterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
