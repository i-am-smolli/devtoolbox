import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
    title: "Shodan Search Query Builder",
    description:
        "Build Shodan.io search queries with a guided interface. Combine filters for ports, products, locations, SSL, vulnerabilities, and more to craft precise Shodan queries.",
};

export default function ShodanQueryBuilderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
