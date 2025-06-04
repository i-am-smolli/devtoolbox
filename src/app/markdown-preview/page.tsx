
'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <div className="flex flex-col"> {/* Removed fixed height, now content-driven */}
      <PageHeader
        title="Markdown Previewer"
        description="Write Markdown text and see the rendered HTML in real-time."
        icon={FileText}
      />
      <div className="grid md:grid-cols-2 gap-6"> {/* Removed flex-grow and min-h-0 */}
        <Card className="flex flex-col"> {/* Removed min-h-0 */}
          <CardHeader>
            <CardTitle className="font-headline">Markdown Input</CardTitle>
          </CardHeader>
          <CardContent className="p-0"> {/* Removed flex-grow */}
            <Textarea
              placeholder="Type your Markdown here..."
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              className="min-h-[400px] w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm" // Removed h-full, added min-h-[400px]
              aria-label="Markdown Input"
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col"> {/* Removed min-h-0 */}
          <CardHeader>
            <CardTitle className="font-headline">HTML Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-0"> {/* Removed flex-grow */}
            <ScrollArea className="min-h-[400px] w-full p-4"> {/* Removed h-full, added min-h-[400px] */}
              {isClient ? (
                 <div className="markdown-preview-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({node, ...props}) => {
                          const altText = props.alt || '';
                          // eslint-disable-next-line @next/next/no-img-element
                          if (props.src && props.src.startsWith('https://placehold.co/')) {
                            // eslint-disable-next-line @next/next/no-img-element
                            return <img {...props} alt={altText} data-ai-hint="abstract placeholder" />;
                          }
                          // eslint-disable-next-line @next/next/no-img-element
                          return <img {...props} alt={altText} />;
                        }
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
