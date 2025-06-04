
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, Binary, FileText, Code2, FolderTree, ArrowRightLeft, FileCode, FileLock2, KeyRound, Fingerprint, BookText } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dev-tools/hex-to-binary', label: 'Hex to Binary', icon: Binary },
  { href: '/markdown-preview', label: 'Markdown Preview', icon: FileText },
  { href: '/markdown-to-html', label: 'Markdown to HTML', icon: BookText },
  { href: '/json-analyzer', label: 'JSON Analyzer', icon: Code2 },
  { href: '/json-explorer', label: 'JSON Explorer', icon: FolderTree },
  { href: '/devops-tools/yaml-json-converter', label: 'YAML/JSON Converter', icon: ArrowRightLeft },
  { href: '/devops-tools/dockerfile-linter', label: 'Dockerfile Linter', icon: FileCode },
  { href: '/devops-tools/env-file-parser', label: '.env File Parser', icon: FileLock2 },
  { href: '/dev-tools/secure-password-generator', label: 'Password Generator', icon: KeyRound },
  { href: '/dev-tools/hash-generator', label: 'Hash Generator', icon: Fingerprint },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
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
