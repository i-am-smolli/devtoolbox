
'use client';

import type { Metadata } from 'next';
import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LockKeyhole, Copy, AlertTriangle, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export const metadata: Metadata = {
  title: 'JWT Decoder - Online Tool',
  description: 'Decode JSON Web Tokens (JWT) to inspect their header and payload. Signature is NOT verified. Useful for debugging and understanding JWT structure.',
};

interface DecodedJwtPart {
  original: string;
  decoded: Record<string, any> | null;
  error?: string;
}

export default function JwtDecoderPage() {
  const [jwtInput, setJwtInput] = useState('');
  const [decodedHeader, setDecodedHeader] = useState<DecodedJwtPart | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<DecodedJwtPart | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [jwtInput]);

  const decodePart = (part: string): DecodedJwtPart => {
    try {
      let base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const padding = base64.length % 4;
      if (padding === 2) base64 += '==';
      else if (padding === 3) base64 += '=';
      
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const utf8DecodedString = new TextDecoder().decode(bytes);
      const jsonData = JSON.parse(utf8DecodedString);
      return { original: part, decoded: jsonData };
    } catch (e: any) {
      return { original: part, decoded: null, error: e.message || 'Invalid encoding or JSON format' };
    }
  };

  useEffect(() => {
    if (!jwtInput.trim()) {
      setDecodedHeader(null);
      setDecodedPayload(null);
      setParseError(null);
      return;
    }

    const parts = jwtInput.split('.');
    if (parts.length !== 3) {
      setParseError('Invalid JWT format: Token must have three parts separated by dots.');
      setDecodedHeader(null);
      setDecodedPayload(null);
      return;
    }

    setParseError(null);
    const headerResult = decodePart(parts[0]);
    const payloadResult = decodePart(parts[1]);

    setDecodedHeader(headerResult);
    setDecodedPayload(payloadResult);

    if (headerResult.error || payloadResult.error) {
        setParseError('Error decoding header or payload. Check individual parts for details.');
    }

  }, [jwtInput]);

  const handleCopyToClipboard = async (text: string | object | null, type: string) => {
    if (text === null || typeof text === 'undefined') return;
    const textToCopy = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: `${type} Copied!`,
        description: `The ${type.toLowerCase()} has been copied to your clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: `Could not copy ${type.toLowerCase()} to clipboard.`,
        variant: "destructive",
      });
    }
  };

  const renderDecodedPart = (part: DecodedJwtPart | null, title: string) => {
    if (!part) return null;
    if (part.error) {
      return (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error decoding {title.toLowerCase()}</AlertTitle>
          <AlertDescription>{part.error}</AlertDescription>
        </Alert>
      );
    }
    if (part.decoded) {
      return (
        <ScrollArea className="h-72 w-full rounded-md border p-4 bg-muted/30">
          <pre className="text-sm font-code whitespace-pre-wrap break-all">
            <code>{JSON.stringify(part.decoded, null, 2)}</code>
          </pre>
        </ScrollArea>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="JWT Decoder"
        description="Decode JSON Web Tokens to inspect their header and payload. Signature is NOT verified."
        icon={LockKeyhole}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">JWT Input</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            placeholder="Paste your JWT here..."
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            className="w-full resize-none border rounded-md focus-visible:ring-1 p-4 font-code text-sm min-h-[100px]"
            style={{ overflowY: 'hidden' }}
            aria-label="JWT Input"
          />
        </CardContent>
      </Card>

      {isClient && parseError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>JWT Parsing Error</AlertTitle>
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      {isClient && !parseError && (decodedHeader || decodedPayload) && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Decoded Token</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="default" className="mb-4 border-blue-500 text-blue-700 dark:text-blue-300">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-600 dark:text-blue-400">Signature Not Verified</AlertTitle>
              <AlertDescription>
                This tool only decodes the JWT. It does not verify the signature's authenticity.
                Do not trust the content of a JWT without verifying its signature.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="header" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="header" disabled={!decodedHeader?.decoded && !decodedHeader?.error}>Header</TabsTrigger>
                <TabsTrigger value="payload" disabled={!decodedPayload?.decoded && !decodedPayload?.error}>Payload</TabsTrigger>
              </TabsList>
              <TabsContent value="header" className="mt-4">
                <div className="space-y-2">
                  {renderDecodedPart(decodedHeader, "Header")}
                  {decodedHeader?.decoded && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopyToClipboard(decodedHeader.decoded, 'Header JSON')}
                      className="mt-2"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy Header JSON
                    </Button>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="payload" className="mt-4">
                 <div className="space-y-2">
                  {renderDecodedPart(decodedPayload, "Payload")}
                  {decodedPayload?.decoded && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopyToClipboard(decodedPayload.decoded, 'Payload JSON')}
                      className="mt-2"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy Payload JSON
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
       {isClient && !jwtInput.trim() && !parseError && !decodedHeader && !decodedPayload && (
        <Card>
            <CardContent className="p-6">
                <p className="text-muted-foreground">
                    Paste a JWT in the input area above to see its decoded header and payload.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
