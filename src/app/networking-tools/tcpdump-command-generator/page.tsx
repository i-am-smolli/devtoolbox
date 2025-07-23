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
import {
  RadioTower,
  Copy,
  AlertCircle,
  Info,
  XCircle,
  PlusCircle,
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { useToast } from "@/hooks/use-toast";

const FILTER_TYPES = [
  { value: "host", label: "Host" },
  { value: "port", label: "Port" },
  { value: "net", label: "Network (CIDR)" },
  { value: "proto", label: "Protocol" },
];

interface FilterClause {
  id: string;
  type: "host" | "port" | "net" | "proto";
  direction: "any" | "src" | "dst";
  value: string;
  conjunction: "and" | "or";
}

const createNewFilter = (): FilterClause => ({
  id: `filter-${Date.now()}-${Math.random()}`,
  type: "host",
  direction: "any",
  value: "",
  conjunction: "and",
});

export default function TcpdumpCommandGeneratorPage() {
  const [interfaceName, setInterfaceName] = useState<string>("any");
  const [packetCount, setPacketCount] = useState<string>("");
  const [snapLen, setSnapLen] = useState<string>("0");
  const [timestampFormat, setTimestampFormat] = useState<string>("default");
  const [verboseLevel, setVerboseLevel] = useState<string>("default");
  const [dontResolve, setDontResolve] = useState<boolean>(true);
  const [noPromiscuous, setNoPromiscuous] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterClause[]>([]);

  const [generatedCommand, setGeneratedCommand] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const addFilter = () => {
    setFilters([...filters, createNewFilter()]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, newValues: Partial<FilterClause>) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...newValues } : f)));
  };

  const buildTcpdumpCommand = useCallback(() => {
    setError(null);
    if (!interfaceName.trim()) {
      setGeneratedCommand("tcpdump -i <interface>");
      setError("Interface cannot be empty.");
      return;
    }

    const commandParts: string[] = ["tcpdump"];

    commandParts.push(`-i ${interfaceName.trim()}`);
    if (dontResolve) commandParts.push("-n");

    if (packetCount.trim()) {
      const count = parseInt(packetCount, 10);
      if (!Number.isNaN(count) && count > 0) {
        commandParts.push(`-c ${count}`);
      } else {
        setError("Packet count must be a positive number.");
      }
    }

    if (snapLen.trim() && snapLen.trim() !== "0") {
      const len = parseInt(snapLen, 10);
      if (!Number.isNaN(len) && len >= 0) {
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

    if (noPromiscuous) commandParts.push("-p");

    const filterExpressionParts: string[] = [];
    filters.forEach((filter, index) => {
      if (!filter.value.trim()) {
        return; // Skip empty filters
      }

      let clause = "";

      if (filter.type === "proto") {
        clause = filter.value.trim().toLowerCase();
      } else {
        const directionStr =
          filter.direction !== "any" ? `${filter.direction} ` : "";
        clause = `${directionStr}${filter.type} ${filter.value.trim()}`;
      }

      filterExpressionParts.push(clause);

      if (index < filters.length - 1) {
        // Check if next filter is not empty
        const nextFilter = filters[index + 1];
        if (nextFilter?.value.trim()) {
          filterExpressionParts.push(filter.conjunction);
        }
      }
    });

    if (filterExpressionParts.length > 0) {
      commandParts.push(`'${filterExpressionParts.join(" ")}'`);
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
    filters,
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
            <Label htmlFor="interface">
              Interface
              <InfoTooltip>
                Specify the network interface to capture packets on. Use
                &#39;any&#39; to capture on all interfaces. <br />
                If not specified, tcpdump will use the first available
                interface.
              </InfoTooltip>
            </Label>
            <Input
              id="interface"
              placeholder="e.g., eth0, any"
              value={interfaceName}
              onChange={(e) => setInterfaceName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="packetCount">
              Packet Count (-c)
              <InfoTooltip>
                Limit the number of packets to capture. Leave blank to capture
                indefinitely.
              </InfoTooltip>
            </Label>
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
            <Label htmlFor="snapLen">
              Snapshot Length (-s)
              <InfoTooltip>
                Set the maximum number of bytes captured per packet. Use 0 for
                the full packet. <br />
                Larger values capture more data but use more memory.
              </InfoTooltip>
            </Label>
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
            <Label htmlFor="timestampFormat">
              Timestamp (-t)
              <InfoTooltip>
                Control the timestamp format for each packet line. <br />
                Options include hiding timestamps, showing deltas, or displaying
                date/time.
              </InfoTooltip>
            </Label>
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
            <Label htmlFor="verboseLevel">
              Verbosity (-v)
              <InfoTooltip>
                Increase the amount of packet information displayed. <br />
                Use more v&#39;s (e.g., -vv, -vvv) for more detail.
              </InfoTooltip>
            </Label>
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
              Don&#39;t resolve names (-n)
              <InfoTooltip>
                Do not resolve hostnames or service names. <br />
                This speeds up processing and avoids DNS lookups.
              </InfoTooltip>
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
              <InfoTooltip>
                Disable promiscuous mode on the interface. <br />
                In non-promiscuous mode, only packets addressed to this host are
                captured.
              </InfoTooltip>
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-headline">Filter Expression</CardTitle>
            <Button variant="outline" size="sm" onClick={addFilter}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No filters added. Click &quot;Add Filter&quot; to begin.
            </p>
          )}
          {filters.map((filter, index) => (
            <div
              key={filter.id}
              className="p-3 border rounded-md space-y-3 bg-muted/30"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <div className="space-y-1">
                  <Label htmlFor={`filterType-${filter.id}`}>
                    Type
                    <InfoTooltip>
                      Select the type of filter to apply: <br />
                      <ul className="list-disc pl-5 mt-1">
                        <li>
                          <b>Host</b> (IP address or hostname)
                        </li>
                        <li>
                          <b>Port</b> (TCP/UDP port)
                        </li>
                        <li>
                          <b>Network</b> (CIDR: e.g. 192.168.1.0/24)
                        </li>
                        <li>
                          <b>Protocol</b> (e.g., tcp, udp, icmp)
                        </li>
                      </ul>
                    </InfoTooltip>
                  </Label>
                  <Select
                    value={filter.type}
                    onValueChange={(v) =>
                      updateFilter(filter.id, {
                        type: v as FilterClause["type"],
                      })
                    }
                  >
                    <SelectTrigger id={`filterType-${filter.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`filterDir-${filter.id}`}>
                    Direction
                    <InfoTooltip>
                      <div>
                        <b>Any</b>: Match both source and destination.
                        <br />
                        <b>Source</b>: Only match packets where this is the
                        source.
                        <br />
                        <b>Destination</b>: Only match packets where this is the
                        destination.
                      </div>
                    </InfoTooltip>
                  </Label>
                  <Select
                    value={filter.direction}
                    onValueChange={(v) =>
                      updateFilter(filter.id, {
                        direction: v as FilterClause["direction"],
                      })
                    }
                    disabled={filter.type === "proto"}
                  >
                    <SelectTrigger id={`filterDir-${filter.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="src">Source</SelectItem>
                      <SelectItem value="dst">Destination</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 lg:col-span-2">
                  <Label htmlFor={`filterValue-${filter.id}`}>
                    Value
                    <InfoTooltip>
                      {filter.type === "host" && (
                        <>
                          Enter an IP address or hostname to match.
                          <br />
                          Example: <code>8.8.8.8</code> or{" "}
                          <code>example.com</code>
                        </>
                      )}
                      {filter.type === "port" && (
                        <>
                          Enter a TCP or UDP port number.
                          <br />
                          Example: <code>443</code>
                        </>
                      )}
                      {filter.type === "net" && (
                        <>
                          Enter a network in CIDR notation.
                          <br />
                          Example: <code>192.168.1.0/24</code>
                        </>
                      )}
                      {filter.type === "proto" && (
                        <>
                          Enter a protocol name.
                          <br />
                          Example: <code>tcp</code>, <code>udp</code>,{" "}
                          <code>icmp</code>
                        </>
                      )}
                    </InfoTooltip>
                  </Label>
                  <Input
                    id={`filterValue-${filter.id}`}
                    placeholder={
                      filter.type === "host"
                        ? "e.g., 8.8.8.8"
                        : filter.type === "port"
                          ? "e.g., 443"
                          : filter.type === "net"
                            ? "e.g., 192.168.1.0/24"
                            : "e.g., tcp, udp"
                    }
                    value={filter.value}
                    onChange={(e) =>
                      updateFilter(filter.id, { value: e.target.value })
                    }
                  />
                </div>
              </div>
              {index < filters.length - 1 && (
                <div className="flex items-center gap-4">
                  <div className="flex-grow border-t border-dashed"></div>
                  <Select
                    value={filter.conjunction}
                    onValueChange={(v) =>
                      updateFilter(filter.id, {
                        conjunction: v as FilterClause["conjunction"],
                      })
                    }
                  >
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="and">AND</SelectItem>
                      <SelectItem value="or">OR</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-grow border-t border-dashed"></div>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => removeFilter(filter.id)}
                  aria-label="Remove filter"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
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
            className="mt-2 sm:mt-0 border-yellow-600 text-yellow-600 dark:text-yellow-600 text-xs max-w-md"
          >
            <Info className="h-4 w-4 text-yellow-600" color="#d08700" />
            <AlertTitle className="text-sm text-yellow-600 dark:text-yellow-600">
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
