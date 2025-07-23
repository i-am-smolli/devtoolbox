"use client";
import type React from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CaseSensitive, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCallback } from "react";

// Helper function to split words from various formats
const toWords = (str: string): string[] => {
  if (!str) return [];
  str = str
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Handle series of uppercase like `HTTPServer` -> `HTTP Server`
    .replace(/([a-z\d])([A-Z])/g, "$1 $2") // Handle camelCase and PascalCase like `camelCase` -> `camel Case`
    .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove other special characters
    .replace(/\s+/g, " "); // Condense multiple spaces to single space
  return str
    .trim()
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 0);
};

const conversionFunctions: Record<string, (str: string) => string> = {
  sentenceCase: (str) => {
    if (!str.trim()) return "";
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  },
  lowerCase: (str) => str.toLowerCase(),
  upperCase: (str) => str.toUpperCase(),
  titleCase: (str) => {
    return toWords(str)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },
  camelCase: (str) => {
    const words = toWords(str);
    return words
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join("");
  },
  pascalCase: (str) => {
    return toWords(str)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  },
  snakeCase: (str) => {
    return toWords(str).join("_");
  },
  kebabCase: (str) => {
    return toWords(str).join("-");
  },
  constantCase: (str) => {
    return toWords(str).join("_").toUpperCase();
  },
};

const caseTypes = [
  { id: "sentenceCase", label: "Sentence case" },
  { id: "lowerCase", label: "lower case" },
  { id: "upperCase", label: "UPPER CASE" },
  { id: "titleCase", label: "Title Case" },
  { id: "camelCase", label: "camelCase" },
  { id: "pascalCase", label: "PascalCase" },
  { id: "snakeCase", label: "snake_case" },
  { id: "kebabCase", label: "kebab-case" },
  { id: "constantCase", label: "CONSTANT_CASE" },
];

export default function CaseConverterPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const { toast } = useToast();

  const inputTextareaRef = useRef<HTMLTextAreaElement>(
    null,
  ) as React.RefObject<HTMLTextAreaElement>;
  const outputTextareaRef = useRef<HTMLTextAreaElement>(
    null,
  ) as React.RefObject<HTMLTextAreaElement>;

  const adjustTextareaHeight = useCallback((ref: React.RefObject<HTMLTextAreaElement>) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => adjustTextareaHeight(inputTextareaRef), [adjustTextareaHeight]);
  useEffect(() => adjustTextareaHeight(outputTextareaRef), [adjustTextareaHeight]);

  const handleConvert = (caseId: string) => {
    if (!inputText.trim()) {
      setOutputText("");
      return;
    }
    const convertFn = conversionFunctions[caseId];
    if (convertFn) {
      setOutputText(convertFn(inputText));
    }
  };

  const handleCopyToClipboard = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Output Copied!",
        description: "The converted text has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy text.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="Text Case Converter"
        description="Convert text between various casing styles like camelCase, snake_case, PascalCase, and more."
        icon={CaseSensitive}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Input Text</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              ref={inputTextareaRef}
              placeholder="Enter your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[150px]"
              style={{ overflowY: "hidden" }}
              aria-label="Input text for case conversion"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Output Text</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              ref={outputTextareaRef}
              value={outputText}
              readOnly
              placeholder="Converted text will appear here..."
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm bg-muted/50 min-h-[150px]"
              style={{ overflowY: "hidden" }}
              aria-label="Converted output text"
            />
          </CardContent>
          <CardFooter className="p-4">
            <Button
              onClick={handleCopyToClipboard}
              disabled={!outputText}
              variant="outline"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Output
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Conversion Options</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {caseTypes.map((caseType) => (
            <Button
              key={caseType.id}
              onClick={() => handleConvert(caseType.id)}
              variant="outline"
              className="justify-start"
            >
              {caseType.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
