
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
import 'diff2html/bundles/css/diff2html.min.css';

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
    setIsIdentical(false); // Default to not identical if we proceed further

    // Scenario 1: Texts are exactly identical
    if (textA === textB) {
      setIsIdentical(true);
      setIsLoading(false);
      return;
    }

    // At this point, we know textA !== textB. So, isIdentical remains false.
    // Proceed to generate a patch and visualize it.
    try {
      const patch = Diff.createPatch('text-a.txt', 'text-b.txt', textA, textB, '', '', { context: 3 });
      
      // A patch always has headers. We need to check if it has actual change hunks.
      // Hunks start with "@@ [...] @@".
      if (!patch.includes('@@')) {
        // No actual line changes according to createPatch/diffLines.
        // Since textA !== textB was true, the differences are subtle (e.g. trailing whitespace, different line endings).
        setError("Texts have subtle differences (e.g., changes in whitespace that don't alter line structure, or different line endings) that are not represented as line changes in this visual diff. The texts are not strictly identical.");
        // isIdentical is already false. No visual diff from diff2html here.
        setDiffOutputHtml(null); 
      } else {
        // Patch has hunks, so try to render them.
        const htmlOutput = diff2Html(patch, {
          drawFileList: false,
          matching: 'lines', 
          outputFormat: 'side-by-side',
        });

        // Ensure diff2html produced a table, meaning it rendered hunks.
        if (htmlOutput && htmlOutput.includes('<table') && htmlOutput.includes('d2h-diff-table')) {
          setDiffOutputHtml(htmlOutput);
          // isIdentical remains false as we are showing differences.
        } else {
          // Patch had hunks, but diff2html didn't produce a usable table.
          // This case should be rare if patch.includes('@@') was true.
          setError("Differences were detected, but the visual diff could not be generated successfully. Please check the text content for unusual characters or structures.");
          setDiffOutputHtml(null);
          // isIdentical remains false.
        }
      }
    } catch (e: any) {
      console.error("Diff generation error:", e);
      setError(`Error generating diff: ${e.message || 'Unknown error'}`);
      setDiffOutputHtml(null);
      // isIdentical remains false.
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
          <AlertTitle>Comparison Result</AlertTitle>
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
