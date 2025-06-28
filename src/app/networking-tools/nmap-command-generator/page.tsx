"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScanSearch, Copy, AlertCircle, Info } from "lucide-react";
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
  const [generatedCommand, setGeneratedCommand] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const commandTextareaRef = useRef<HTMLTextAreaElement>(null);

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
  ]);

  useEffect(() => {
    buildNmapCommand();
  }, [buildNmapCommand]);

  useEffect(() => {
    if (commandTextareaRef.current) {
      commandTextareaRef.current.style.height = "auto";
      commandTextareaRef.current.style.height = `${commandTextareaRef.current.scrollHeight}px`;
    }
  }, [generatedCommand]);

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
            <Label htmlFor="target">Target (IP, Hostname, Range)</Label>
            <Input
              id="target"
              placeholder="e.g., scanme.nmap.org or 192.168.1.0/24"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="scanType">Scan Type</Label>
              <Select
                value={scanType}
                onValueChange={setScanType}
                disabled={enableA}
              >
                <SelectTrigger id="scanType">
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
              <Label htmlFor="ports">Ports (Optional)</Label>
              <Input
                id="ports"
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
              id="enableSV"
              checked={enableSV && !enableA}
              onCheckedChange={(checked) => setEnableSV(!!checked)}
              disabled={enableA}
            />
            <Label htmlFor="enableSV" className="cursor-pointer">
              Service Version Detection (-sV)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableO"
              checked={enableO && !enableA}
              onCheckedChange={(checked) => setEnableO(!!checked)}
              disabled={enableA}
            />
            <Label htmlFor="enableO" className="cursor-pointer">
              OS Detection (-O, Root often needed)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableSC"
              checked={enableSC && !enableA}
              onCheckedChange={(checked) => setEnableSC(!!checked)}
              disabled={enableA}
            />
            <Label htmlFor="enableSC" className="cursor-pointer">
              Default Scripts (-sC)
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
            <Label htmlFor="timingTemplate">Timing Template</Label>
            <Select value={timingTemplate} onValueChange={setTimingTemplate}>
              <SelectTrigger id="timingTemplate">
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
              id="verbose"
              checked={verbose}
              onCheckedChange={(checked) => setVerbose(!!checked)}
            />
            <Label htmlFor="verbose" className="cursor-pointer">
              Verbose Output (-v)
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
              id="enableA"
              checked={enableA}
              onCheckedChange={(checked) => setEnableA(!!checked)}
            />
            <Label htmlFor="enableA" className="cursor-pointer">
              Enable Aggressive Scan (-A)
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
            className="mt-2 sm:mt-0 border-blue-500 text-blue-700 dark:text-blue-300 text-xs max-w-md"
          >
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-sm text-blue-600 dark:text-blue-400">
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
