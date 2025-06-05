
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, Binary, FileText, Code2, FolderTree, ArrowRightLeft, FileCode, FileLock2, KeyRound, Fingerprint, BookText, Palette, TerminalSquare, CalendarClock, ClipboardList, Shuffle, Network, Clock, CaseSensitive, Link as LinkIcon } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dev-tools/base64-converter', label: 'Base64 Converter', icon: Shuffle },
  { href: '/dev-tools/color-converter', label: 'Color Converter', icon: Palette },
  { href: '/dev-tools/curl-generator', label: 'cURL Generator', icon: TerminalSquare },
  { href: '/dev-tools/hash-generator', label: 'Hash Generator', icon: Fingerprint },
  { href: '/dev-tools/hex-to-binary', label: 'Hex to Binary', icon: Binary },
  { href: '/dev-tools/secure-password-generator', label: 'Password Generator', icon: KeyRound },
  { href: '/dev-tools/time-converter', label: 'Time Converter', icon: Clock },
  { href: '/dev-tools/url-encoder-decoder', label: 'URL Encoder/Decoder', icon: LinkIcon },
  { href: '/markdown-preview', label: 'Markdown Preview', icon: FileText },
  { href: '/markdown-to-html', label: 'Markdown to HTML', icon: BookText },
  { href: '/json-analyzer', label: 'JSON Analyzer', icon: Code2 },
  { href: '/json-explorer', label: 'JSON Explorer', icon: FolderTree },
  { href: '/devops-tools/cron-expression-builder', label: 'Cron Builder', icon: CalendarClock },
  { href: '/devops-tools/cron-parser', label: 'Cron Parser', icon: ClipboardList },
  { href: '/devops-tools/dockerfile-linter', label: 'Dockerfile Linter', icon: FileCode },
  { href: '/devops-tools/env-file-parser', label: '.env File Parser', icon: FileLock2 },
  { href: '/devops-tools/yaml-json-converter', label: 'YAML/JSON Converter', icon: ArrowRightLeft },
  { href: '/networking-tools/cidr-calculator', label: 'CIDR Calculator', icon: Network },
  { href: '/text-tools/case-converter', label: 'Text Case Converter', icon: CaseSensitive },
];

export function MainNav() {
  const pathname = usePathname();
  const sortedNavItems = [...navItems].sort((a, b) => {
    if (a.href === '/') return -1;
    if (b.href === '/') return 1;
    return a.label.localeCompare(b.label);
  });

  return (
    <SidebarMenu>
      {sortedNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={{content: item.label, side: 'right', align: 'center'}}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
          >
            <Link href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>
              <item.icon className="h-5 w-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
