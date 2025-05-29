import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Expression Builder - Visual Cron Tool",
  description:
    "Visually construct and generate cron expressions for scheduling tasks. Easy-to-use interface for minutes, hours, days, months, and day of the week.",
};

export default function CronExpressionBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
