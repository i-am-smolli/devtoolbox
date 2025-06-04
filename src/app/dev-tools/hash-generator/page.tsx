
'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Fingerprint, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Standard MD5 JS implementation (UTF-8 string input)
function md5(str: string): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function convertToWordArray(str: string): number[] {
    const lWordCount = (((str.length + 8) >>> 6) + 1) * 16;
    const wordArray = Array(lWordCount - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    for (let i = 0; i < str.length; i++) {
      lByteCount = str.charCodeAt(i);
      if (lByteCount < 0x80) {
        wordArray[lBytePosition++] = lByteCount;
      } else if (lByteCount < 0x800) {
        wordArray[lBytePosition++] = (lByteCount >> 6) | 0xC0;
        wordArray[lBytePosition++] = (lByteCount & 0x3F) | 0x80;
      } else if (lByteCount < 0xD800 || lByteCount >= 0xE000) {
        wordArray[lBytePosition++] = (lByteCount >> 12) | 0xE0;
        wordArray[lBytePosition++] = ((lByteCount >> 6) & 0x3F) | 0x80;
        wordArray[lBytePosition++] = (lByteCount & 0x3F) | 0x80;
      } else { // UTF-16 surrogate pair
        lByteCount = 0x10000 + (((lByteCount & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF));
        wordArray[lBytePosition++] = (lByteCount >> 18) | 0xF0;
        wordArray[lBytePosition++] = ((lByteCount >> 12) & 0x3F) | 0x80;
        wordArray[lBytePosition++] = ((lByteCount >> 6) & 0x3F) | 0x80;
        wordArray[lBytePosition++] = (lByteCount & 0x3F) | 0x80;
      }
    }

    const lByteLength = lBytePosition;
    wordArray[lBytePosition] = 0x80; // Append padding
    if (lBytePosition % 4 !== 0) {
      lBytePosition += (4 - (lBytePosition % 4));
    }

    const result = [];
    for (let k=0; k < lBytePosition; k+=4) {
      result.push((wordArray[k] << 24) | (wordArray[k+1] << 16) | (wordArray[k+2] << 8) | wordArray[k+3]);
    }

    const finalWords = Array(((lByteLength + 8) >>> 6) * 16 + 15);
    for (let i = 0; i < result.length; i++) {
      finalWords[i] = result[i];
    }

    finalWords[lByteLength >>> 2] |= 0x80 << (24 - (lByteLength % 4) * 8);
    finalWords[(((lByteLength + 8) >>> 6) * 16 + 14)] = lByteLength << 3; // Original length in bits

    return finalWords;
  }


  function wordToHex(lValue: number): string {
    let wordToHexValue = "",
      wordToHexValue_temp = "",
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = "0" + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  }

  let x = convertToWordArray(str);
  let a = 0x67452301;
  let b = 0xEFCDAB89;
  let c = 0x98BADCFE;
  let d = 0x10325476;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, x[i + 0], 7, 0xD76AA478);
    d = md5ff(d, a, b, c, x[i + 1], 12, 0xE8C7B756);
    c = md5ff(c, d, a, b, x[i + 2], 17, 0x242070DB);
    b = md5ff(b, c, d, a, x[i + 3], 22, 0xC1BDCEEE);
    a = md5ff(a, b, c, d, x[i + 4], 7, 0xF57C0FAF);
    d = md5ff(d, a, b, c, x[i + 5], 12, 0x4787C62A);
    c = md5ff(c, d, a, b, x[i + 6], 17, 0xA8304613);
    b = md5ff(b, c, d, a, x[i + 7], 22, 0xFD469501);
    a = md5ff(a, b, c, d, x[i + 8], 7, 0x698098D8);
    d = md5ff(d, a, b, c, x[i + 9], 12, 0x8B44F7AF);
    c = md5ff(c, d, a, b, x[i + 10], 17, 0xFFFF5BB1);
    b = md5ff(b, c, d, a, x[i + 11], 22, 0x895CD7BE);
    a = md5ff(a, b, c, d, x[i + 12], 7, 0x6B901122);
    d = md5ff(d, a, b, c, x[i + 13], 12, 0xFD987193);
    c = md5ff(c, d, a, b, x[i + 14], 17, 0xA679438E);
    b = md5ff(b, c, d, a, x[i + 15], 22, 0x49B40821);

    a = md5gg(a, b, c, d, x[i + 1], 5, 0xF61E2562);
    d = md5gg(d, a, b, c, x[i + 6], 9, 0xC040B340);
    c = md5gg(c, d, a, b, x[i + 11], 14, 0x265E5A51);
    b = md5gg(b, c, d, a, x[i + 0], 20, 0xE9B6C7AA);
    a = md5gg(a, b, c, d, x[i + 5], 5, 0xD62F105D);
    d = md5gg(d, a, b, c, x[i + 10], 9, 0x02441453);
    c = md5gg(c, d, a, b, x[i + 15], 14, 0xD8A1E681);
    b = md5gg(b, c, d, a, x[i + 4], 20, 0xE7D3FBC8);
    a = md5gg(a, b, c, d, x[i + 9], 5, 0x21E1CDE6);
    d = md5gg(d, a, b, c, x[i + 14], 9, 0xC33707D6);
    c = md5gg(c, d, a, b, x[i + 3], 14, 0xF4D50D87);
    b = md5gg(b, c, d, a, x[i + 8], 20, 0x455A14ED);
    a = md5gg(a, b, c, d, x[i + 13], 5, 0xA9E3E905);
    d = md5gg(d, a, b, c, x[i + 2], 9, 0xFCEFA3F8);
    c = md5gg(c, d, a, b, x[i + 7], 14, 0x676F02D9);
    b = md5gg(b, c, d, a, x[i + 12], 20, 0x8D2A4C8A);

    a = md5hh(a, b, c, d, x[i + 5], 4, 0xFFFA3942);
    d = md5hh(d, a, b, c, x[i + 8], 11, 0x8771F681);
    c = md5hh(c, d, a, b, x[i + 11], 16, 0x6D9D6122);
    b = md5hh(b, c, d, a, x[i + 14], 23, 0xFDE5380C);
    a = md5hh(a, b, c, d, x[i + 1], 4, 0xA4BEEA44);
    d = md5hh(d, a, b, c, x[i + 4], 11, 0x4BDECFA9);
    c = md5hh(c, d, a, b, x[i + 7], 16, 0xF6BB4B60);
    b = md5hh(b, c, d, a, x[i + 10], 23, 0xBEBFBC70);
    a = md5hh(a, b, c, d, x[i + 13], 4, 0x289B7EC6);
    d = md5hh(d, a, b, c, x[i + 0], 11, 0xEAA127FA);
    c = md5hh(c, d, a, b, x[i + 3], 16, 0xD4EF3085);
    b = md5hh(b, c, d, a, x[i + 6], 23, 0x04881D05);
    a = md5hh(a, b, c, d, x[i + 9], 4, 0xD9D4D039);
    d = md5hh(d, a, b, c, x[i + 12], 11, 0xE6DB99E5);
    c = md5hh(c, d, a, b, x[i + 15], 16, 0x1FA27CF8);
    b = md5hh(b, c, d, a, x[i + 2], 23, 0xC4AC5665);

    a = md5ii(a, b, c, d, x[i + 0], 6, 0xF4292244);
    d = md5ii(d, a, b, c, x[i + 7], 10, 0x432AFF97);
    c = md5ii(c, d, a, b, x[i + 14], 15, 0xAB9423A7);
    b = md5ii(b, c, d, a, x[i + 5], 21, 0xFC93A039);
    a = md5ii(a, b, c, d, x[i + 12], 6, 0x655B59C3);
    d = md5ii(d, a, b, c, x[i + 3], 10, 0x8F0CCC92);
    c = md5ii(c, d, a, b, x[i + 10], 15, 0xFFEFF47D);
    b = md5ii(b, c, d, a, x[i + 1], 21, 0x85845DD1);
    a = md5ii(a, b, c, d, x[i + 8], 6, 0x6FA87E4F);
    d = md5ii(d, a, b, c, x[i + 15], 10, 0xFE2CE6E0);
    c = md5ii(c, d, a, b, x[i + 6], 15, 0xA3014314);
    b = md5ii(b, c, d, a, x[i + 13], 21, 0x4E0811A1);
    a = md5ii(a, b, c, d, x[i + 4], 6, 0xF7537E82);
    d = md5ii(d, a, b, c, x[i + 11], 10, 0xBD3AF235);
    c = md5ii(c, d, a, b, x[i + 2], 15, 0x2AD7D2BB);
    b = md5ii(b, c, d, a, x[i + 9], 21, 0xEB86D391);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

const ALGORITHMS = [
  { value: 'md5', label: 'MD5' },
  { value: 'sha-1', label: 'SHA-1' },
  { value: 'sha-224', label: 'SHA-224' },
  { value: 'sha-256', label: 'SHA-256' },
  { value: 'sha-384', label: 'SHA-384' },
  { value: 'sha-512', label: 'SHA-512' },
];

const SUBTLE_CRYPTO_ALGO_MAP: { [key: string]: string } = {
  'sha-1': 'SHA-1',
  'sha-224': 'SHA-224',
  'sha-256': 'SHA-256',
  'sha-384': 'SHA-384',
  'sha-512': 'SHA-512',
};

export default function HashGeneratorPage() {
  const [inputText, setInputText] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('sha-256');
  const [hashedOutput, setHashedOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  const handleGenerateHash = async () => {
    setIsLoading(true);
    setHashedOutput('');
    setError(null);

    if (!inputText) {
      setError('Input text cannot be empty.');
      setIsLoading(false);
      return;
    }

    if (selectedAlgorithm === 'md5') {
      try {
        const hash = md5(inputText);
        setHashedOutput(hash);
      } catch (e: any) {
        setError(`MD5 hashing error: ${e.message || 'Unknown error'}`);
      }
    } else {
      const subtleAlgoName = SUBTLE_CRYPTO_ALGO_MAP[selectedAlgorithm];
      if (!subtleAlgoName || !window.crypto || !window.crypto.subtle) {
        setError('SubtleCrypto API is not available in this browser or algorithm is not supported.');
        setIsLoading(false);
        return;
      }
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(inputText);
        const hashBuffer = await window.crypto.subtle.digest(subtleAlgoName, data);
        setHashedOutput(bufferToHex(hashBuffer));
      } catch (e: any) {
        setError(`Hashing error (${selectedAlgorithm}): ${e.message || 'Unknown error'}`);
      }
    }
    setIsLoading(false);
  };

  const handleCopyToClipboard = async () => {
    if (!hashedOutput) return;
    try {
      await navigator.clipboard.writeText(hashedOutput);
      toast({
        title: "Hash Copied!",
        description: "The generated hash has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy hash to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Hash Generator"
        description="Generate cryptographic hashes from your input text using various algorithms."
        icon={Fingerprint}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="inputText">Input Text</Label>
            <Textarea
              ref={textareaRef}
              id="inputText"
              placeholder="Enter text to hash..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="font-code min-h-[100px] resize-none"
              style={{ overflowY: 'hidden' }}
              aria-describedby={error ? "error-message-input" : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="algorithmSelect">Select Algorithm</Label>
            <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
              <SelectTrigger id="algorithmSelect" className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select an algorithm" />
              </SelectTrigger>
              <SelectContent>
                {ALGORITHMS.map(algo => (
                  <SelectItem key={algo.value} value={algo.value}>
                    {algo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleGenerateHash} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Generating...' : 'Generate Hash'}
          </Button>

          {error && (
            <Alert variant="destructive" id="error-message-input">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hashedOutput && !error && (
            <div className="space-y-2">
              <Label htmlFor="hashedOutput">Generated Hash ({selectedAlgorithm.toUpperCase()})</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="hashedOutput"
                  type="text"
                  value={hashedOutput}
                  readOnly
                  className="font-code bg-muted/50 flex-grow"
                  aria-label="Generated hash"
                />
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard} aria-label="Copy hash">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
