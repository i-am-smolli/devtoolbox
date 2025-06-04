
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FolderTree, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import JsonExplorerNode from '@/components/json-explorer-node';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialJson = `{
  "id": "0001",
  "type": "donut",
  "name": "Cake",
  "ppu": 0.55,
  "available": true,
  "calories": null,
  "batters": {
    "batter": [
      { "id": "1001", "type": "Regular" },
      { "id": "1002", "type": "Chocolate" },
      { "id": "1003", "type": "Blueberry" },
      { "id": "1004", "type": "Devil's Food" }
    ]
  },
  "topping": [
    { "id": "5001", "type": "None" },
    { "id": "5002", "type": "Glazed" },
    { "id": "5005", "type": "Sugar" },
    { "id": "5007", "type": "Powdered Sugar" }
  ],
  "emptyObject": {},
  "emptyArray": [],
  "nested": {
    "level1": {
      "level2": {
        "data": "deeply nested"
      },
      "anotherKey": 123
    }
  }
}`;

export default function JsonExplorerPage() {
  const [jsonInput, setJsonInput] = useState(initialJson);
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    handleParseJson(initialJson);
  }, []);

  const handleParseJson = (currentInput: string) => {
    if (!currentInput.trim()) {
      setParsedJson(null);
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(currentInput);
      setParsedJson(parsed);
      setError(null);
    } catch (e: any) {
      setParsedJson(null);
      setError(e.message || 'Invalid JSON format');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonInput(newText);
    handleParseJson(newText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]"> {/* Adjusted height */}
      <PageHeader
        title="JSON Explorer"
        description="Paste your JSON data to navigate and explore its structure interactively."
        icon={FolderTree}
      />
      <div className="grid md:grid-cols-2 gap-6 flex-grow min-h-0">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">JSON Input</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <Textarea
              placeholder="Paste your JSON here..."
              value={jsonInput}
              onChange={handleInputChange}
              className="h-full w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm"
              aria-label="JSON Input"
              aria-invalid={!!error}
              aria-describedby={error ? "json-error-message" : undefined}
            />
          </CardContent>
        </Card>
        
        <Card className="flex flex-col min-h-0">
          <CardHeader>
            <CardTitle className="font-headline">Explorer View</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-4 overflow-hidden">
            {isClient && error && (
              <Alert variant="destructive" id="json-error-message">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Invalid JSON</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isClient && parsedJson && !error && (
              <ScrollArea className="h-full w-full pr-2">
                <JsonExplorerNode data={parsedJson} isRoot />
              </ScrollArea>
            )}
            {isClient && !parsedJson && !error && (
                <p className="text-muted-foreground p-4">Paste JSON in the input area to explore.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
