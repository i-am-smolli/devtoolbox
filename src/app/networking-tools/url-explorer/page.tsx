
'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SearchCode, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
// Removed Input as it's no longer used for displaying parsed details here.

interface ParsedUrlDetails {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  queryParams: { key: string; value: string }[];
}

const initialUrl = 'https://www.example.com/path/to/very/very/long/page/name/that/might/overflow/or/cause/issues/with/layout?name=DevToolbox&version=1.0&features=explorer&features=parser&another_long_query_parameter_key=with_an_equally_long_and_descriptive_value_to_test_wrapping_behavior#section-details-that-could-also-be-quite-long-and-test-the-limits-of-the-display-area';

export default function UrlExplorerPage() {
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [parsedDetails, setParsedDetails] = useState<ParsedUrlDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsClient(true);
    if (urlInput) {
      handleParseUrl(urlInput);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount with initial URL

  useEffect(() => {
    if (isClient && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isClient, urlInput]);

  const handleParseUrl = (currentInput: string) => {
    if (!currentInput.trim()) {
      setParsedDetails(null);
      setError(null);
      return;
    }
    try {
      const url = new URL(currentInput);
      const queryParams: { key: string; value: string }[] = [];
      url.searchParams.forEach((value, key) => {
        queryParams.push({ key, value });
      });

      setParsedDetails({
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        queryParams,
      });
      setError(null);
    } catch (e: any) {
      setParsedDetails(null);
      setError(e.message || 'Invalid URL format. Please enter a full URL including protocol (e.g., https://).');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setUrlInput(newText);
    handleParseUrl(newText);
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="URL Explorer"
        description="Paste a URL to break it down into its constituent parts: protocol, host, path, query parameters, and hash."
        icon={SearchCode}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">URL Input</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            placeholder="e.g., https://example.com/path?param1=value1&param2=value2#hash"
            value={urlInput}
            onChange={handleInputChange}
            className="w-full resize-none border rounded-md focus-visible:ring-1 p-4 font-code text-sm min-h-[100px]"
            aria-label="URL Input"
            aria-invalid={!!error}
            aria-describedby={error ? "url-error-message" : undefined}
            style={{ overflowY: 'hidden' }}
          />
        </CardContent>
      </Card>

      {isClient && error && (
        <Alert variant="destructive" id="url-error-message">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid URL</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isClient && parsedDetails && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">URL Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {(Object.keys(parsedDetails) as Array<keyof ParsedUrlDetails>)
                .filter(key => key !== 'queryParams' && key !== 'search') // search is part of queryParams table
                .map(key => (
                parsedDetails[key] ? (
                  <div key={key} className="space-y-1">
                    <Label className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').trim()}:</Label>
                    <div 
                      className="flex h-auto min-h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-base font-code break-all md:text-sm"
                      aria-label={`${key} value`}
                    >
                      {parsedDetails[key] as string}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
            
            {parsedDetails.queryParams.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-md font-semibold">Query Parameters</h3>
                <ScrollArea className="border rounded-md max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Key</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedDetails.queryParams.map((param, index) => (
                        <TableRow key={`${param.key}-${index}`}>
                          <TableCell className="font-code break-all">{param.key}</TableCell>
                          <TableCell className="font-code break-all">{param.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            )}
             {parsedDetails.queryParams.length === 0 && parsedDetails.search === '' && (
                <p className="text-muted-foreground text-sm pt-2">No query parameters found.</p>
             )}
          </CardContent>
        </Card>
      )}
      {isClient && !parsedDetails && !error && !urlInput.trim() && (
        <p className="text-muted-foreground">
          Paste a URL in the input area to explore its components.
        </p>
      )}
    </div>
  );
}
