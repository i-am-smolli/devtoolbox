"use client";

// Removed: import type { Metadata } from 'next';
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Code2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

// Metadata is now handled by layout.tsx

const initialJson = {
  name: "DevToolbox",
  version: "1.0.0",
  features: ["Hex to Binary", "Markdown Preview", "JSON Analyzer"],
  settings: { darkMode: true, fontSize: 14 },
  author: "iamsmolli",
};

export default function JsonAnalyzerPage() {
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(initialJson, null, 2),
  );
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (initialJson) {
      handleAnalyze(JSON.stringify(initialJson, null, 2));
    }
  }, []);

  const handleAnalyze = (currentInput: string) => {
    if (!currentInput.trim()) {
      setFormattedJson("");
      setError(null);
      setIsValid(null);
      return;
    }
    try {
      const parsed = JSON.parse(currentInput);
      setFormattedJson(JSON.stringify(parsed, null, 2));
      setError(null);
      setIsValid(true);
    } catch (e: unknown) {
      setFormattedJson("");
      setError(
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "An unknown error occurred",
      );
      setIsValid(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonInput(newText);
    handleAnalyze(newText);
  };

  const handleFormat = () => {
    if (isValid && formattedJson) {
      setJsonInput(formattedJson);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2*(--spacing(6)))]">
      <PageHeader
        title="JSON Analyzer"
        description="Validate, format, and inspect your JSON data."
        icon={Code2}
      />

      <div className="mb-4 space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => handleAnalyze(jsonInput)}
            className="w-full sm:w-auto"
          >
            Validate
          </Button>
          <Button
            onClick={handleFormat}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={!isValid || !formattedJson}
          >
            Format Input
          </Button>
        </div>
        {isClient && isValid === true && (
          <Alert
            variant="default"
            id="json-valid-message"
            className="border-green-500"
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-500">JSON is Valid</AlertTitle>
            <AlertDescription>
              The provided JSON structure is correct.
            </AlertDescription>
          </Alert>
        )}
        {isClient && isValid === false && error && (
          <Alert variant="destructive" id="json-error-message">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid JSON</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 grow min-h-0">
        <Card className="flex flex-col min-h-0">
          <CardHeader>
            <CardTitle className="font-headline">JSON Input</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              placeholder="Paste your JSON here..."
              value={jsonInput}
              onChange={handleInputChange}
              className="h-full w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm"
              aria-label="JSON Input"
              aria-invalid={isValid === false}
              aria-describedby={
                error
                  ? "json-error-message"
                  : isValid === true
                    ? "json-valid-message"
                    : undefined
              }
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col grow min-h-0">
          <CardHeader>
            <CardTitle className="font-headline">
              Formatted Output / Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <ScrollArea className="h-full w-full p-4">
              {isClient && formattedJson && isValid === true && (
                <pre className="text-sm font-code bg-muted/50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
                  <code>{formattedJson}</code>
                </pre>
              )}
              {isClient && isValid !== true && (
                <p className="text-muted-foreground p-4">
                  {jsonInput.trim()
                    ? "Click 'Validate' or 'Format Input' to process the JSON."
                    : "Enter JSON and click a button to process."}
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
