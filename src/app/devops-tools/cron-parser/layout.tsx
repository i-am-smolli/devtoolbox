import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Cron Expression Parser - Human-Readable Cron",
  description:
    "Enter a cron expression to parse it and see a human-readable interpretation of the schedule. Helps in understanding complex cron jobs.",
};

export default function CronParserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
