"use client";

import { AlertCircle, Copy, Plus, Search, Trash2 } from "lucide-react";
import { SetStateAction, useCallback, useEffect, useId, useRef, useState } from "react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

const NONE = "__none__";

const COMMON_PORTS = [
  { value: NONE, label: "Any" },
  { value: "21", label: "21 (FTP)" },
  { value: "22", label: "22 (SSH)" },
  { value: "23", label: "23 (Telnet)" },
  { value: "25", label: "25 (SMTP)" },
  { value: "53", label: "53 (DNS)" },
  { value: "80", label: "80 (HTTP)" },
  { value: "110", label: "110 (POP3)" },
  { value: "143", label: "143 (IMAP)" },
  { value: "443", label: "443 (HTTPS)" },
  { value: "445", label: "445 (SMB)" },
  { value: "993", label: "993 (IMAPS)" },
  { value: "995", label: "995 (POP3S)" },
  { value: "1433", label: "1433 (MSSQL)" },
  { value: "1521", label: "1521 (Oracle)" },
  { value: "3306", label: "3306 (MySQL)" },
  { value: "3389", label: "3389 (RDP)" },
  { value: "5432", label: "5432 (PostgreSQL)" },
  { value: "5900", label: "5900 (VNC)" },
  { value: "6379", label: "6379 (Redis)" },
  { value: "8080", label: "8080 (HTTP Alt)" },
  { value: "8443", label: "8443 (HTTPS Alt)" },
  { value: "9200", label: "9200 (Elasticsearch)" },
  { value: "27017", label: "27017 (MongoDB)" },
];

const PRODUCT_PRESETS = [
  { value: NONE, label: "None" },
  { value: "Apache httpd", label: "Apache HTTP Server" },
  { value: "nginx", label: "Nginx" },
  { value: "Microsoft IIS httpd", label: "Microsoft IIS" },
  { value: "OpenSSH", label: "OpenSSH" },
  { value: "MySQL", label: "MySQL" },
  { value: "PostgreSQL", label: "PostgreSQL" },
  { value: "MongoDB", label: "MongoDB" },
  { value: "Redis", label: "Redis" },
  { value: "Elasticsearch", label: "Elasticsearch" },
  { value: "vsftpd", label: "vsftpd" },
  { value: "ProFTPD", label: "ProFTPD" },
  { value: "Exim smtpd", label: "Exim SMTP" },
  { value: "Postfix smtpd", label: "Postfix SMTP" },
  { value: "lighttpd", label: "Lighttpd" },
];

const OS_PRESETS = [
  { value: NONE, label: "Any" },
  { value: "Linux", label: "Linux" },
  { value: "Windows", label: "Windows" },
  { value: "FreeBSD", label: "FreeBSD" },
  { value: "Ubuntu", label: "Ubuntu" },
  { value: "Debian", label: "Debian" },
  { value: "CentOS", label: "CentOS" },
];

interface FilterClause {
  id: number;
  filter: string;
  value: string;
  negate: boolean;
}

const FILTER_OPTIONS = [
  { value: "city", label: "city" },
  { value: "country", label: "country (2-letter code)" },
  { value: "geo", label: "geo (lat,lon)" },
  { value: "hostname", label: "hostname" },
  { value: "isp", label: "isp" },
  { value: "net", label: "net (CIDR)" },
  { value: "org", label: "org" },
  { value: "os", label: "os" },
  { value: "port", label: "port" },
  { value: "product", label: "product" },
  { value: "version", label: "version" },
  { value: "ssl", label: "ssl" },
  { value: "ssl.cert.subject.CN", label: "ssl.cert.subject.CN" },
  { value: "ssl.cert.issuer.O", label: "ssl.cert.issuer.O" },
  { value: "ssl.cert.expired", label: "ssl.cert.expired" },
  { value: "ssl.version", label: "ssl.version" },
  { value: "http.title", label: "http.title" },
  { value: "http.html", label: "http.html" },
  { value: "http.status", label: "http.status" },
  { value: "http.component", label: "http.component" },
  { value: "http.favicon.hash", label: "http.favicon.hash" },
  { value: "has_screenshot", label: "has_screenshot" },
  { value: "asn", label: "asn" },
  { value: "vuln", label: "vuln (CVE)" },
  { value: "tag", label: "tag" },
  { value: "before", label: "before (date)" },
  { value: "after", label: "after (date)" },
];

