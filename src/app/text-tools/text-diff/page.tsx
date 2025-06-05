
import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Text Diff Checker (Removed)',
  description: 'The Text Diff Checker tool was previously part of DevToolbox but has been removed. Explore our other developer utilities.',
};

export default function TextDiffPlaceholderPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Text Diff Checker (Removed)"
        description="This tool has been removed."
        icon={Info}
      />
      <div className="p-4 text-center text-muted-foreground">
        <p>The Text Diff Checker tool was previously located here but has been removed.</p>
      </div>
    </div>
  );
}
