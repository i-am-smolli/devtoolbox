import {
  ArrowRight,
  ArrowRightLeft,
  Binary,
  Blocks,
  BookText,
  CalendarClock,
  CaseSensitive,
  ClipboardList,
  Clock,
  Code2,
  Construction,
  FileCode,
  FileKey,
  FileLock2,
  FileText,
  Fingerprint,
  FolderTree,
  Grid,
  KeyRound,
  LayoutDashboard,
  Link as LinkIcon,
  ListTree,
  LockKeyhole,
  Minimize2,
  Network,
  Palette,
  Pilcrow,
  QrCode,
  RadioTower,
  ScanSearch,
  SearchCode,
  ShieldCheck,
  Shuffle,
  TerminalSquare,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "DevToolbox - Developer Utilities & Tools",
  description:
    "DevToolbox is a lightweight, privacy-first suite of web-based tools for developers. From encoders to generators and analyzers — no cookies, no fluff, just tools that work.",
};

const tools = [
  {
    title: "Base32 Encoder / Decoder",
    description: "Encode text to Base32 or decode Base32 back to text.",
    href: "/dev-tools/base32-converter",
    icon: Shuffle,
  },
  {
    title: "Hex to Binary Converter",
    description: "Convert hexadecimal values to their binary representation.",
    href: "/dev-tools/hex-to-binary",
    icon: Binary,
  },
  {
    title: "Markdown Previewer",
    description: "See a live preview of your Markdown content as you type.",
    href: "/markdown-preview",
    icon: FileText,
  },
  {
    title: "Markdown to HTML Converter",
    description: "Convert Markdown text to its HTML representation.",
    href: "/markdown-to-html",
    icon: BookText,
  },
  {
    title: "JSON Analyzer",
    description: "Validate, format, and inspect JSON data structures.",
    href: "/json-analyzer",
    icon: Code2,
  },
  {
    title: "JSON Explorer",
    description: "Navigate and explore complex JSON data in a tree view.",
    href: "/json-explorer",
    icon: FolderTree,
  },
  {
    title: "YAML/JSON Converter",
    description: "Convert data between YAML and JSON formats.",
    href: "/devops-tools/yaml-json-converter",
    icon: ArrowRightLeft,
  },
  {
    title: "Dockerfile Linter",
    description: "Analyze Dockerfiles for common syntax and structural issues.",
    href: "/devops-tools/dockerfile-linter",
    icon: FileCode,
  },
  {
    title: ".env File Parser & Viewer",
    description: "Parse, view, and manage environment variable files securely.",
    href: "/devops-tools/env-file-parser",
    icon: FileLock2,
  },
  {
    title: "Secure Password Generator",
    description: "Create strong, random passwords with customizable options.",
    href: "/dev-tools/secure-password-generator",
    icon: KeyRound,
  },
  {
    title: "Password Strength Meter",
    description:
      "Analyze the strength of passwords and get improvement suggestions.",
    href: "/dev-tools/password-strength-meter",
    icon: ShieldCheck,
  },
  {
    title: "Random String Generator",
    description:
      "Generate random strings with custom length and character sets.",
    href: "/dev-tools/random-string-generator",
    icon: Shuffle,
  },
  {
    title: "QR Code Generator",
    description:
      "Generate QR codes for text, URLs, WiFi, SMS, email, and geo locations.",
    href: "/dev-tools/qr-code-generator",
    icon: QrCode,
  },
  {
    title: "Hash Generator",
    description: "Generate hashes from text using various algorithms.",
    href: "/dev-tools/hash-generator",
    icon: Fingerprint,
  },
  {
    title: "Color Converter",
    description: "Convert colors between HEX, RGB, and HSL formats.",
    href: "/dev-tools/color-converter",
    icon: Palette,
  },
  {
    title: "cURL Command Generator",
    description: "Construct cURL commands with an easy-to-use interface.",
    href: "/dev-tools/curl-generator",
    icon: TerminalSquare,
  },
  {
    title: "Cron Expression Builder",
    description: "Visually construct and validate cron expressions.",
    href: "/devops-tools/cron-expression-builder",
    icon: CalendarClock,
  },
  {
    title: "Cron Parser",
    description: "Interpret cron expressions into a human-readable format.",
    href: "/devops-tools/cron-parser",
    icon: ClipboardList,
  },
  {
    title: "Base64 Encoder / Decoder",
    description: "Encode text to Base64 or decode Base64 back to text.",
    href: "/dev-tools/base64-converter",
    icon: Shuffle,
  },
  {
    title: "X.509 Certificate Viewer",
    description:
      "Parse and display details of a PEM-encoded X.509 certificate.",
    href: "/dev-tools/certificate-viewer",
    icon: FileKey,
  },
  {
    title: "CIDR Calculator",
    description:
      "Calculate network ranges and visualize subnets from CIDR notation.",
    href: "/networking-tools/cidr-calculator",
    icon: Network,
  },
  {
    title: "Nmap Command Generator",
    description: "Construct Nmap commands for network scanning.",
    href: "/networking-tools/nmap-command-generator",
    icon: ScanSearch,
  },
  {
    title: "tcpdump Command Generator",
    description: "Construct tcpdump commands for network packet analysis.",
    href: "/networking-tools/tcpdump-command-generator",
    icon: RadioTower,
  },
  {
    title: "Time Converter",
    description:
      "Convert between various date/time formats like Unix, ISO 8601, etc.",
    href: "/dev-tools/time-converter",
    icon: Clock,
  },
  {
    title: "Text Case Converter",
    description:
      "Convert text between different casing styles (camel, snake, etc.).",
    href: "/text-tools/case-converter",
    icon: CaseSensitive,
  },
  {
    title: "To One Liner",
    description: "Convert multi-line text into a single line.",
    href: "/text-tools/to-one-liner",
    icon: Minimize2,
  },
  {
    title: "URL Encoder / Decoder",
    description: "Encode strings to be URL-safe or decode them.",
    href: "/dev-tools/url-encoder-decoder",
    icon: LinkIcon,
  },
  {
    title: "URL Explorer",
    description:
      "Break down URLs into components: protocol, host, path, and query parameters.",
    href: "/networking-tools/url-explorer",
    icon: SearchCode,
  },
  {
    title: "URL Builder",
    description:
      "Construct URLs by specifying individual components like protocol, host, path, query parameters, and hash.",
    href: "/networking-tools/url-builder",
    icon: Construction,
  },
  {
    title: "UUID Generator",
    description: "Generate one or more Version 4 UUIDs.",
    href: "/dev-tools/uuid-generator",
    icon: Blocks,
  },
  {
    title: "JWT Decoder",
    description: "Decode JSON Web Tokens to view their header and payload.",
    href: "/dev-tools/jwt-decoder",
    icon: LockKeyhole,
  },
  {
    title: "Lorem Ipsum Generator",
    description:
      "Generate placeholder text in various styles (Lorem, DevOps, Startup).",
    href: "/text-tools/lorem-ipsum-generator",
    icon: Pilcrow,
  },
  {
    title: "Icon Browser",
    description: "Browse and search Lucide React icons for your projects.",
    href: "/dev-tools/icon-browser",
    icon: Grid,
  },
  {
    title: "Juniper SRX App List",
    description: "Browse the default application list for Juniper SRX.",
    href: "/networking-tools/juniper-srx-applications",
    icon: ListTree,
  },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Welcome to DevToolbox"
        description="Your one-stop collection of essential developer utilities."
        icon={LayoutDashboard}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((tool) => (
            <Card key={tool.href} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <tool.icon
                    className="h-7 w-7 text-primary"
                    aria-hidden="true"
                  />
                  <CardTitle className="font-headline text-xl">
                    {tool.title}
                  </CardTitle>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="grow">
                {/* Additional content or image placeholder can go here */}
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={tool.href}>
                    Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
