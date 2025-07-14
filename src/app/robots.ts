import type { MetadataRoute } from "next";

// IMPORTANT: Replace with your actual production domain or set a SITE_URL environment variable
const BASE_URL = process.env.SITE_URL || "https://devtoolbox.icu";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: [],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
