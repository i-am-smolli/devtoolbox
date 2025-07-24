"use client";

import {
  AlertCircle,
  Construction,
  Copy,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface QueryParam {
  id: string;
  key: string;
  value: string;
}

export default function UrlBuilderPage() {
  const [protocol, setProtocol] = useState("https");
  const [hostname, setHostname] = useState("www.example.com");
  const [port, setPort] = useState("");
  const [pathname, setPathname] = useState("/path/to/resource");
  const [queryParams, setQueryParams] = useState<QueryParam[]>([
    { id: "initial-param-1", key: "param1", value: "value1" }, // Use a static ID for initial item
  ]);
  const [hash, setHash] = useState("section-details");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const generatedUrlTextareaRef = useRef<HTMLTextAreaElement>(null);

  const addQueryParam = () => {
    setQueryParams([
      ...queryParams,
      { id: Date.now().toString(), key: "", value: "" },
    ]);
  };

  const updateQueryParam = (
    id: string,
    field: "key" | "value",
    val: string,
  ) => {
    setQueryParams(
      queryParams.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    );
  };

  const removeQueryParam = (id: string) => {
    setQueryParams(queryParams.filter((p) => p.id !== id));
  };

  const assembleUrl = useCallback(() => {
    setError(null);
    if (!hostname.trim() && (protocol === "http" || protocol === "https")) {
      setGeneratedUrl("");
      setError("Hostname cannot be empty for HTTP(S) protocols.");
      return;
    }

    let url = "";
    if (protocol.trim() && protocol !== "none") {
      url += `${protocol.trim()}://`;
    }
    url += hostname.trim();

    if (port.trim()) {
      url += `:${port.trim()}`;
    }

    let currentPathname = pathname.trim();
    if (currentPathname && !currentPathname.startsWith("/")) {
      currentPathname = `/${currentPathname}`;
    }
    url += currentPathname;

    const validQueryParams = queryParams.filter((p) => p.key.trim());
    if (validQueryParams.length > 0) {
      const queryString = validQueryParams
        .map(
          (p) =>
            `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value.trim())}`,
        )
        .join("&");
      url += `?${queryString}`;
    }

    let currentHash = hash.trim();
    if (currentHash) {
      if (!currentHash.startsWith("#")) {
        currentHash = `#${currentHash}`;
      }
      url += currentHash;
    }

    try {
      if (
        url.includes("://") ||
        url.startsWith("//") ||
        url.startsWith("mailto:") ||
        url.startsWith("tel:")
      ) {
        if (url.trim()) new URL(url);
      } else if (
        url.trim() === "" &&
        (protocol === "http" || protocol === "https") &&
        !hostname.trim()
      ) {
        // This state is handled by the hostname check already, do nothing here to avoid double error/empty URL
      } else if (url.trim() !== "") {
        // For relative URLs or paths, new URL might be too strict.
        // Allow generation but skip new URL() validation if no protocol.
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Unknown error";
      setError(`Generated URL may be invalid: ${errorMessage}`);
      setGeneratedUrl(url); // Still set the URL for user to see
      return;
    }

    setGeneratedUrl(url);
  }, [protocol, hostname, port, pathname, queryParams, hash]);

  useEffect(() => {
    assembleUrl();
  }, [assembleUrl]);

  useEffect(() => {
    if (generatedUrlTextareaRef.current) {
      generatedUrlTextareaRef.current.style.height = "auto";
      generatedUrlTextareaRef.current.style.height = `${generatedUrlTextareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleCopyToClipboard = async () => {
    if (!generatedUrl || error) {
      toast({
        title: "Cannot Copy URL",
        description: error
          ? "Please fix the errors before copying."
          : "Generated URL is empty.",
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
    } catch {
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
        <CardHeader>
          <CardTitle className="font-headline">Base URL Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="protocol">
                Protocol
                <InfoTooltip>
                  Select the protocol for the URL. <br />
                  <ul className="list-disc pl-5 mt-1">
                    <li>
                      <b>https</b> - Secure HTTP
                    </li>
                    <li>
                      <b>http</b> - Standard HTTP
                    </li>
                    <li>
                      <b>ftp</b> - File Transfer Protocol
                    </li>
                    <li>
                      <b>mailto</b> - Email link
                    </li>
                    <li>
                      <b>tel</b> - Telephone link
                    </li>
                    <li>
                      <b>none</b> - Relative URL (no protocol)
                    </li>
                  </ul>
                </InfoTooltip>
              </Label>
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
                  <SelectItem value="none">(none/relative)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="hostname">
                Hostname
                <InfoTooltip>
                  Enter the hostname or IP address of the server. <br />
                  Example: <code>www.example.com</code> or{" "}
                  <code> 192.168.1.1</code>
                </InfoTooltip>
              </Label>
              <Input
                id="hostname"
                placeholder="www.example.com"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="port">
                Port (Optional)
                <InfoTooltip>
                  Specify a port number if needed. <br />
                  Example: <code>8080</code> or leave empty for default ports.
                </InfoTooltip>
              </Label>
              <Input
                id="port"
                type="number"
                placeholder="8080"
                value={port}
                onChange={(e) => setPort(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="pathname">
                Pathname
                <InfoTooltip>
                  Enter the path to the resource on the server. <br />
                  Example: <code>/path/to/resource/index.php</code> or leave
                  empty for root.
                </InfoTooltip>
              </Label>
              <Input
                id="pathname"
                placeholder="/path/to/resource"
                value={pathname}
                onChange={(e) => setPathname(e.target.value)}
              />
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
          {queryParams.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No query parameters added.
            </p>
          )}
          {queryParams.map((param) => (
            <div key={param.id} className="flex items-end space-x-2">
              <div className="grow space-y-1">
                <Label htmlFor={`queryKey-${param.id}`} className="text-xs">
                  Key
                  <InfoTooltip>
                    Enter the name of the query parameter. <br />
                    Example: <code>param1</code> or <code>page</code> or{" "}
                    <code>article</code>
                  </InfoTooltip>
                </Label>
                <Input
                  id={`queryKey-${param.id}`}
                  placeholder="paramName"
                  value={param.key}
                  onChange={(e) =>
                    updateQueryParam(param.id, "key", e.target.value)
                  }
                />
              </div>
              <div className="grow space-y-1">
                <Label htmlFor={`queryValue-${param.id}`} className="text-xs">
                  Value
                  <InfoTooltip>
                    Enter the value for the query parameter. <br />
                    Example: <code>value1</code> or <code>10</code> or{" "}
                    <code>active</code>
                  </InfoTooltip>
                </Label>
                <Input
                  id={`queryValue-${param.id}`}
                  placeholder="paramValue"
                  value={param.value}
                  onChange={(e) =>
                    updateQueryParam(param.id, "value", e.target.value)
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQueryParam(param.id)}
                aria-label="Remove query parameter"
              >
                <XCircle className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Fragment / Hash</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label htmlFor="hash">
              Hash (without &apos;#&apos;) (Optional)
              <InfoTooltip>
                Enter the fragment identifier for the URL. <br />
                Example: <code>contact</code> or <code>top</code>
                <br />
                <br />
                Note: This is most often used for single-page applications or to
                link to specific sections within a page.
              </InfoTooltip>
            </Label>
            <Input
              id="hash"
              placeholder="section-name"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
            />
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
        <CardHeader>
          <CardTitle className="font-headline">Generated URL</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={generatedUrlTextareaRef}
            value={generatedUrl}
            readOnly
            placeholder="URL will be generated here..."
            className="font-code bg-muted/50 min-h-[80px] resize-none"
            style={{ overflowY: "hidden" }}
            aria-label="Generated URL"
          />
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCopyToClipboard}
            disabled={!generatedUrl || !!error}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Generated URL
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
