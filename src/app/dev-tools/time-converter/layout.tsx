import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Time Converter - Unix, ISO 8601, Date, Time",
  description:
    "Convert timestamps between various formats including Unix (seconds/ms), ISO 8601, Date, Time, HTTP, and SQL. Adjust time easily.",
};

export default function TimeConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
