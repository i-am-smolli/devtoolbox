"use client";
import { AlertCircle, Copy, Shuffle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BASE32_LOOKUP: { [key: string]: number } = Object.fromEntries(
  Array.from(BASE32_CHARS).map((char, index) => [char, index]),
);

// Base32 Encoding
function encodeBase32(data: Uint8Array): string {
  let result = "";
  let bits = 0;
  let bitLength = 0;

  for (let i = 0; i < data.length; i++) {
    bits = (bits << 8) | data[i];
    bitLength += 8;

    while (bitLength >= 5) {
      const index = (bits >>> (bitLength - 5)) & 31;
      result += BASE32_CHARS[index];
      bitLength -= 5;
    }
  }

  if (bitLength > 0) {
    const index = (bits << (5 - bitLength)) & 31;
    result += BASE32_CHARS[index];
  }

  // Add padding
  const padding = 8 - (result.length % 8);
  if (padding !== 8) {
    result += "=".repeat(padding);
  }

  return result;
}

// Base32 Decoding
function decodeBase32(str: string): Uint8Array {
  const upperStr = str.toUpperCase().replace(/=+$/, "");
  const bytes: number[] = [];
  let bits = 0;
  let bitLength = 0;

  for (let i = 0; i < upperStr.length; i++) {
    const char = upperStr[i];
    if (BASE32_LOOKUP[char] === undefined) {
      throw new Error(`Invalid Base32 character: "${char}"`);
    }
    const value = BASE32_LOOKUP[char];
    bits = (bits << 5) | value;
    bitLength += 5;

    if (bitLength >= 8) {
      bytes.push((bits >>> (bitLength - 8)) & 255);
      bitLength -= 8;
    }
  }

  return new Uint8Array(bytes);
}

export default function Base32ConverterPage() {
  const [plainText, setPlainText] = useState("");
  const [base32Text, setBase32Text] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const plainTextRef = useRef<HTMLTextAreaElement>(null);
  const base32TextRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(
    (textareaRef: React.RefObject<HTMLTextAreaElement | null>) => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    },
    [],
  );

  useEffect(() => adjustTextareaHeight(plainTextRef), [
    adjustTextareaHeight,
  ]);
  useEffect(() => adjustTextareaHeight(base32TextRef), [
    adjustTextareaHeight,
  ]);

  const handleEncode = () => {
    setError(null);
    if (!plainText.trim()) {
      setBase32Text("");
      return;
    }
    try {
      const encoder = new TextEncoder();
      const encodedBytes = encoder.encode(plainText);
      setBase32Text(encodeBase32(encodedBytes));
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Could not encode text.";
      setError(`Encoding Error: ${message}`);
      setBase32Text("");
    }
  };

  const handleDecode = () => {
    setError(null);
    if (!base32Text.trim()) {
      setPlainText("");
      return;
    }
    try {
      const decodedBytes = decodeBase32(base32Text);
      const decoder = new TextDecoder();
      setPlainText(decoder.decode(decodedBytes));
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : "Invalid Base32 string or decoding failed.";
      setError(`Decoding Error: ${message}`);
      setPlainText("");
    }
  };

  const handleCopyToClipboard = async (
    text: string,
    type: "Plain Text" | "Base32",
  ) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${type} Copied!`,
        description: `The ${type.toLowerCase()} has been copied to your clipboard.`,
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: `Could not copy ${type.toLowerCase()} to clipboard.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Base32 Encoder / Decoder"
        description="Encode text to Base32 or decode Base32 back to text. Handles UTF-8 characters."
        icon={Shuffle}
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Plain Text</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              ref={plainTextRef}
              placeholder="Enter plain text here..."
              value={plainText}
              onChange={(e) => {
                setPlainText(e.target.value);
                if (error) setError(null);
              }}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[150px]"
              aria-label="Plain Text Input"
              style={{ overflowY: "hidden" }}
            />
          </CardContent>
          <CardFooter className="p-4 flex flex-col sm:flex-row gap-2 items-stretch">
            <Button onClick={handleEncode} className="w-full sm:w-auto">
              Encode to Base32
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyToClipboard(plainText, "Plain Text")}
              aria-label="Copy plain text"
              disabled={!plainText}
              className="sm:w-auto"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Base32</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              ref={base32TextRef}
              placeholder="Enter Base32 text here or see encoded output..."
              value={base32Text}
              onChange={(e) => {
                setBase32Text(e.target.value);
                if (error) setError(null);
              }}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[150px]"
              aria-label="Base32 Text Input/Output"
              style={{ overflowY: "hidden" }}
            />
          </CardContent>
          <CardFooter className="p-4 flex flex-col sm:flex-row gap-2 items-stretch">
            <Button onClick={handleDecode} className="w-full sm:w-auto">
              Decode from Base32
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyToClipboard(base32Text, "Base32")}
              aria-label="Copy Base32 text"
              disabled={!base32Text}
              className="sm:w-auto"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
