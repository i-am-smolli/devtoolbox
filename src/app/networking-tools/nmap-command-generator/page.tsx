"use client";

import { AlertCircle, Copy, Info, ScanSearch } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
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

const SCAN_TYPES = [
  { value: "-sS", label: "TCP SYN Scan (Default, Root often needed)" },
  { value: "-sT", label: "TCP Connect Scan" },
  { value: "-sU", label: "UDP Scan (Root often needed)" },
  { value: "-sn", label: "Ping Scan (No port scan)" },
];

const TIMING_TEMPLATES = [
  { value: "T0", label: "T0 - Paranoid (Very Slow)" },
  { value: "T1", label: "T1 - Sneaky (Slow)" },
  { value: "T2", label: "T2 - Polite (Reduced Speed)" },
  { value: "T3", label: "T3 - Normal (Default Speed)" },
  { value: "T4", label: "T4 - Aggressive (Fast)" },
  { value: "T5", label: "T5 - Insane (Very Fast)" },
];

export default function NmapCommandGeneratorPage() {
  const [target, setTarget] = useState<string>("scanme.nmap.org");
  const [scanType, setScanType] = useState<string>("-sS");
  const [ports, setPorts] = useState<string>("");
  const [enableSV, setEnableSV] = useState<boolean>(false);
  const [enableO, setEnableO] = useState<boolean>(false);
  const [timingTemplate, setTimingTemplate] = useState<string>("T4");
  const [verbose, setVerbose] = useState<boolean>(false);
  const [enableSC, setEnableSC] = useState<boolean>(false);
  const [enableA, setEnableA] = useState<boolean>(false);
  const [enablePn, setEnablePN] = useState<boolean>(false);
  const [generatedCommand, setGeneratedCommand] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const commandTextareaRef = useRef<HTMLTextAreaElement>(null);

  const targetId = useId();
  const scanTypeId = useId();
  const portsId = useId();
  const enableSVId = useId();
  const enableOId = useId();
  const timingTemplateId = useId();
  const verboseId = useId();
  const enableSCId = useId();
  const enableAId = useId();
  const enablePnId = useId();

  const buildNmapCommand = useCallback(() => {
    setError(null);
    if (!target.trim()) {
      setGeneratedCommand("nmap <target>");
      setError("Target cannot be empty.");
      return;
    }

    const commandParts: string[] = ["nmap"];

    if (enableA) {
      commandParts.push("-A");
      // -A implies -O, -sV, -sC, and traceroute.
      // We don't need to add them separately.
    } else {
      if (scanType) commandParts.push(scanType);
      if (enableSV) commandParts.push("-sV");
      if (enableO) commandParts.push("-O");
      if (enableSC) commandParts.push("-sC");
      if (enablePn) commandParts.push("-Pn");
    }

    if (timingTemplate) commandParts.push(`-${timingTemplate}`); // Nmap uses -T4, not --T4

    if (verbose) commandParts.push("-v");

    if (ports.trim()) {
      commandParts.push(`-p ${ports.trim()}`);
    }

    commandParts.push(target.trim());
    setGeneratedCommand(commandParts.join(" "));
  }, [
    target,
    scanType,
    ports,
    enableSV,
    enableO,
    timingTemplate,
    verbose,
    enableSC,
    enableA,
    enablePn,
  ]);

  useEffect(() => {
    buildNmapCommand();
  }, [buildNmapCommand]);

  useEffect(() => {
    if (commandTextareaRef.current) {
      commandTextareaRef.current.style.height = "auto";
      commandTextareaRef.current.style.height = `${commandTextareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleCopyToClipboard = async () => {
    if (!generatedCommand || error) {
      toast({
        title: "Cannot Copy Command",
        description: error
          ? "Please fix errors before copying."
          : "Command is empty.",
        variant: "destructive",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedCommand);
      toast({
        title: "Nmap Command Copied!",
        description: "The generated command has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy command.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="Nmap Command Generator"
        description="Build Nmap commands by selecting options and specifying your target."
        icon={ScanSearch}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Target and Scan Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor={targetId}>Target (IP, Hostname, Range)</Label>
            <InfoTooltip>
              Enter a single IP address, hostname, or CIDR range <br />
              Example: <code>scanme.nmap.org</code> or{" "}
              <code>192.168.1.0/24</code>
            </InfoTooltip>
            <Input
              id={targetId}
              placeholder="e.g., scanme.nmap.org or 192.168.1.0/24"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={scanTypeId}>Scan Type</Label>
              <InfoTooltip>
                Select the type of scan to perform:
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    <b>TCP SYN Scan</b>: Default, stealthy scan (requires root).
                  </li>
                  <li>
                    <b>TCP Connect Scan</b>: Full TCP connection scan.
                  </li>
                  <li>
                    <b>UDP Scan</b>: Scans UDP ports (requires root).
                  </li>
                  <li>
                    <b>Ping Scan</b>: Only checks if hosts are up, no port scan.
                  </li>
                </ul>
              </InfoTooltip>
              <Select
                value={scanType}
                onValueChange={setScanType}
                disabled={enableA}
              >
                <SelectTrigger id={scanTypeId}>
                  <SelectValue placeholder="Select scan type" />
                </SelectTrigger>
                <SelectContent>
                  {SCAN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor={portsId}>Ports (Optional)</Label>
              <InfoTooltip>
                Specify ports to scan, separated by commas or ranges.
                <br />
                Example: <code>22,80,443</code> or <code>1-1000</code>.
              </InfoTooltip>
              <Input
                id={portsId}
                placeholder="e.g., 22,80,443 or 1-1000"
                value={ports}
                onChange={(e) => setPorts(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Detection Options</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={enableSVId}
              checked={enableSV && !enableA}
              onCheckedChange={(checked) => setEnableSV(!!checked)}
              disabled={enableA}
            />
            <Label htmlFor={enableSVId} className="cursor-pointer">
              Service Version Detection (-sV)
              <InfoTooltip>
                Enable service version detection to try to identify software
                versions <br />
                running on open ports.
              </InfoTooltip>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={enableOId}
              checked={enableO && !enableA}
              onCheckedChange={(checked) => setEnableO(!!checked)}
              disabled={enableA}
            />
            <Label htmlFor={enableOId} className="cursor-pointer">
              OS Detection (-O, Root often needed)
              <InfoTooltip>
                Enable OS detection to try to identify the operating system of
                the target host.
              </InfoTooltip>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={enableSCId}
              checked={enableSC && !enableA}
              onCheckedChange={(checked) => setEnableSC(!!checked)}
              disabled={enableA}
            />
            <Label htmlFor={enableSCId} className="cursor-pointer">
              Default Scripts (-sC)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={enablePnId}
              checked={enablePn && !enableA}
              onCheckedChange={(checked) => setEnablePN(!!checked)}
              disabled={enableA}
            />
            <Label htmlFor={enablePnId} className="cursor-pointer">
              No Ping Check (-Pn)
              <InfoTooltip>
                Skip host discovery and treat all hosts as online. Useful for
                scanning firewalled hosts.
              </InfoTooltip>
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Timing & Output Options
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor={timingTemplateId}>
              Timing Template
              <InfoTooltip>
                Adjust the timing of the scan to balance speed and stealth:
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    <b>T0</b>: Paranoid (Very Slow)
                  </li>
                  <li>
                    <b>T1</b>: Sneaky (Slow)
                  </li>
                  <li>
                    <b>T2</b>: Polite (Reduced Speed)
                  </li>
                  <li>
                    <b>T3</b>: Normal (Default Speed)
                  </li>
                  <li>
                    <b>T4</b>: Aggressive (Fast)
                  </li>
                  <li>
                    <b>T5</b>: Insane (Very Fast)
                  </li>
                </ul>
              </InfoTooltip>
            </Label>
            <Select value={timingTemplate} onValueChange={setTimingTemplate}>
              <SelectTrigger id={timingTemplateId}>
                <SelectValue placeholder="Select timing template" />
              </SelectTrigger>
              <SelectContent>
                {TIMING_TEMPLATES.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id={verboseId}
              checked={verbose}
              onCheckedChange={(checked) => setVerbose(!!checked)}
            />
            <Label htmlFor={verboseId} className="cursor-pointer">
              Verbose Output (-v)
              <InfoTooltip>
                Enable verbose output to see more details about the scan
                progress.
              </InfoTooltip>
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Aggressive Scan Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={enableAId}
              checked={enableA}
              onCheckedChange={(checked) => setEnableA(!!checked)}
            />
            <Label htmlFor={enableAId} className="cursor-pointer">
              Enable Aggressive Scan (-A)
              <InfoTooltip>
                Enable aggressive scan mode, which includes OS detection,
                version detection, <br />
                script scanning, and traceroute. This is a comprehensive scan
                that provides <br />
                detailed information about the target.
              </InfoTooltip>
            </Label>
          </div>
          {enableA && (
            <p className="text-xs text-muted-foreground mt-2">
              Note: -A enables OS detection (-O), version detection (-sV),
              script scanning (-sC), and traceroute. Individual toggles for
              these options will be ignored.
            </p>
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

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Generated Nmap Command
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={commandTextareaRef}
            value={generatedCommand}
            readOnly
            className="font-code bg-muted/50 min-h-[100px] resize-none"
            style={{ overflowY: "hidden" }}
            aria-label="Generated Nmap command"
          />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <Button onClick={handleCopyToClipboard} disabled={!!error}>
            <Copy className="mr-2 h-4 w-4" /> Copy Command
          </Button>
          <Alert
            variant="default"
            className="mt-2 sm:mt-0 border-yellow-600 text-yellow-600 dark:text-yellow-600 text-xs max-w-md"
          >
            <Info className="h-4 w-4 text-yellow-600" color="#d08700" />
            <AlertTitle className="text-sm text-yellow-600 dark:text-yellow-600">
              Privilege Note
            </AlertTitle>
            <AlertDescription>
              Some Nmap scans (e.g., SYN scan -sS, OS detection -O) require root
              or administrator privileges to run effectively.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  );
}
