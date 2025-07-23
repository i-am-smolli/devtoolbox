"use client";

import type React from "react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { MainNav } from "./main-nav";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-background">
        <Sidebar className="border-r bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-4">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="DevToolbox Home"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-primary"
              >
                <title>DevToolbox Logo</title>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <h2 className="text-xl font-headline font-semibold text-foreground">
                DevToolbox
              </h2>
            </Link>
          </SidebarHeader>
          <SidebarContent className="grow p-2">
            <MainNav />
          </SidebarContent>
          <SidebarFooter className="p-4 mt-auto">
            <Separator className="my-2 bg-sidebar-border" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              asChild
            >
              <Link
                href="https://github.com/i-am-smolli/devtoolbox"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-xs px-6">
            <div className="md:hidden">
              <SidebarTrigger aria-label="Toggle sidebar" />
            </div>
            <div className="flex-1">
              {/* Optional: Breadcrumbs or dynamic page title can go here */}
            </div>
            {/* Optional: User menu or theme toggle */}
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
