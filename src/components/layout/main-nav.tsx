"use client";

import {
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
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/dev-tools/base64-converter",
    label: "Base64 Converter",
    icon: Shuffle,
  },
  {
    href: "/dev-tools/certificate-viewer",
    label: "Certificate Viewer",
    icon: FileKey,
  },
  {
    href: "/dev-tools/color-converter",
    label: "Color Converter",
    icon: Palette,
  },
  {
    href: "/dev-tools/curl-generator",
    label: "cURL Generator",
    icon: TerminalSquare,
  },
  {
    href: "/dev-tools/hash-generator",
    label: "Hash Generator",
    icon: Fingerprint,
  },
  { href: "/dev-tools/hex-to-binary", label: "Hex to Binary", icon: Binary },
  { href: "/dev-tools/icon-browser", label: "Icon Browser", icon: Grid },
  { href: "/dev-tools/jwt-decoder", label: "JWT Decoder", icon: LockKeyhole },
  {
    href: "/dev-tools/password-strength-meter",
    label: "Password Strength",
    icon: ShieldCheck,
  },
  {
    href: "/dev-tools/secure-password-generator",
    label: "Password Generator",
    icon: KeyRound,
  },
  {
    href: "/dev-tools/qr-code-generator",
    label: "QR Code Generator",
    icon: QrCode,
  },
  {
    href: "/dev-tools/random-string-generator",
    label: "Random String Gen",
    icon: Shuffle,
  },
  { href: "/dev-tools/time-converter", label: "Time Converter", icon: Clock },
  {
    href: "/dev-tools/url-encoder-decoder",
    label: "URL Encoder/Decoder",
    icon: LinkIcon,
  },
  { href: "/dev-tools/uuid-generator", label: "UUID Generator", icon: Blocks },
  { href: "/markdown-preview", label: "Markdown Preview", icon: FileText },
  { href: "/markdown-to-html", label: "Markdown to HTML", icon: BookText },
  { href: "/json-analyzer", label: "JSON Analyzer", icon: Code2 },
  { href: "/json-explorer", label: "JSON Explorer", icon: FolderTree },
  {
    href: "/devops-tools/cron-expression-builder",
    label: "Cron Builder",
    icon: CalendarClock,
  },
  {
    href: "/devops-tools/cron-parser",
    label: "Cron Parser",
    icon: ClipboardList,
  },
  {
    href: "/devops-tools/dockerfile-linter",
    label: "Dockerfile Linter",
    icon: FileCode,
  },
  {
    href: "/devops-tools/env-file-parser",
    label: ".env File Parser",
    icon: FileLock2,
  },
  {
    href: "/devops-tools/yaml-json-converter",
    label: "YAML/JSON Converter",
    icon: ArrowRightLeft,
  },
  {
    href: "/networking-tools/cidr-calculator",
    label: "CIDR Calculator",
    icon: Network,
  },
  {
    href: "/networking-tools/juniper-srx-applications",
    label: "Juniper SRX Apps",
    icon: ListTree,
  },
  {
    href: "/networking-tools/nmap-command-generator",
    label: "Nmap Command Gen",
    icon: ScanSearch,
  },
  {
    href: "/networking-tools/tcpdump-command-generator",
    label: "tcpdump Command Gen",
    icon: RadioTower,
  },
  {
    href: "/networking-tools/url-explorer",
    label: "URL Explorer",
    icon: SearchCode,
  },
  {
    href: "/networking-tools/url-builder",
    label: "URL Builder",
    icon: Construction,
  },
  {
    href: "/text-tools/case-converter",
    label: "Text Case Converter",
    icon: CaseSensitive,
  },
  { href: "/text-tools/to-one-liner", label: "To One Liner", icon: Minimize2 },
  {
    href: "/text-tools/lorem-ipsum-generator",
    label: "Lorem Ipsum Generator",
    icon: Pilcrow,
  },
];

export function MainNav() {
  const pathname = usePathname();
  const sortedNavItems = [...navItems].sort((a, b) => {
    if (a.href === "/") return -1;
    if (b.href === "/") return 1;
    // Group by category, then sort by label
    const categoryA = a.href.split("/")[1] || "";
    const categoryB = b.href.split("/")[1] || "";
    if (categoryA !== categoryB) {
      return categoryA.localeCompare(categoryB);
    }
    return a.label.localeCompare(b.label);
  });

  return (
    <SidebarMenu>
      {sortedNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={{ content: item.label, side: "right", align: "center" }}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
          >
            <Link
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
