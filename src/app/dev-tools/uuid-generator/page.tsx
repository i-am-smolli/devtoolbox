"use client";

import React from "react";import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Blocks, Copy, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Metadata is now handled by layout.tsx

const MIN_COUNT = 1;
const MAX_COUNT = 1000; // Sensible limit to avoid browser freeze

export default function UuidGeneratorPage() {
  const [count, setCount] = useState<number>(1);
  const [generatedUuids, setGeneratedUuids] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (outputTextareaRef.current) {
      outputTextareaRef.current.style.height = "auto";
      outputTextareaRef.current.style.height = `${outputTextareaRef.current.scrollHeight}px`;
    }
  }, [generatedUuids]);

  const handleGenerateUuids = () => {
    setError(null);
    setGeneratedUuids("");
    if (!isClient) return; // crypto API only available on client

    if (isNaN(count) || count < MIN_COUNT || count > MAX_COUNT) {
      setError(
        `Number of UUIDs must be between ${MIN_COUNT} and ${MAX_COUNT}.`,
      );
      return;
    }

    if (!window.crypto || !window.crypto.randomUUID) {
      setError("Crypto API (randomUUID) is not available in this browser.");
      return;
    }

    setIsLoading(true);
    try {
      const uuidsArray: string[] = [];
      for (let i = 0; i < count; i++) {
        uuidsArray.push(window.crypto.randomUUID());
      }
      setGeneratedUuids(uuidsArray.join("\n"));
    } catch (e: unknown) {
      const errorMessage =
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof (e as { message?: unknown }).message === "string"
          ? (e as { message: string }).message
          : "Unknown error";
      setError(`Error generating UUIDs: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!generatedUuids) return;
    try {
      await navigator.clipboard.writeText(generatedUuids);
      toast({
        title: "UUIDs Copied!",
        description:
          "The generated UUID(s) have been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy UUIDs to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="UUID Generator"
        description="Generate one or more Version 4 UUIDs (Universally Unique Identifiers)."
        icon={Blocks}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="uuidCount">
              Number of UUIDs to Generate (Max: {MAX_COUNT})
            </Label>
            <Input
              id="uuidCount"
              type="number"
              value={count}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                // Allow clearing the input, handle NaN on generate
                setCount(isNaN(val) ? 0 : val);
              }}
              min={MIN_COUNT}
              max={MAX_COUNT}
              className="font-code w-full sm:w-[200px]"
            />
          </div>
          <Button
            onClick={handleGenerateUuids}
            disabled={isLoading || !isClient}
          >
            {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Generating..." : "Generate UUID(s)"}
          </Button>
        </CardContent>
      </Card>

      {isClient && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isClient && generatedUuids && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Generated UUID(s)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              ref={outputTextareaRef}
              value={generatedUuids}
              readOnly
              placeholder="Generated UUIDs will appear here..."
              className="font-code bg-muted/50 min-h-[100px] resize-none"
              style={{ overflowY: "hidden" }}
              aria-label="Generated UUIDs"
              rows={Math.min(10, count)} // Suggest rows based on count, up to 10
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              disabled={!generatedUuids}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
