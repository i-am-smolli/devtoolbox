
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCode } from 'lucide-react';

export default function DockerfileLinterPage() {
  return (
    <div>
      <PageHeader
        title="Dockerfile Linter"
        description="Analyze Dockerfiles for errors and adherence to best practices."
        icon={FileCode}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Feature Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The functionality for the Dockerfile Linter will be implemented here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
