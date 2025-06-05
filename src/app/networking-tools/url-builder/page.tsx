
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Construction, PlusCircle, XCircle, Copy, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QueryParam {
  id: string;
  key: string;
  value: string;
}

export default function UrlBuilderPage() {
  const [protocol, setProtocol] = useState('https');
  const [hostname, setHostname] = useState('www.example.com');
  const [port, setPort] = useState('');
  const [pathname, setPathname] = useState('/path/to/resource');
  const [queryParams, setQueryParams] = useState<QueryParam[]>([
    { id: Date.now().toString(), key: 'param1', value: 'value1' }
  ]);
  const [hash, setHash] = useState('section-details');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const generatedUrlTextareaRef = useRef<HTMLTextAreaElement>(null);

  const addQueryParam = () => {
    setQueryParams([...queryParams, { id: Date.now().toString(), key: '', value: '' }]);
  };

  const updateQueryParam = (id: string, field: 'key' | 'value', val: string) => {
    setQueryParams(queryParams.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  const removeQueryParam = (id: string) => {
    setQueryParams(queryParams.filter(p => p.id !== id));
  };

  const assembleUrl = useCallback(() => {
    setError(null);
    if (!hostname.trim()) {
      setGeneratedUrl('');
      // Optionally, set an error if hostname is mandatory for a selected protocol
      if (protocol === 'http' || protocol === 'https') {
        setError('Hostname cannot be empty for HTTP(S) protocols.');
      }
      return;
    }

    let url = '';
    if (protocol.trim()) {
      url += `${protocol.trim()}://`;
    }
    url += hostname.trim();

    if (port.trim()) {
      url += `:${port.trim()}`;
    }

    let currentPathname = pathname.trim();
    if (currentPathname && !currentPathname.startsWith('/')) {
      currentPathname = `/${currentPathname}`;
    }
    url += currentPathname;

    const validQueryParams = queryParams.filter(p => p.key.trim());
    if (validQueryParams.length > 0) {
      const queryString = validQueryParams
        .map(p => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value.trim())}`)
        .join('&');
      url += `?${queryString}`;
    }

    let currentHash = hash.trim();
    if (currentHash) {
      if (!currentHash.startsWith('#')) {
        currentHash = `#${currentHash}`;
      }
      url += currentHash;
    }
    
    // Validate the generated URL
    try {
      if (url.includes('://') || url.startsWith('//') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        new URL(url); // This will throw an error if the URL is malformed
      } else if (url.trim() !== '') {
         // For relative URLs or paths that don't start with a protocol, direct validation might be too strict
         // or not applicable. For now, we assume if it doesn't have a protocol, it might be a relative path.
      }
    } catch (e: any) {
      setError(`Generated URL is invalid: ${e.message}`);
      setGeneratedUrl(url); // Still show the malformed URL
      return;
    }

    setGeneratedUrl(url);
  }, [protocol, hostname, port, pathname, queryParams, hash]);

  useEffect(() => {
    assembleUrl();
  }, [assembleUrl]);

  useEffect(() => {
    if (generatedUrlTextareaRef.current) {
      generatedUrlTextareaRef.current.style.height = 'auto';
      generatedUrlTextareaRef.current.style.height = `${generatedUrlTextareaRef.current.scrollHeight}px`;
    }
  }, [generatedUrl]);
  
  const handleCopyToClipboard = async () => {
    if (!generatedUrl || error) {
      toast({
        title: "Cannot Copy URL",
        description: error ? "Please fix the errors before copying." : "Generated URL is empty.",
        variant: "destructive",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast({
        title: "URL Copied!",
        description: "The generated URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy the URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="URL Builder"
        description="Construct URLs by specifying components like protocol, host, path, query parameters, and hash."
        icon={Construction}
      />

      <Card>
        <CardHeader><CardTitle className="font-headline">Base URL Components</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="protocol">Protocol</Label>
              <Select value={protocol} onValueChange={setProtocol}>
                <SelectTrigger id="protocol">
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="https">https</SelectItem>
                  <SelectItem value="http">http</SelectItem>
                  <SelectItem value="ftp">ftp</SelectItem>
                  <SelectItem value="mailto">mailto</SelectItem>
                  <SelectItem value="tel">tel</SelectItem>
                  <SelectItem value="">(none/relative)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="hostname">Hostname</Label>
              <Input id="hostname" placeholder="www.example.com" value={hostname} onChange={e => setHostname(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="port">Port (Optional)</Label>
              <Input id="port" type="number" placeholder="8080" value={port} onChange={e => setPort(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="pathname">Pathname</Label>
              <Input id="pathname" placeholder="/path/to/resource" value={pathname} onChange={e => setPathname(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline">Query Parameters</CardTitle>
                <Button variant="outline" size="sm" onClick={addQueryParam}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Parameter
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {queryParams.length === 0 && <p className="text-sm text-muted-foreground">No query parameters added.</p>}
          {queryParams.map((param, index) => (
            <div key={param.id} className="flex items-end space-x-2">
              <div className="flex-grow space-y-1">
                <Label htmlFor={`queryKey-${param.id}`} className="text-xs">Key</Label>
                <Input
                  id={`queryKey-${param.id}`}
                  placeholder="paramName"
                  value={param.key}
                  onChange={e => updateQueryParam(param.id, 'key', e.target.value)}
                />
              </div>
              <div className="flex-grow space-y-1">
                <Label htmlFor={`queryValue-${param.id}`} className="text-xs">Value</Label>
                <Input
                  id={`queryValue-${param.id}`}
                  placeholder="paramValue"
                  value={param.value}
                  onChange={e => updateQueryParam(param.id, 'value', e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeQueryParam(param.id)} aria-label="Remove query parameter">
                <XCircle className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="font-headline">Fragment / Hash</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label htmlFor="hash">Hash (without '#')</Label>
            <Input id="hash" placeholder="section-name" value={hash} onChange={e => setHash(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader><CardTitle className="font-headline">Generated URL</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            ref={generatedUrlTextareaRef}
            value={generatedUrl}
            readOnly
            placeholder="URL will be generated here..."
            className="font-code bg-muted/50 min-h-[80px] resize-none"
            style={{ overflowY: 'hidden' }}
            aria-label="Generated URL"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleCopyToClipboard} disabled={!generatedUrl || !!error}>
            <Copy className="mr-2 h-4 w-4" /> Copy Generated URL
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
