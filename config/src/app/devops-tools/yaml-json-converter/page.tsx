"use client";

// Removed: import type { Metadata } from 'next';
import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRightLeft, AlertCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import yaml from "js-yaml";

// Metadata is now handled by layout.tsx

export default function YamlJsonConverterPage() {
  const [yamlInput, setYamlInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const yamlTextareaRef = useRef<HTMLTextAreaElement>(null);
  const jsonTextareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = (
    textareaRef: React.RefObject<HTMLTextAreaElement>,
  ) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight(yamlTextareaRef);
  }, [yamlInput]);

  useEffect(() => {
    adjustTextareaHeight(jsonTextareaRef);
  }, [jsonInput]);

  const handleYamlInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setYamlInput(e.target.value);
    if (error) setError(null); // Clear error on input change
  };

  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    if (error) setError(null); // Clear error on input change
  };

  const convertToJSON = () => {
    if (!yamlInput.trim()) {
      setJsonInput("");
      setError(null);
      return;
    }
    try {
      const jsonData = yaml.load(yamlInput);
      // Check if jsonData is undefined (which yaml.load returns for empty or whitespace-only input)
      // or if it's a type that cannot be stringified directly (like a function, though yaml.load usually handles this)
      if (typeof jsonData === "undefined" && yamlInput.trim() !== "") {
        // If input was not just whitespace but result is undefined, it's likely an invalid structure
        // that doesn't throw but also doesn't produce a valid object (e.g. just "---")
        setJsonInput(""); // Clear output
        setError("Invalid YAML structure or empty document.");
        return;
      }
      setJsonInput(JSON.stringify(jsonData, null, 2));
      setError(null);
    } catch (e: unknown) {
      setYamlInput("");
      const message =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Invalid JSON format";
      setError(`JSON to YAML Error: ${message}`);
    }
  };

  const convertToYAML = () => {
    if (!jsonInput.trim()) {
      setYamlInput("");
      setError(null);
      return;
    }
    try {
      const jsonData = JSON.parse(jsonInput);
      setYamlInput(yaml.dump(jsonData));
      setError(null);
    } catch (e: unknown) {
      setYamlInput("");
      const message =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Invalid JSON format";
      setError(`JSON to YAML Error: ${message}`);
    }
  };

  const handleCopyToClipboard = async (text: string, type: "YAML" | "JSON") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: `${type} content has been copied.`,
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: `Could not copy ${type} content to clipboard.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="YAML/JSON Converter"
        description="Convert data between YAML and JSON formats seamlessly."
        icon={ArrowRightLeft}
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Conversion Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">YAML</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              ref={yamlTextareaRef}
              placeholder="Enter YAML here..."
              value={yamlInput}
              onChange={handleYamlInputChange}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[200px]"
              aria-label="YAML Input"
              style={{ overflowY: "hidden" }}
            />
          </CardContent>
          <CardFooter className="p-4 gap-2">
            <Button onClick={convertToJSON} className="w-full sm:w-auto">
              Convert to JSON
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyToClipboard(yamlInput, "YAML")}
              aria-label="Copy YAML to clipboard"
              disabled={!yamlInput}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">JSON</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              ref={jsonTextareaRef}
              placeholder="Enter JSON here..."
              value={jsonInput}
              onChange={handleJsonInputChange}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[200px]"
              aria-label="JSON Input"
              style={{ overflowY: "hidden" }}
            />
          </CardContent>
          <CardFooter className="p-4 gap-2">
            <Button onClick={convertToYAML} className="w-full sm:w-auto">
              Convert to YAML
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyToClipboard(jsonInput, "JSON")}
              aria-label="Copy JSON to clipboard"
              disabled={!jsonInput}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
