import type { MetadataRoute } from "next";

// IMPORTANT: Replace with your actual production domain or set a SITE_URL environment variable
const BASE_URL = process.env.SITE_URL || "https://devtoolbox.icu";

// List of all your tool pages and the homepage
// This list should be kept in sync with your actual available tool pages
const pages: string[] = [
  "/", // Homepage
  "/dev-tools/base32-converter",
  "/dev-tools/hex-to-binary",
  "/markdown-preview",
  "/markdown-to-html",
  "/json-analyzer",
  "/json-explorer",
  "/devops-tools/yaml-json-converter",
  "/devops-tools/dockerfile-linter",
  "/devops-tools/env-file-parser",
  "/dev-tools/secure-password-generator",
  "/dev-tools/password-strength-meter",
  "/dev-tools/random-string-generator",
  "/dev-tools/qr-code-generator",
  "/dev-tools/hash-generator",
  "/dev-tools/color-converter",
  "/dev-tools/curl-generator",
  "/devops-tools/cron-expression-builder",
  "/devops-tools/cron-parser",
  "/dev-tools/base64-converter",
  "/dev-tools/certificate-viewer",
  "/networking-tools/cidr-calculator",
  "/networking-tools/nmap-command-generator",
  "/networking-tools/tcpdump-command-generator",
  "/dev-tools/time-converter",
  "/text-tools/case-converter",
  "/text-tools/to-one-liner",
  "/dev-tools/url-encoder-decoder",
  "/networking-tools/url-explorer",
  "/networking-tools/url-builder",
  "/dev-tools/uuid-generator",
  "/dev-tools/jwt-decoder",
  "/text-tools/lorem-ipsum-generator",
  "/dev-tools/icon-browser",
  "/networking-tools/juniper-srx-applications",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((page) => ({
    url: `${BASE_URL}${page}`,
    lastModified: new Date(),
    changeFrequency: page === "/" ? "weekly" : "monthly", // Adjust as needed
    priority: page === "/" ? 1 : 0.8, // Homepage higher priority
  }));
}
