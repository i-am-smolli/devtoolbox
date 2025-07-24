"use client";

import { AlertCircle, Network } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CidrCalculationResults {
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  numUsableHosts: number;
  subnetMask: string;
  wildcardMask: string;
  cidrNotation: string;
  ipType:
    | "Private"
    | "Public"
    | "Loopback"
    | "Link-Local"
    | "Reserved"
    | "Multicast"
    | "Invalid";
  originalIp: string;
  prefix: number;
}

interface SubnetInfo {
  networkAddress: string;
  cidrNotation: string;
  usableHostRange: string;
  broadcastAddress: string;
  numUsableHosts: number;
}

function ipToLong(ip: string): number | null {
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return null;
  const parts = ip.split(".").map(Number);
  if (parts.some((part) => part < 0 || part > 255)) return null;
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function longToIp(long: number): string {
  return `${long >>> 24}.${(long >> 16) & 255}.${(long >> 8) & 255}.${long & 255}`;
}

function getIpType(ipLong: number): CidrCalculationResults["ipType"] {
  const firstOctet = ipLong >>> 24;
  if (firstOctet === 127) return "Loopback";
  if (firstOctet === 10) return "Private"; // 10.0.0.0/8
  if (
    firstOctet === 172 &&
    ((ipLong >>> 16) & 0xff) >= 16 &&
    ((ipLong >>> 16) & 0xff) <= 31
  )
    return "Private"; // 172.16.0.0/12
  if (firstOctet === 192 && ((ipLong >>> 16) & 0xff) === 168) return "Private"; // 192.168.0.0/16
  if (firstOctet === 169 && ((ipLong >>> 16) & 0xff) === 254)
    return "Link-Local"; // 169.254.0.0/16
  if (firstOctet >= 224 && firstOctet <= 239) return "Multicast";
  if (firstOctet >= 240 && firstOctet <= 255) return "Reserved";
  if (firstOctet === 0) return "Reserved"; // Typically 0.0.0.0/8 is reserved
  return "Public";
}

export default function CidrCalculatorPage() {
  const [cidrInput, setCidrInput] = useState("192.168.1.0/24");
  const [calculationResults, setCalculationResults] =
    useState<CidrCalculationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [subnettingBaseCidr, setSubnettingBaseCidr] = useState("");
  const [newPrefixLengthInput, setNewPrefixLengthInput] = useState("");
  const [generatedSubnets, setGeneratedSubnets] = useState<SubnetInfo[]>([]);
  const [subnetError, setSubnetError] = useState<string | null>(null);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const parseCidr = useCallback(
    (
      cidrStr: string,
    ): { ipLong: number; prefix: number; originalIp: string } | null => {
      const parts = cidrStr.split("/");
      if (parts.length !== 2) return null;

      const ip = parts[0];
      const prefix = parseInt(parts[1], 10);

      if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) return null;

      const ipLong = ipToLong(ip);
      if (ipLong === null) return null;

      return { ipLong, prefix, originalIp: ip };
    },
    [],
  );

  const calculateCidrDetails = useCallback(
    (
      ipLong: number,
      prefix: number,
      originalIp: string,
    ): CidrCalculationResults => {
      const maskLong = prefix === 0 ? 0 : (-1 << (32 - prefix)) >>> 0;
      const networkLong = (ipLong & maskLong) >>> 0;
      const broadcastLong = (networkLong | (~maskLong >>> 0)) >>> 0;

      const numUsableHosts =
        prefix <= 30
          ? 2 ** (32 - prefix) - 2
          : prefix === 31
            ? 0
            : prefix === 32
              ? 0
              : 0;
      const firstUsableHostLong = prefix <= 30 ? networkLong + 1 : networkLong;
      const lastUsableHostLong =
        prefix <= 30 ? broadcastLong - 1 : broadcastLong;

      return {
        networkAddress: longToIp(networkLong),
        broadcastAddress: longToIp(broadcastLong),
        firstUsableHost: prefix <= 30 ? longToIp(firstUsableHostLong) : "N/A",
        lastUsableHost: prefix <= 30 ? longToIp(lastUsableHostLong) : "N/A",
        numUsableHosts: numUsableHosts < 0 ? 0 : numUsableHosts, // Ensure non-negative
        subnetMask: longToIp(maskLong),
        wildcardMask: longToIp(~maskLong >>> 0),
        cidrNotation: `${longToIp(networkLong)}/${prefix}`,
        ipType: getIpType(ipLong),
        originalIp,
        prefix,
      };
    },
    [],
  );

  const handleCalculateCidr = useCallback(() => {
    setError(null);
    const parsed = parseCidr(cidrInput);
    if (!parsed) {
      setError("Invalid CIDR format. Expected e.g., 192.168.1.0/24.");
      setCalculationResults(null);
      return;
    }
    const results = calculateCidrDetails(
      parsed.ipLong,
      parsed.prefix,
      parsed.originalIp,
    );
    setCalculationResults(results);
    setSubnettingBaseCidr(results.cidrNotation); // Pre-fill subnetting base
    setNewPrefixLengthInput(
      (parsed.prefix < 30 ? parsed.prefix + 1 : parsed.prefix).toString(),
    ); // Suggest next prefix
  }, [cidrInput, parseCidr, calculateCidrDetails]);

  useEffect(() => {
    if (isClient && cidrInput) {
      // Auto-calculate on initial load or if cidrInput changes programmatically
      handleCalculateCidr();
    }
  }, [
    isClient,
    cidrInput, // Auto-calculate on initial load or if cidrInput changes programmatically
    handleCalculateCidr,
  ]); // Removed handleCalculateCidr from deps to avoid re-calc on its own change

  const handleGenerateSubnets = useCallback(() => {
    setSubnetError(null);
    setGeneratedSubnets([]);

    const baseParsed = parseCidr(subnettingBaseCidr);
    if (!baseParsed) {
      setSubnetError("Invalid Base CIDR for subnetting.");
      return;
    }

    const newPrefix = parseInt(newPrefixLengthInput, 10);
    if (
      Number.isNaN(newPrefix) ||
      newPrefix <= baseParsed.prefix ||
      newPrefix > 32
    ) {
      setSubnetError(
        `New prefix length must be a number greater than ${baseParsed.prefix} and less than or equal to 32.`,
      );
      return;
    }

    const subnets: SubnetInfo[] = [];
    const subnetBits = newPrefix - baseParsed.prefix;
    const numberOfSubnets = 2 ** subnetBits;
    const subnetSize = 2 ** (32 - newPrefix);

    let currentNetworkLong =
      baseParsed.ipLong & ((-1 << (32 - baseParsed.prefix)) >>> 0); // Ensure base network address

    for (let i = 0; i < numberOfSubnets; i++) {
      const subnetDetails = calculateCidrDetails(
        currentNetworkLong,
        newPrefix,
        longToIp(currentNetworkLong),
      );
      subnets.push({
        networkAddress: subnetDetails.networkAddress,
        cidrNotation: `${subnetDetails.networkAddress}/${newPrefix}`,
        usableHostRange: `${subnetDetails.firstUsableHost} - ${subnetDetails.lastUsableHost}`,
        broadcastAddress: subnetDetails.broadcastAddress,
        numUsableHosts: subnetDetails.numUsableHosts,
      });
      currentNetworkLong = (currentNetworkLong + subnetSize) >>> 0;
    }
    setGeneratedSubnets(subnets);
  }, [
    subnettingBaseCidr,
    newPrefixLengthInput,
    parseCidr,
    calculateCidrDetails,
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="CIDR Calculator & Subnet Visualizer"
        description="Calculate network details from CIDR notation and visualize subnets."
        icon={Network}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">CIDR Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
            <div className="grow w-full sm:w-auto">
              <Label htmlFor="cidrInput">CIDR Address</Label>
              <Input
                id="cidrInput"
                type="text"
                placeholder="e.g., 192.168.1.0/24"
                value={cidrInput}
                onChange={(e) => setCidrInput(e.target.value)}
                className="font-code"
              />
            </div>
            <Button onClick={handleCalculateCidr} className="w-full sm:w-auto">
              Calculate
            </Button>
          </div>

          {error && isClient && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isClient && calculationResults && !error && (
            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-semibold">
                Calculation Results for {calculationResults.originalIp}/
                {calculationResults.prefix}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Network Address:</strong>{" "}
                  <span className="font-code">
                    {calculationResults.networkAddress}
                    <InfoTooltip>
                      It acts as the identifier for the subnet itself, much like
                      a street name represents an entire street. <br />
                      It doesn&apos;t refer to a specific device but to the
                      network as a whole. <br />
                      For this reason, it cannot be assigned to any individual
                      device.
                    </InfoTooltip>
                  </span>
                </div>
                <div>
                  <strong>Broadcast Address:</strong>{" "}
                  <span className="font-code">
                    {calculationResults.broadcastAddress}
                    <InfoTooltip>
                      It serves as the &quot;send to all&quot; address. A packet
                      sent to this address is received by every other device
                      within that same subnet. <br />
                      Therefore, it cannot be assigned to a single device.
                    </InfoTooltip>
                  </span>
                </div>
                <div>
                  <strong>First Usable Host:</strong>{" "}
                  <span className="font-code">
                    {calculationResults.firstUsableHost}
                    <InfoTooltip>
                      This is the first IP address that can be assigned to a
                      device within the subnet. <br />
                      It&apos;s like the first house on a street that can be
                      lived in. <br />
                      It is always the <strong>network address</strong> +1.
                    </InfoTooltip>
                  </span>
                </div>
                <div>
                  <strong>Last Usable Host:</strong>{" "}
                  <span className="font-code">
                    {calculationResults.lastUsableHost}
                    <InfoTooltip>
                      This is the last address within a subnet that can be
                      assigned to a device. <br />
                      It is always the <strong>broadcast address</strong> - 1.
                    </InfoTooltip>
                  </span>
                </div>
                <div>
                  <strong>Number of Usable Hosts:</strong>{" "}
                  <span className="font-code">
                    {calculationResults.numUsableHosts.toLocaleString()}
                    <InfoTooltip>
                      This is the total count of IP addresses available for
                      devices within a subnet. <br />
                      You can calculate it with the formula 2ⁿ - 2, where
                      &apos;n&apos; is the number of host bits (the bits not
                      used by the subnet mask). <br />
                      The &quot;- 2&quot; accounts for the reserved{" "}
                      <strong>network</strong> and{" "}
                      <strong>broadcast addresses</strong>.
                    </InfoTooltip>
                  </span>
                </div>
                <div>
                  <strong>Subnet Mask:</strong>{" "}
                  <span className="font-code">
                    {calculationResults.subnetMask}
                    <InfoTooltip>
                      A subnet mask is a 32-bit number that separates the
                      network portion of an IP address from the host portion.{" "}
                      <br />
                      It uses a sequence of 1s to identify the network part and
                      a sequence of 0s to identify the host part (e.g.,
                      255.255.255.0).
                    </InfoTooltip>
                  </span>
                </div>
                <div>
                  <strong>Wildcard Mask:</strong>{" "}
                  <span className="font-code">
                    {calculationResults.wildcardMask}
                    <InfoTooltip>
                      The wildcard mask is the inverse of a subnet mask. <br />
                      It is used in networking rules, like Access Control Lists
                      (ACLs), to specify which parts of an IP address to match.{" "}
                      <br />
                      Where the subnet mask has a 1, the wildcard mask has a 0,
                      and vice versa.
                    </InfoTooltip>
                  </span>
                </div>
                <div>
                  <strong>CIDR Notation:</strong>{" "}
                  <span className="font-code">
                    {calculationResults.cidrNotation}
                    <InfoTooltip>
                      CIDR (Classless Inter-Domain Routing) notation is a
                      compact way to represent a subnet mask. <br />
                      It is shown as a slash followed by a number (e.g., /24),
                      indicating how many bits are used for the network portion
                      of the address. <br />A /24 is equivalent to a
                      255.255.255.0 subnet mask.
                    </InfoTooltip>
                  </span>
                </div>
                <div>
                  <strong>IP Type:</strong>{" "}
                  <span className="font-code">
                    {calculationResults.ipType}
                    <InfoTooltip>
                      This categorizes the IP address:
                      <ul className="list-disc pl-5 mt-1">
                        <li>
                          <b>Private:</b> Used within a local network (like a
                          home or office) and cannot be routed on the public
                          internet (e.g., 192.168.x.x, 10.x.x.x).
                        </li>
                        <li>
                          <b>Public:</b> A globally unique address that is
                          accessible on the internet.
                        </li>
                        <li>
                          <b>Reserved:</b> Part of special-use ranges, such as
                          the loopback address (127.0.0.1), which are not used
                          for standard host assignments.
                        </li>
                      </ul>
                    </InfoTooltip>
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Subnet Visualizer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
            <div className="grow w-full sm:w-1/2">
              <Label htmlFor="subnettingBaseCidr">Base Network CIDR</Label>
              <Input
                id="subnettingBaseCidr"
                type="text"
                placeholder="e.g., 192.168.1.0/24"
                value={subnettingBaseCidr}
                onChange={(e) => setSubnettingBaseCidr(e.target.value)}
                className="font-code"
              />
            </div>
            <div className="grow w-full sm:w-1/4">
              <Label htmlFor="newPrefixLength">New Prefix Length</Label>
              <Input
                id="newPrefixLength"
                type="number"
                placeholder="e.g., 26"
                value={newPrefixLengthInput}
                onChange={(e) => setNewPrefixLengthInput(e.target.value)}
                className="font-code"
                min="0"
                max="32"
              />
            </div>
            <Button
              onClick={handleGenerateSubnets}
              className="w-full sm:w-auto"
            >
              Generate Subnets
            </Button>
          </div>

          {subnetError && isClient && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Subnetting Error</AlertTitle>
              <AlertDescription>{subnetError}</AlertDescription>
            </Alert>
          )}

          {isClient && generatedSubnets.length > 0 && !subnetError && (
            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-semibold">Generated Subnets</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Network Address</TableHead>
                    <TableHead>CIDR Notation</TableHead>
                    <TableHead>Usable Host Range</TableHead>
                    <TableHead>Broadcast Address</TableHead>
                    <TableHead className="text-right">Usable Hosts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedSubnets.map((subnet) => (
                    <TableRow
                      key={subnet.networkAddress + "/" + subnet.cidrNotation}
                    >
                      <TableCell className="font-code">
                        {subnet.networkAddress}
                      </TableCell>
                      <TableCell className="font-code">
                        {subnet.cidrNotation}
                      </TableCell>
                      <TableCell className="font-code">
                        {subnet.usableHostRange}
                      </TableCell>
                      <TableCell className="font-code">
                        {subnet.broadcastAddress}
                      </TableCell>
                      <TableCell className="text-right font-code">
                        {subnet.numUsableHosts.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
