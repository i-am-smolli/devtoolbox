"use client";

import { AlertCircle, Copy, Link as LinkIcon } from "lucide-react";
import type React from "react";
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

// Metadata is now handled by layout.tsx

export default function UrlEncoderDecoderPage() {
  const [plainText, setPlainText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const plainTextRef = useRef<HTMLTextAreaElement>(null);
  const encodedTextRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(
    (textareaRef: React.RefObject<HTMLTextAreaElement | null>) => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    },
    [],
  );

  useEffect(() => adjustTextareaHeight(plainTextRef), [adjustTextareaHeight]);
  useEffect(() => adjustTextareaHeight(encodedTextRef), [adjustTextareaHeight]);

  const handleEncode = () => {
    setError(null);
    if (!plainText.trim()) {
      setEncodedText("");
      if (error) setError(null);
      return;
    }
    try {
      setEncodedText(encodeURIComponent(plainText));
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? (e as { message?: string }).message
          : undefined;
      setError(`Encoding Error: ${message || "Could not encode text."}`);
      setEncodedText("");
    }
  };

  const handleDecode = () => {
    setError(null);
    if (!encodedText.trim()) {
      setPlainText("");
      if (error) setError(null);
      return;
    }
    try {
      setPlainText(decodeURIComponent(encodedText));
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? (e as { message?: string }).message
          : undefined;
      setError(
        `Decoding Error: ${message || "Invalid URL-encoded string or decoding failed."}`,
      );
      setPlainText("");
    }
  };

  const handleCopyToClipboard = async (
    text: string,
    type: "Plain Text" | "Encoded URL",
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
        title="URL Encoder / Decoder"
        description="Encode strings to be URL-safe or decode URL-encoded strings."
        icon={LinkIcon}
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plain Text Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Plain String</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              ref={plainTextRef}
              placeholder="Enter plain string here..."
              value={plainText}
              onChange={(e) => {
                setPlainText(e.target.value);
                if (error) setError(null);
              }}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[150px]"
              aria-label="Plain String Input"
              style={{ overflowY: "hidden" }}
            />
          </CardContent>
          <CardFooter className="p-4 flex flex-col sm:flex-row gap-2 items-stretch">
            <Button onClick={handleEncode} className="w-full sm:grow">
              Encode URL
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyToClipboard(plainText, "Plain Text")}
              aria-label="Copy plain string"
              disabled={!plainText}
              className="sm:w-auto"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Encoded Text Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">URL-Encoded String</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              ref={encodedTextRef}
              placeholder="Enter URL-encoded string here or see encoded output..."
              value={encodedText}
              onChange={(e) => {
                setEncodedText(e.target.value);
                if (error) setError(null);
              }}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[150px]"
              aria-label="URL-Encoded String Input/Output"
              style={{ overflowY: "hidden" }}
            />
          </CardContent>
          <CardFooter className="p-4 flex flex-col sm:flex-row gap-2 items-stretch">
            <Button onClick={handleDecode} className="w-full sm:grow">
              Decode URL
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyToClipboard(encodedText, "Encoded URL")}
              aria-label="Copy URL-encoded string"
              disabled={!encodedText}
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
