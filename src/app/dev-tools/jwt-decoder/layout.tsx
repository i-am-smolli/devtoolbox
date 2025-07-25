import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "JWT Decoder",
  description:
    "Decode JSON Web Tokens (JWT) to inspect their header and payload. Signature is NOT verified. Useful for debugging and understanding JWT structure.",
};

export default function JwtDecoderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
