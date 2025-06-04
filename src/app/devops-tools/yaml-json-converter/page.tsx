
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';

export default function YamlJsonConverterPage() {
  return (
    <div>
      <PageHeader
        title="YAML/JSON Converter"
        description="Convert data between YAML and JSON formats."
        icon={ArrowRightLeft}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Feature Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The functionality for the YAML/JSON Converter will be implemented here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
