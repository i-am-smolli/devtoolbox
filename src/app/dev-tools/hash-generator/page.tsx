"use client";

import { AlertCircle, Copy, Fingerprint, RefreshCw } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Metadata is now handled by layout.tsx

const ALGORITHMS = [
  { value: "sha-1", label: "SHA-1" },
  { value: "sha-256", label: "SHA-256" },
  { value: "sha-384", label: "SHA-384" },
  { value: "sha-512", label: "SHA-512" },
];

const SUBTLE_CRYPTO_ALGO_MAP: { [key: string]: string } = {
  "sha-1": "SHA-1",
  "sha-256": "SHA-256",
  "sha-384": "SHA-384",
  "sha-512": "SHA-512",
};

export default function HashGeneratorPage() {
  const [inputText, setInputText] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("sha-256");
  const [hashedOutput, setHashedOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const inputTextId = useId();
  const algorithmSelectId = useId();
  const errorMessageInputId = useId();
  const hashedOutputId = useId();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const handleGenerateHash = async () => {
    setIsLoading(true);
    setHashedOutput("");
    setError(null);

    if (!inputText) {
      setError("Input text cannot be empty.");
      setIsLoading(false);
      return;
    }

    const subtleAlgoName = SUBTLE_CRYPTO_ALGO_MAP[selectedAlgorithm];
    if (!subtleAlgoName || !window.crypto || !window.crypto.subtle) {
      setError(
        "SubtleCrypto API is not available in this browser or algorithm is not supported.",
      );
      setIsLoading(false);
      return;
    }
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);
      const hashBuffer = await window.crypto.subtle.digest(
        subtleAlgoName,
        data,
      );
      setHashedOutput(bufferToHex(hashBuffer));
    } catch (e: unknown) {
      let errorMessage = "Unknown error";
      if (e instanceof Error && typeof e.message === "string") {
        errorMessage = e.message;
      }
      setError(`Hashing error (${selectedAlgorithm}): ${errorMessage}`);
    }

    setIsLoading(false);
  };

  const handleCopyToClipboard = async () => {
    if (!hashedOutput) return;
    try {
      await navigator.clipboard.writeText(hashedOutput);
      toast({
        title: "Hash Copied!",
        description: "The generated hash has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy hash to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Hash Generator"
        description="Generate cryptographic hashes from your input text using various algorithms."
        icon={Fingerprint}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={inputTextId}>Input Text</Label>
            <Textarea
              ref={textareaRef}
              id={inputTextId}
              placeholder="Enter text to hash..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="font-code min-h-[100px] resize-none"
              style={{ overflowY: "hidden" }}
              aria-describedby={error ? errorMessageInputId : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={algorithmSelectId}>Select Algorithm</Label>
            <Select
              value={selectedAlgorithm}
              onValueChange={setSelectedAlgorithm}
            >
              <SelectTrigger
                id={algorithmSelectId}
                className="w-full sm:w-[280px]"
              >
                <SelectValue placeholder="Select an algorithm" />
              </SelectTrigger>
              <SelectContent>
                {ALGORITHMS.map((algo) => (
                  <SelectItem key={algo.value} value={algo.value}>
                    {algo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerateHash}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Generating..." : "Generate Hash"}
          </Button>

          {error && (
            <Alert variant="destructive" id={errorMessageInputId}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hashedOutput && !error && (
            <div className="space-y-2">
              <Label htmlFor={hashedOutputId}>
                Generated Hash ({selectedAlgorithm.toUpperCase()})
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id={hashedOutputId}
                  type="text"
                  value={hashedOutput}
                  readOnly
                  className="font-code bg-muted/50 grow"
                  aria-label="Generated hash"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyToClipboard}
                  aria-label="Copy hash"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