const EXAMPLE_QUERIES = [
  {
    label: "Apache servers in Germany",
    query: 'product:"Apache httpd" country:"DE"',
  },
  {
    label: "Open MongoDB instances",
    query: 'product:"MongoDB" port:27017 -authentication',
  },
  {
    label: "Webcams",
    query: 'http.title:"webcam" has_screenshot:true',
  },
  {
    label: "Expired SSL certificates",
    query: "ssl.cert.expired:true",
  },
  {
    label: "Nginx servers with specific org",
    query: 'product:"nginx" org:"Amazon"',
  },
  {
    label: "Industrial control systems (Modbus)",
    query: "port:502",
  },
  {
    label: "Redis without auth",
    query: 'product:"Redis" -authentication port:6379',
  },
  {
    label: "Default passwords in title",
    query: 'http.title:"default password"',
  },
];

let nextFilterId = 1;

export default function ShodanQueryBuilderPage() {
  const [keyword, setKeyword] = useState<string>("");
  const [port, setPort] = useState<string>("");
  const [customPort, setCustomPort] = useState<string>("");
  const [product, setProduct] = useState<string>("");
  const [customProduct, setCustomProduct] = useState<string>("");
  const [os, setOs] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [org, setOrg] = useState<string>("");
  const [net, setNet] = useState<string>("");
  const [hostname, setHostname] = useState<string>("");
  const [httpTitle, setHttpTitle] = useState<string>("");
  const [sslSubjectCN, setSslSubjectCN] = useState<string>("");
  const [sslExpired, setSslExpired] = useState<boolean>(false);
  const [hasScreenshot, setHasScreenshot] = useState<boolean>(false);
  const [vuln, setVuln] = useState<string>("");
  const [additionalFilters, setAdditionalFilters] = useState<FilterClause[]>(
    [],
  );
  const [generatedQuery, setGeneratedQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const queryTextareaRef = useRef<HTMLTextAreaElement>(null);

  const keywordId = useId();
  const portId = useId();
  const customPortId = useId();
  const productId = useId();
  const customProductId = useId();
  const osId = useId();
  const countryId = useId();
  const cityId = useId();
  const orgId = useId();
  const netId = useId();
  const hostnameId = useId();
  const httpTitleId = useId();
  const sslSubjectCNId = useId();
  const sslExpiredId = useId();
  const hasScreenshotId = useId();
  const vulnId = useId();

  const resolvedPort = customPort.trim() || (port === NONE ? "" : port);
  const resolvedProduct =
    customProduct.trim() || (product === NONE ? "" : product);

  const buildQuery = useCallback(() => {
    setError(null);
    const parts: string[] = [];

    if (keyword.trim()) {
      parts.push(keyword.trim());
    }

    if (resolvedPort) {
      parts.push(`port:${resolvedPort}`);
    }

    if (resolvedProduct) {
      parts.push(`product:"${resolvedProduct}"`);
    }

    if (os && os !== NONE) {
      parts.push(`os:"${os}"`);
    }

    if (country.trim()) {
      const c = country.trim().toUpperCase();
      if (c.length !== 2) {
        setError("Country must be a 2-letter ISO country code (e.g., US, DE).");
      }
      parts.push(`country:"${c}"`);
    }

    if (city.trim()) {
      parts.push(`city:"${city.trim()}"`);
    }

    if (org.trim()) {
      parts.push(`org:"${org.trim()}"`);
    }

    if (net.trim()) {
      parts.push(`net:${net.trim()}`);
    }

    if (hostname.trim()) {
      parts.push(`hostname:"${hostname.trim()}"`);
    }

    if (httpTitle.trim()) {
      parts.push(`http.title:"${httpTitle.trim()}"`);
    }

    if (sslSubjectCN.trim()) {
      parts.push(`ssl.cert.subject.CN:"${sslSubjectCN.trim()}"`);
    }

    if (sslExpired) {
      parts.push("ssl.cert.expired:true");
    }

    if (hasScreenshot) {
      parts.push("has_screenshot:true");
    }

    if (vuln.trim()) {
      parts.push(`vuln:"${vuln.trim()}"`);
    }

    for (const f of additionalFilters) {
      if (f.filter && f.value.trim()) {
        const prefix = f.negate ? "-" : "";
        const needsQuotes = f.value.includes(" ");
        const val = needsQuotes ? `"${f.value.trim()}"` : f.value.trim();
        parts.push(`${prefix}${f.filter}:${val}`);
      }
    }

    setGeneratedQuery(parts.join(" "));
  }, [
    keyword,
    resolvedPort,
    resolvedProduct,
    os,
    country,
    city,
    org,
    net,
    hostname,
    httpTitle,
    sslSubjectCN,
    sslExpired,
    hasScreenshot,
    vuln,
    additionalFilters,
  ]);

  useEffect(() => {
    buildQuery();
  }, [buildQuery]);

  useEffect(() => {
    if (queryTextareaRef.current) {
      queryTextareaRef.current.style.height = "auto";
      queryTextareaRef.current.style.height = `${queryTextareaRef.current.scrollHeight}px`;
    }
  }, []);

  const addFilter = () => {
    setAdditionalFilters((prev) => [
      ...prev,
      { id: nextFilterId++, filter: "", value: "", negate: false },
    ]);
  };

  const removeFilter = (id: number) => {
    setAdditionalFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFilter = (
    id: number,
    field: keyof FilterClause,
    value: string | boolean,
  ) => {
    setAdditionalFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    );
  };

  const loadExampleQuery = (query: string) => {
    // Reset all fields and set the raw query as keyword
    setPort(NONE);
    setCustomPort("");
    setProduct(NONE);
    setCustomProduct("");
    setOs(NONE);
    setCountry("");
    setCity("");
    setOrg("");
    setNet("");
    setHostname("");
    setHttpTitle("");
    setSslSubjectCN("");
    setSslExpired(false);
    setHasScreenshot(false);
    setVuln("");
    setAdditionalFilters([]);
    setKeyword(query);
  };

  const handleCopyToClipboard = async () => {
    if (!generatedQuery) {
      toast({
        title: "Cannot Copy Query",
        description: "Query is empty. Add at least one filter or keyword.",
        variant: "destructive",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedQuery);
      toast({
        title: "Shodan Query Copied!",
        description: "The generated query has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy query.",
        variant: "destructive",
      });
    }
  };

  const handleOpenInShodan = () => {
    if (!generatedQuery) {
      toast({
        title: "Cannot Open in Shodan",
        description: "Query is empty.",
        variant: "destructive",
      });
      return;
    }
    const url = `https://www.shodan.io/search?query=${encodeURIComponent(generatedQuery)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="Shodan Search Query Builder"
        description="Build Shodan.io search queries by selecting filters and options. Combine keywords, ports, products, and more to craft precise queries."
        icon={Search}
      />

      {/* Example Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Example Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example) => (
              <Badge
                key={example.label}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => loadExampleQuery(example.query)}
              >
                {example.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* General Search */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">General Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor={keywordId}>Keyword / Banner Text</Label>
            <InfoTooltip>
              Free-text search across banner data. Matches against the full
              banner text returned by Shodan.
              <br />
              Example: <code>default password</code> or <code>nginx</code>
            </InfoTooltip>
            <Input
              id={keywordId}
              placeholder='e.g., "default password" or nginx'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service & Product */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Service & Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={portId}>Port</Label>
              <InfoTooltip>
                Filter results by port number. Select a common port or enter a
                custom one below.
              </InfoTooltip>
              <Select
                value={port}
                onValueChange={(v: SetStateAction<string>) => {
                  setPort(v);
                  if (v) setCustomPort("");
                }}
              >
                <SelectTrigger id={portId}>
                  <SelectValue placeholder="Select a port" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_PORTS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor={customPortId}>Custom Port</Label>
              <InfoTooltip>
                Enter a custom port number if not listed above. Overrides the
                dropdown selection.
              </InfoTooltip>
              <Input
                id={customPortId}
                placeholder="e.g., 8888"
                value={customPort}
                onChange={(e) => {
                  setCustomPort(e.target.value);
                  if (e.target.value) setPort(NONE);
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={productId}>Product</Label>
              <InfoTooltip>
                Filter by detected product/software name.
                <br />
                Example: <code>Apache httpd</code>, <code>nginx</code>,{" "}
                <code>OpenSSH</code>
              </InfoTooltip>
              <Select
                value={product}
                onValueChange={(v: SetStateAction<string>) => {
                  setProduct(v);
                  if (v) setCustomProduct("");
                }}
              >
                <SelectTrigger id={productId}>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor={customProductId}>Custom Product</Label>
              <InfoTooltip>
                Enter a custom product name if not listed above. Overrides the
                dropdown selection.
              </InfoTooltip>
              <Input
                id={customProductId}
                placeholder='e.g., "Tomcat"'
                value={customProduct}
                onChange={(e) => {
                  setCustomProduct(e.target.value);
                  if (e.target.value) setProduct(NONE);
                }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor={osId}>Operating System</Label>
            <InfoTooltip>Filter by detected operating system.</InfoTooltip>
            <Select value={os} onValueChange={setOs}>
              <SelectTrigger id={osId}>
                <SelectValue placeholder="Select OS" />
              </SelectTrigger>
              <SelectContent>
                {OS_PRESETS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={countryId}>Country (2-letter code)</Label>
              <InfoTooltip>
                ISO 3166-1 alpha-2 country code.
                <br />
                Example: <code>US</code>, <code>DE</code>, <code>JP</code>
              </InfoTooltip>
              <Input
                id={countryId}
                placeholder="e.g., US"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                maxLength={2}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={cityId}>City</Label>
              <InfoTooltip>
                Filter by city name.
                <br />
                Example: <code>San Francisco</code>, <code>Berlin</code>
              </InfoTooltip>
              <Input
                id={cityId}
                placeholder="e.g., San Francisco"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network & Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Network & Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={orgId}>Organization</Label>
              <InfoTooltip>
                Filter by organization name (as identified by Shodan).
                <br />
                Example: <code>Google</code>, <code>Amazon</code>
              </InfoTooltip>
              <Input
                id={orgId}
                placeholder='e.g., "Google"'
                value={org}
                onChange={(e) => setOrg(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={netId}>Network (CIDR)</Label>
              <InfoTooltip>
                Filter by network range in CIDR notation.
                <br />
                Example: <code>8.8.8.0/24</code>
              </InfoTooltip>
              <Input
                id={netId}
                placeholder="e.g., 8.8.8.0/24"
                value={net}
                onChange={(e) => setNet(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor={hostnameId}>Hostname</Label>
            <InfoTooltip>
              Filter by hostname or domain.
              <br />
              Example: <code>.gov</code>, <code>example.com</code>
            </InfoTooltip>
            <Input
              id={hostnameId}
              placeholder="e.g., .gov or example.com"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* HTTP & SSL */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">HTTP & SSL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={httpTitleId}>HTTP Title</Label>
              <InfoTooltip>
                Filter by the HTML title tag of web pages.
                <br />
                Example: <code>login</code>, <code>dashboard</code>
              </InfoTooltip>
              <Input
                id={httpTitleId}
                placeholder='e.g., "login"'
                value={httpTitle}
                onChange={(e) => setHttpTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={sslSubjectCNId}>SSL Certificate CN</Label>
              <InfoTooltip>
                Filter by the Common Name (CN) in the SSL certificate subject.
                <br />
                Example: <code>*.google.com</code>
              </InfoTooltip>
              <Input
                id={sslSubjectCNId}
                placeholder="e.g., *.google.com"
                value={sslSubjectCN}
                onChange={(e) => setSslSubjectCN(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={sslExpiredId}
                checked={sslExpired}
                onCheckedChange={(checked: boolean) => setSslExpired(!!checked)}
              />
              <Label htmlFor={sslExpiredId} className="cursor-pointer">
                Expired SSL Certificates
                <InfoTooltip>
                  Only show hosts with expired SSL certificates.
                </InfoTooltip>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={hasScreenshotId}
                checked={hasScreenshot}
                onCheckedChange={(checked: boolean) => setHasScreenshot(!!checked)}
              />
              <Label htmlFor={hasScreenshotId} className="cursor-pointer">
                Has Screenshot
                <InfoTooltip>
                  Only show hosts where Shodan has captured a screenshot.
                </InfoTooltip>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vulnerability */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Vulnerability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label htmlFor={vulnId}>CVE ID</Label>
            <InfoTooltip>
              Search for hosts vulnerable to a specific CVE.
              <br />
              Example: <code>CVE-2021-44228</code> (Log4Shell)
              <br />
              Note: Requires a paid Shodan account.
            </InfoTooltip>
            <Input
              id={vulnId}
              placeholder="e.g., CVE-2021-44228"
              value={vuln}
              onChange={(e) => setVuln(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Additional Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {additionalFilters.map((f) => (
            <div key={f.id} className="flex items-end gap-2">
              <div className="flex items-center space-x-2 pt-5">
                <Checkbox
                  checked={f.negate}
                  onCheckedChange={(checked: boolean) =>
                    updateFilter(f.id, "negate", !!checked)
                  }
                  aria-label="Negate filter"
                />
                <Label className="text-xs whitespace-nowrap">Negate</Label>
              </div>
              <div className="flex-1 space-y-1">
                <Label>Filter</Label>
                <Select
                  value={f.filter}
                  onValueChange={(v: string) => updateFilter(f.id, "filter", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1">
                <Label>Value</Label>
                <Input
                  placeholder="Filter value"
                  value={f.value}
                  onChange={(e) => updateFilter(f.id, "value", e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(f.id)}
                aria-label="Remove filter"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addFilter}>
            <Plus className="mr-2 h-4 w-4" /> Add Filter
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generated Query */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Generated Shodan Query
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={queryTextareaRef}
            value={generatedQuery}
            readOnly
            className="font-code bg-muted/50 min-h-[100px] resize-none"
            style={{ overflowY: "hidden" }}
            aria-label="Generated Shodan query"
          />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-2">
          <Button onClick={handleCopyToClipboard} disabled={!generatedQuery}>
            <Copy className="mr-2 h-4 w-4" /> Copy Query
          </Button>
          <Button
            variant="outline"
            onClick={handleOpenInShodan}
            disabled={!generatedQuery}
          >
            <Search className="mr-2 h-4 w-4" /> Open in Shodan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
