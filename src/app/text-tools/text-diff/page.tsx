
'use client';

import { PageHeader } from '@/components/page-header';
import { Info } from 'lucide-react';

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
