"use client";

// Removed: import type { Metadata } from 'next';
import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
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
import { BookText, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

// Metadata is now handled by layout.tsx

const initialMarkdown = `# Markdown to HTML Converter

## Type your Markdown on the left...
### ...and see the generated HTML on the right!

- Lists are easy
- Just like this one

1. Ordered lists too
2. Simple!

> Blockquotes are great for quoting text.

\`\`\`javascript
// Code blocks are supported
function greet(name) {
  return "Hello, " + name + "!";
}
\`\`\`

You can also use \`inline code\`.

[Visit Google](https://www.google.com)

![Placeholder Image](https://placehold.co/300x200.png)
`;

export default function MarkdownToHtmlPage() {
  const [markdownInput, setMarkdownInput] = useState(initialMarkdown);
  const [htmlOutput, setHtmlOutput] = useState("");
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const markdownTextareaRef = useRef<HTMLTextAreaElement>(null);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsClient(true);
    // Initial conversion on load
    if (initialMarkdown) {
      handleConvertToHtml(initialMarkdown);
    }
  }, []);

  const adjustTextareaHeight = (
    textareaRef: React.RefObject<HTMLTextAreaElement>,
  ) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isClient) adjustTextareaHeight(markdownTextareaRef);
  }, [isClient, markdownInput]);

  useEffect(() => {
    if (isClient) adjustTextareaHeight(htmlTextareaRef);
  }, [isClient, htmlOutput]);

  const handleMarkdownInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setMarkdownInput(e.target.value);
  };

  const handleConvertToHtml = async (currentMarkdown: string) => {
    if (!currentMarkdown.trim()) {
      setHtmlOutput("");
      return;
    }
    try {
      const rawHtml = await marked.parse(currentMarkdown);
      setHtmlOutput(rawHtml);
    } catch {
      setHtmlOutput("Error converting Markdown to HTML.");
      toast({
        title: "Conversion Error",
        description: "Could not convert Markdown to HTML.",
        variant: "destructive",
      });
    }
  };

  const handleCopyHtml = async () => {
    if (!htmlOutput) return;
    try {
      await navigator.clipboard.writeText(htmlOutput);
      toast({
        title: "HTML Copied!",
        description: "The generated HTML has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy HTML to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Markdown to HTML Converter"
        description="Convert your Markdown text into raw HTML."
        icon={BookText}
      />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Markdown Input</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <Textarea
              ref={markdownTextareaRef}
              placeholder="Type your Markdown here..."
              value={markdownInput}
              onChange={handleMarkdownInputChange}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[200px]"
              aria-label="Markdown Input"
              style={{ overflowY: "hidden" }}
            />
          </CardContent>
          <CardFooter className="p-4">
            <Button
              onClick={() => handleConvertToHtml(markdownInput)}
              className="w-full sm:w-auto"
            >
              Convert to HTML
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">HTML Output</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <ScrollArea className="h-full w-full">
              <Textarea
                ref={htmlTextareaRef}
                placeholder="Generated HTML will appear here..."
                value={htmlOutput}
                readOnly
                className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm bg-muted/50 min-h-[200px]"
                aria-label="HTML Output"
                style={{ overflowY: "hidden" }}
              />
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4">
            <Button
              variant="outline"
              onClick={handleCopyHtml}
              disabled={!htmlOutput}
              className="w-full sm:w-auto"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy HTML
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
