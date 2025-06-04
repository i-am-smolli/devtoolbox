
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Binary, FileText, Code2, ArrowRight, FolderTree, ArrowRightLeft, Anchor, FileCode, FileLock2 } from 'lucide-react';

const tools = [
  {
    title: 'Hex to Binary Converter',
    description: 'Convert hexadecimal values to their binary representation.',
    href: '/dev-tools/hex-to-binary',
    icon: Binary,
  },
  {
    title: 'Markdown Previewer',
    description: 'See a live preview of your Markdown content as you type.',
    href: '/markdown-preview',
    icon: FileText,
  },
  {
    title: 'JSON Analyzer',
    description: 'Validate, format, and inspect JSON data structures.',
    href: '/json-analyzer',
    icon: Code2,
  },
  {
    title: 'JSON Explorer',
    description: 'Navigate and explore complex JSON data in a tree view.',
    href: '/json-explorer',
    icon: FolderTree,
  },
  {
    title: 'YAML/JSON Converter',
    description: 'Convert data between YAML and JSON formats.',
    href: '/devops-tools/yaml-json-converter',
    icon: ArrowRightLeft,
  },
  {
    title: 'Kubernetes YAML Validator',
    description: 'Validate Kubernetes manifest files for syntax and best practices.',
    href: '/devops-tools/kubernetes-yaml-validator',
    icon: Anchor,
  },
  {
    title: 'Dockerfile Linter',
    description: 'Analyze Dockerfiles for errors and adherence to best practices.',
    href: '/devops-tools/dockerfile-linter',
    icon: FileCode,
  },
  {
    title: '.env File Parser & Viewer',
    description: 'Parse, view, and manage environment variable files securely.',
    href: '/devops-tools/env-file-parser',
    icon: FileLock2,
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Welcome to DevToolbox"
        description="Your one-stop collection of essential developer utilities."
        icon={LayoutDashboard}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.href} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <tool.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                <CardTitle className="font-headline text-xl">{tool.title}</CardTitle>
              </div>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
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
