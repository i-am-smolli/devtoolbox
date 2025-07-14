import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "YAML/JSON Converter",
  description:
    "Convert data seamlessly between YAML and JSON formats. Easy to use for configuration files, data exchange, and more.",
};

export default function YamlJsonConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
