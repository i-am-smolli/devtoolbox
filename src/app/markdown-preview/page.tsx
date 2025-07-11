"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Metadata is now handled by layout.tsx

const initialMarkdown = `# Markdown Previewer

## Type your Markdown on the left...
### ...and see it rendered on the right!

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

export default function MarkdownPreviewPage() {
  const [markdownInput, setMarkdownInput] = useState(initialMarkdown);
  const [isClient, setIsClient] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Adjust textarea height based on content
  useEffect(() => {
    if (isClient && textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to recalculate
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isClient, markdownInput]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownInput(e.target.value);
    // Height adjustment is now handled by the useEffect listening to markdownInput
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Markdown Previewer"
        description="Write Markdown text and see the rendered HTML in real-time."
        icon={FileText}
      />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Markdown Input</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              ref={textareaRef}
              placeholder="Type your Markdown here..."
              value={markdownInput}
              onChange={handleTextareaChange}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm"
              aria-label="Markdown Input"
              style={{ overflowY: "hidden" }} // Hide scrollbar as height is dynamic
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">HTML Preview</CardTitle>
          </CardHeader>
          <CardContent className="grow p-0">
            {" "}
            {/* Allow content to grow */}
            <ScrollArea className="h-full w-full p-4">
              {" "}
              {/* ScrollArea takes full height */}
              {isClient ? (
                <div className="markdown-preview-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ src, alt, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) => {
                        const altText = alt || "";
                        if (
                          src &&
                          src.startsWith("https://placehold.co/")
                        ) {
                          return (
                            <img
                              src={src}
                              alt={altText}
                              data-ai-hint="abstract placeholder"
                              {...rest}
                            />
                          );
                        }
                        return <img src={src} alt={altText} {...rest} />;
                      },
                    }}
                  >
                    {markdownInput}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>Loading preview...</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
