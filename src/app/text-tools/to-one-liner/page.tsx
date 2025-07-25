"use client";

import { Copy, Minimize2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
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

// Metadata is now handled by layout.tsx

export default function ToOneLinerPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const { toast } = useToast();

  const inputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = React.useCallback(
    (ref: React.RefObject<HTMLTextAreaElement | null>) => {
      if (ref.current) {
        ref.current.style.height = "auto";
        ref.current.style.height = `${ref.current.scrollHeight}px`;
      }
    },
    [],
  );

  useEffect(
    () => adjustTextareaHeight(inputTextareaRef),
    [adjustTextareaHeight],
  );
  useEffect(
    () => adjustTextareaHeight(outputTextareaRef),
    [adjustTextareaHeight],
  );

  const handleConvertToOneLine = () => {
    if (!inputText.trim()) {
      setOutputText("");
      return;
    }
    // Replace all types of newlines (LF, CRLF, CR) with a single space,
    // then condense multiple spaces (including those just introduced) into a single space,
    // and finally trim leading/trailing whitespace.
    const oneLiner = inputText
      .replace(/(\r\n|\n|\r)/gm, " ")
      .replace(/\s+/g, " ")
      .trim();
    setOutputText(oneLiner);
  };

  const handleCopyToClipboard = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Output Copied!",
        description: "The single-line text has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy text. Error:",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="To One Liner"
        description="Convert multi-line text into a single continuous line."
        icon={Minimize2}
      />

      <div className="flex flex-col gap-6">
        {" "}
        {/* Changed from grid md:grid-cols-2 */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Input Text</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              ref={inputTextareaRef}
              placeholder="Paste your multi-line text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[150px]"
              style={{ overflowY: "hidden" }}
              aria-label="Input text to convert to one line"
            />
          </CardContent>
          <CardFooter className="p-4">
            <Button
              onClick={handleConvertToOneLine}
              className="w-full sm:w-auto"
            >
              Convert to One Line
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Output (One Line)</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            <Textarea
              ref={outputTextareaRef}
              value={outputText}
              readOnly
              placeholder="Single-line text will appear here..."
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm bg-muted/50 min-h-[150px]"
              style={{ overflowY: "hidden" }}
              aria-label="Single-line output text"
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
    </div>
  );
}
