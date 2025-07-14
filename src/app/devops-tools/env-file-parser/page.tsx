"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileLock2, Copy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Metadata is now handled by layout.tsx

interface EnvVariable {
  key: string;
  value: string;
}

export default function EnvFileParserPage() {
  const [envContent, setEnvContent] = useState("");
  const [parsedVariables, setParsedVariables] = useState<EnvVariable[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [envContent]);

  const parseEnvContent = (content: string) => {
    if (!content.trim()) {
      setParsedVariables([]);
      setError(null);
      return;
    }

    const lines = content.split("\n");
    const variables: EnvVariable[] = [];
    let parseError: string | null = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (trimmedLine === "" || trimmedLine.startsWith("#")) {
        // Skip empty lines and comments
        return;
      }

      const eqIndex = trimmedLine.indexOf("=");
      if (eqIndex !== -1) {
        const key = trimmedLine.substring(0, eqIndex).trim();
        let value = trimmedLine.substring(eqIndex + 1).trim();

        // Strip surrounding quotes (single or double)
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.substring(1, value.length - 1);
        }

        // Basic validation for key format (optional, but good practice)
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
          // This error might be too strict for some .env conventions, consider removing if it causes issues
          // For now, we'll allow more flexible keys and focus on structure
        }

        variables.push({ key, value });
      } else if (trimmedLine) {
        // Line has content but no '='
        parseError = `Error on line ${index + 1}: Invalid format. Lines should be 'KEY=VALUE' or comments starting with '#'.`;
        // Stop further parsing on error or collect all errors? For now, stop at first structural error.
        return;
      }
    });

    if (parseError) {
      setError(parseError);
      setParsedVariables([]);
    } else {
      setParsedVariables(variables);
      setError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEnvContent(newContent);
    parseEnvContent(newContent);
  };

  const handleCopyToClipboard = async (text: string, keyName: string) => {
    if (!text && typeof text !== "string") return; // Allow copying empty strings
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: `Value for "${keyName}" has been copied.`,
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: `Could not copy value for "${keyName}".`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title=".env File Parser & Viewer"
        description="Paste your .env file content to parse and view variables."
        icon={FileLock2}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">.env Input</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              ref={textareaRef}
              placeholder="Paste your .env file content here..."
              value={envContent}
              onChange={handleInputChange}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[200px]"
              aria-label=".env Input"
              style={{ overflowY: "hidden" }}
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Parsed Variables</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <ScrollArea className="h-full w-full p-4 min-h-[200px]">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Parsing Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!error && parsedVariables.length === 0 && !envContent.trim() && (
                <p className="text-muted-foreground">
                  Paste your .env content in the input area to see parsed
                  variables.
                </p>
              )}
              {!error && parsedVariables.length === 0 && envContent.trim() && (
                <p className="text-muted-foreground">
                  No variables found or the input is empty after parsing
                  comments.
                </p>
              )}
              {!error && parsedVariables.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Variable</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right w-[80px]">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedVariables.map((variable) => (
                      <TableRow key={variable.key}>
                        <TableCell className="font-medium font-code break-all">
                          {variable.key}
                        </TableCell>
                        <TableCell className="font-code break-all">
                          {variable.value}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleCopyToClipboard(
                                variable.value,
                                variable.key,
                              )
                            }
                            aria-label={`Copy value of ${variable.key}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
