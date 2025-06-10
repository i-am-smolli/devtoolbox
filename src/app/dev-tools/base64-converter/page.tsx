
'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shuffle, Copy, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function Base64ConverterPage() {
  const [plainText, setPlainText] = useState('');
  const [base64Text, setBase64Text] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const plainTextRef = useRef<HTMLTextAreaElement>(null);
  const base64TextRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => adjustTextareaHeight(plainTextRef), [plainText]);
  useEffect(() => adjustTextareaHeight(base64TextRef), [base64Text]);

  const handleEncode = () => {
    setError(null);
    if (!plainText.trim()) {
      setBase64Text('');
      // Clear error if input is empty as well
      if(error) setError(null);
      return;
    }
    try {
      const encoder = new TextEncoder();
      const encodedBytes = encoder.encode(plainText);
      // Convert Uint8Array to binary string for btoa
      let binaryString = '';
      encodedBytes.forEach((byte) => {
        binaryString += String.fromCharCode(byte);
      });
      setBase64Text(btoa(binaryString));
    } catch (e: any) {
      setError(`Encoding Error: ${e.message || 'Could not encode text.'}`);
      setBase64Text('');
    }
  };

  const handleDecode = () => {
    setError(null);
    if (!base64Text.trim()) {
      setPlainText('');
      // Clear error if input is empty as well
      if(error) setError(null);
      return;
    }
    try {
      const binaryString = atob(base64Text);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder(); // Defaults to 'utf-8'
      setPlainText(decoder.decode(bytes));
    } catch (e: any) {
      setError(`Decoding Error: ${e.message || 'Invalid Base64 string or decoding failed.'}`);
      setPlainText('');
    }
  };

  const handleCopyToClipboard = async (text: string, type: 'Plain Text' | 'Base64') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
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

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Base64 Encoder / Decoder"
        description="Encode text to Base64 or decode Base64 back to text. Handles UTF-8 characters."
        icon={Shuffle}
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6"> {/* Changed md:grid-cols-2 to grid-cols-1 */}
        {/* Plain Text Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Plain Text</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <Textarea
              ref={plainTextRef}
              placeholder="Enter plain text here..."
              value={plainText}
              onChange={(e) => { setPlainText(e.target.value); if(error) setError(null); }}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[150px]"
              aria-label="Plain Text Input"
              style={{ overflowY: 'hidden' }}
            />
          </CardContent>
          <CardFooter className="p-4 flex flex-col sm:flex-row gap-2 items-stretch">
            <Button onClick={handleEncode} className="w-full sm:w-auto">Encode to Base64</Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyToClipboard(plainText, 'Plain Text')}
              aria-label="Copy plain text"
              disabled={!plainText}
              className="sm:w-auto"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Base64 Text Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Base64</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <Textarea
              ref={base64TextRef}
              placeholder="Enter Base64 text here or see encoded output..."
              value={base64Text}
              onChange={(e) => { setBase64Text(e.target.value); if(error) setError(null); }}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[150px]"
              aria-label="Base64 Text Input/Output"
              style={{ overflowY: 'hidden' }}
            />
          </CardContent>
          <CardFooter className="p-4 flex flex-col sm:flex-row gap-2 items-stretch">
            <Button onClick={handleDecode} className="w-full sm:w-auto">Decode from Base64</Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyToClipboard(base64Text, 'Base64')}
              aria-label="Copy Base64 text"
              disabled={!base64Text}
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
