
'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GitCompareArrows, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import * as Diff from 'diff';
import { html as diff2Html } from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css'; // Ensure this is handled correctly by your bundler or globals.css

export default function TextDiffPage() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [diffOutputHtml, setDiffOutputHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIdentical, setIsIdentical] = useState(false);

  const textARef = useRef<HTMLTextAreaElement>(null);
  const textBRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => adjustTextareaHeight(textARef), [textA]);
  useEffect(() => adjustTextareaHeight(textBRef), [textB]);

  const handleCompare = () => {
    setIsLoading(true);
    setError(null);
    setDiffOutputHtml(null);
    setIsIdentical(false);

    if (!textA.trim() && !textB.trim()) {
        setError("Please enter text in at least one of the fields to compare.");
        setIsLoading(false);
        return;
    }
    
    if (textA === textB) {
      setIsIdentical(true);
      setIsLoading(false);
      return;
    }

    // Determine if there are actual line differences using diffLines
    const lineChanges = Diff.diffLines(textA, textB, { newlineIsToken: true }); // Explicitly treat newlines as tokens
    const hasActualLineDifferences = lineChanges.some(part => part.added || part.removed);

    if (!hasActualLineDifferences) {
      // If diffLines finds no added/removed lines, treat as identical for display
      setIsIdentical(true);
      setIsLoading(false);
      return;
    }

    // If we reach here, diffLines found differences, so proceed to generate and show the patch
    try {
      const patch = Diff.createPatch('text-a.txt', 'text-b.txt', textA, textB, '', '', { context: 3 });
      
      const htmlOutput = diff2Html(patch, {
        drawFileList: false,
        matching: 'lines',
        outputFormat: 'side-by-side',
        // renderNothingWhenEmpty option removed, using default (false)
      });

      if (!htmlOutput || !htmlOutput.trim()) {
        // This case means diffLines found differences, but diff2html produced no visual output.
        setError("Differences were detected, but they could not be visualized. This can happen with certain types of whitespace changes or very subtle differences not captured by the line-diff display.");
        setDiffOutputHtml(null);
      } else {
        setDiffOutputHtml(htmlOutput);
      }
    } catch (e: any) {
      console.error("Diff generation error:", e);
      setError(`Error generating diff: ${e.message || 'Unknown error'}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="Text Diff Checker"
        description="Compare two blocks of text and highlight the differences. Uses a side-by-side view."
        icon={GitCompareArrows}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Original Text (A)</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <Textarea
              ref={textARef}
              placeholder="Paste the first block of text here..."
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[200px]"
              style={{ overflowY: 'hidden' }}
              aria-label="Original text input"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Changed Text (B)</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <Textarea
              ref={textBRef}
              placeholder="Paste the second block of text here..."
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[200px]"
              style={{ overflowY: 'hidden' }}
              aria-label="Changed text input"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleCompare} disabled={isLoading} size="lg">
          {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Comparing...' : 'Compare Texts'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isIdentical && !error && (
        <Alert variant="default" className="border-green-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-600 dark:text-green-400">Texts are Identical</AlertTitle>
          <AlertDescription>No differences were found between the two texts.</AlertDescription>
        </Alert>
      )}

      {!isIdentical && !error && diffOutputHtml && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Differences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="diff2html-wrapper overflow-x-auto">
              <div dangerouslySetInnerHTML={{ __html: diffOutputHtml }} />
            </div>
          </CardContent>
        </Card>
      )}
      
      {!isLoading && !error && !diffOutputHtml && !isIdentical && (
         <Card>
            <CardContent className="p-6">
                <p className="text-muted-foreground text-center">
                    Enter text in both fields and click "Compare Texts" to see the differences.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
