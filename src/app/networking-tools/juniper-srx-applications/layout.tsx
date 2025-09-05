import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Juniper SRX Default Application List",
  description:
    "Browse and search the default application list for Juniper SRX firewalls. Quickly find application details, protocols, and port numbers.",
};

export default function JuniperSrxApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
