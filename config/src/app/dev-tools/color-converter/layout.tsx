import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Converter - HEX, RGB, HSL",
  description:
    "Convert colors seamlessly between HEX, RGB, and HSL formats. Interactive online tool for developers and designers.",
};

export default function ColorConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
