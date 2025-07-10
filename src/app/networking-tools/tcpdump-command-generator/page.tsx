"use client";

import { useState, useEffect, useCallback } from "react";
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
import { RadioTower, Copy, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FILTER_PRESETS = [
  { value: "none", label: "No Filter (Listen to all)" },
  { value: "host", label: "Host" },
  { value: "port", label: "Port" },
  { value: "net", label: "Network (CIDR)" },
];

const PROTOCOL_TYPES = ["any", "tcp", "udp", "icmp"];

export default function TcpdumpCommandGeneratorPage() {
  const [interfaceName, setInterfaceName] = useState<string>("any");
  const [packetCount, setPacketCount] = useState<string>("");
  const [snapLen, setSnapLen] = useState<string>("0");
  const [timestampFormat, setTimestampFormat] = useState<string>("default");
  const [verboseLevel, setVerboseLevel] = useState<string>("default");
  const [dontResolve, setDontResolve] = useState<boolean>(false);
  const [noPromiscuous, setNoPromiscuous] = useState<boolean>(false);

  const [filterType, setFilterType] = useState<string>("none");
  const [filterValue, setFilterValue] = useState<string>("");
  const [protocol, setProtocol] = useState<string>("any");

  const [generatedCommand, setGeneratedCommand] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const buildTcpdumpCommand = useCallback(() => {
    setError(null);
    if (!interfaceName.trim()) {
      setGeneratedCommand("tcpdump -i <interface>");
      setError("Interface cannot be empty.");
      return;
    }

    const commandParts: string[] = ["tcpdump"];

    commandParts.push(`-i ${interfaceName.trim()}`);

    if (packetCount.trim()) {
      const count = parseInt(packetCount, 10);
      if (!isNaN(count) && count > 0) {
        commandParts.push(`-c ${count}`);
      } else {
        setError("Packet count must be a positive number.");
      }
    }

    if (snapLen.trim() && snapLen.trim() !== "0") {
      const len = parseInt(snapLen, 10);
      if (!isNaN(len) && len >= 0) {
        commandParts.push(`-s ${len}`);
      } else {
        setError("Snapshot length must be a non-negative number.");
      }
    }

    if (timestampFormat && timestampFormat !== "default") {
      commandParts.push(`-${timestampFormat}`);
    }

    if (verboseLevel && verboseLevel !== "default") {
      commandParts.push(`-${verboseLevel}`);
    }

    if (dontResolve) commandParts.push("-n");
    if (noPromiscuous) commandParts.push("-p");

    const filterExpression: string[] = [];

    if (protocol && protocol !== "any") {
      filterExpression.push(protocol);
    }

    if (filterType !== "none" && filterValue.trim()) {
      filterExpression.push(`${filterType} ${filterValue.trim()}`);
    } else if (filterType !== "none" && !filterValue.trim()) {
      setError(`Value for filter type '${filterType}' cannot be empty.`);
    }

    if (filterExpression.length > 0) {
      commandParts.push(`'${filterExpression.join(" and ")}'`);
    }

    setGeneratedCommand(commandParts.join(" "));
  }, [
    interfaceName,
    packetCount,
    snapLen,
    timestampFormat,
    verboseLevel,
    dontResolve,
    noPromiscuous,
    filterType,
    filterValue,
    protocol,
  ]);

  useEffect(() => {
    buildTcpdumpCommand();
  }, [buildTcpdumpCommand]);

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
        title: "tcpdump Command Copied!",
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
        title="tcpdump Command Generator"
        description="Build tcpdump commands for packet capture and network analysis."
        icon={RadioTower}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Capture Options</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="interface">Interface</Label>
            <Input
              id="interface"
              placeholder="e.g., eth0, any"
              value={interfaceName}
              onChange={(e) => setInterfaceName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="packetCount">Packet Count (-c)</Label>
            <Input
              id="packetCount"
              type="number"
              placeholder="e.g., 100 (optional)"
              value={packetCount}
              onChange={(e) => setPacketCount(e.target.value)}
              min="1"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="snapLen">Snapshot Length (-s)</Label>
            <Input
              id="snapLen"
              type="number"
              placeholder="e.g., 65535 (0 for full)"
              value={snapLen}
              onChange={(e) => setSnapLen(e.target.value)}
              min="0"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="timestampFormat">Timestamp (-t)</Label>
            <Select value={timestampFormat} onValueChange={setTimestampFormat}>
              <SelectTrigger id="timestampFormat">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="t">No Timestamp</SelectItem>
                <SelectItem value="tt">Delta since last packet</SelectItem>
                <SelectItem value="ttt">Delta since first packet</SelectItem>
                <SelectItem value="tttt">Date and Time</SelectItem>
                <SelectItem value="ttttt">
                  Delta since first packet (with date/time)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="verboseLevel">Verbosity (-v)</Label>
            <Select value={verboseLevel} onValueChange={setVerboseLevel}>
              <SelectTrigger id="verboseLevel">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="v">Verbose</SelectItem>
                <SelectItem value="vv">More Verbose</SelectItem>
                <SelectItem value="vvv">Most Verbose</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="dontResolve"
              checked={dontResolve}
              onCheckedChange={(checked) => setDontResolve(!!checked)}
            />
            <Label htmlFor="dontResolve" className="cursor-pointer">
              Don't resolve names (-n)
            </Label>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="noPromiscuous"
              checked={noPromiscuous}
              onCheckedChange={(checked) => setNoPromiscuous(!!checked)}
            />
            <Label htmlFor="noPromiscuous" className="cursor-pointer">
              No promiscuous mode (-p)
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Filter Expression</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="filterType">Filter Type</Label>
            <Select
              value={filterType}
              onValueChange={(v) => {
                setFilterType(v);
                setFilterValue("");
              }}
            >
              <SelectTrigger id="filterType">
                <SelectValue placeholder="Select filter type" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="filterValue">Filter Value</Label>
            <Input
              id="filterValue"
              placeholder={
                filterType === "host"
                  ? "e.g., 8.8.8.8"
                  : filterType === "port"
                    ? "e.g., 443"
                    : filterType === "net"
                      ? "e.g., 192.168.1.0/24"
                      : "Value for filter"
              }
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              disabled={filterType === "none"}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="protocol">Protocol</Label>
            <Select value={protocol} onValueChange={setProtocol}>
              <SelectTrigger id="protocol">
                <SelectValue placeholder="Any protocol" />
              </SelectTrigger>
              <SelectContent>
                {PROTOCOL_TYPES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p === "any" ? "Any" : p.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <CardTitle className="font-headline">
            Generated tcpdump Command
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={generatedCommand}
            readOnly
            className="font-code bg-muted/50 min-h-[100px]"
            aria-label="Generated tcpdump command"
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
              Running tcpdump typically requires root or administrator
              privileges.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  );
}
