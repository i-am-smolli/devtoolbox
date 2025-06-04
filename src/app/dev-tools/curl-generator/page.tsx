
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TerminalSquare, Copy, PlusCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];

interface Header {
  id: string;
  key: string;
  value: string;
}

export default function CurlGeneratorPage() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState(HTTP_METHODS[0]);
  const [requestBody, setRequestBody] = useState('');
  const [headers, setHeaders] = useState<Header[]>([]);
  const [curlCommand, setCurlCommand] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const requestBodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (requestBodyTextareaRef.current) {
      requestBodyTextareaRef.current.style.height = 'auto';
      requestBodyTextareaRef.current.style.height = `${requestBodyTextareaRef.current.scrollHeight}px`;
    }
  }, [requestBody]);

  const addHeader = () => {
    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '' }]);
  };

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  const generateCurlCommand = useCallback(() => {
    if (!url.trim()) {
      setCurlCommand('');
      setError(null); // Don't show URL error if field is empty, only on actual generation attempt or if it was previously invalid
      return;
    }
    try {
      new URL(url); // Basic validation
      setError(null);
    } catch (e) {
      setCurlCommand('');
      setError('Invalid URL format.');
      return;
    }

    let command = 'curl';

    if (method !== 'GET') {
      command += ` -X ${method}`;
    }

    headers.forEach(header => {
      if (header.key.trim()) {
        const escapedHeaderKey = header.key.trim().replace(/"/g, '\\"');
        const escapedHeaderValue = header.value.trim().replace(/"/g, '\\"');
        command += ` -H "${escapedHeaderKey}: ${escapedHeaderValue}"`;
      }
    });

    if (METHODS_WITH_BODY.includes(method) && requestBody.trim()) {
      const escapedBody = requestBody.replace(/'/g, "'\\''");
      command += ` -d '${escapedBody}'`;
    }

    command += ` "${url.trim().replace(/"/g, '\\"')}"`; // Escape double quotes in URL
    setCurlCommand(command);
  }, [url, method, headers, requestBody]);

  useEffect(() => {
    generateCurlCommand();
  }, [generateCurlCommand]);

  const handleCopyToClipboard = async () => {
    if (!curlCommand) return;
    try {
      await navigator.clipboard.writeText(curlCommand);
      toast({
        title: "cURL Command Copied!",
        description: "The generated command has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy command.",
        variant: "destructive",
      });
    }
  };
  
  const showRequestBody = METHODS_WITH_BODY.includes(method);

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="cURL Command Generator"
        description="Construct cURL commands with ease using a guided interface."
        icon={TerminalSquare}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Request Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="text"
              placeholder="https://api.example.com/data"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="method" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Headers</Label>
            {headers.map((header, index) => (
              <div key={header.id} className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder={`Name`}
                  value={header.key}
                  onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                  className="flex-grow"
                  aria-label={`Header ${index + 1} Name`}
                />
                <Input
                  type="text"
                  placeholder={`Value`}
                  value={header.value}
                  onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                  className="flex-grow"
                  aria-label={`Header ${index + 1} Value`}
                />
                <Button variant="ghost" size="icon" onClick={() => removeHeader(header.id)} aria-label="Remove header">
                  <XCircle className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addHeader}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Header
            </Button>
          </div>
          
          {showRequestBody && (
            <div className="space-y-2">
              <Label htmlFor="requestBody">Request Body</Label>
              <Textarea
                ref={requestBodyTextareaRef}
                id="requestBody"
                placeholder="Enter JSON, XML, or other payload..."
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="font-code min-h-[100px] resize-none"
                style={{ overflowY: 'hidden' }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {curlCommand && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Generated cURL Command</CardTitle>
          </CardHeader>
          <CardContent>
             <Textarea
              value={curlCommand}
              readOnly
              className="font-code bg-muted/50 min-h-[100px] max-h-[300px] resize-y"
              rows={3} // Initial small size, will grow with content due to resize-y and min/max height
             />
          </CardContent>
          <CardFooter>
            <Button onClick={handleCopyToClipboard} disabled={!curlCommand}>
              <Copy className="mr-2 h-4 w-4" /> Copy Command
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
