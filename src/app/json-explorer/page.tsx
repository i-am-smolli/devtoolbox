"use client";

import { AlertCircle, FolderTree } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import JsonExplorerNode from "@/components/json-explorer-node";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

// Metadata is now handled by layout.tsx

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
  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleParseJson = useCallback((currentInput: string) => {
    if (!currentInput.trim()) {
      setParsedJson(null);
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(currentInput);
      setParsedJson(parsed);
      setError(null);
    } catch (e: unknown) {
      setParsedJson(null);
      if (
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof (e as { message?: unknown }).message === "string"
      ) {
        setError((e as { message: string }).message);
      } else {
        setError("Invalid JSON format");
      }
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    handleParseJson(initialJson);
  }, [handleParseJson]);

  useEffect(() => {
    if (isClient && textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to recalculate
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isClient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonInput(newText);
    handleParseJson(newText);
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="JSON Explorer"
        description="Paste your JSON data to navigate and explore its structure interactively."
        icon={FolderTree}
      />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">JSON Input</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              ref={textareaRef}
              placeholder="Paste your JSON here..."
              value={jsonInput}
              onChange={handleInputChange}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm"
              aria-label="JSON Input"
              aria-invalid={!!error}
              aria-describedby={error ? "json-error-message" : undefined}
              style={{ overflowY: "hidden" }}
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Explorer View</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            {isClient && error && (
              <div className="p-4">
                <Alert variant="destructive" id="json-error-message">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Invalid JSON</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            <ScrollArea className="h-full w-full p-4">
              {isClient &&
              parsedJson &&
              !error &&
              (typeof parsedJson === "object" || Array.isArray(parsedJson)) ? (
                <JsonExplorerNode
                  data={parsedJson as Record<string, unknown> | unknown[]}
                  isRoot
                />
              ) : null}
              {isClient && !parsedJson && !error && (
                <p className="text-muted-foreground">
                  Paste JSON in the input area to explore.
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
