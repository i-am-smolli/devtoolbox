"use client";

import { Copy, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function WhatIsMyIpPage() {
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch("/api/ip");
        if (!response.ok) {
          throw new Error("Failed to fetch IP address.");
        }
        const ip = await response.text();
        setIpAddress(ip);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "An unknown error occurred.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchIp();
  }, []);

  const handleCopyToClipboard = async () => {
    if (!ipAddress) return;
    try {
      await navigator.clipboard.writeText(ipAddress);
      toast({
        title: "IP Address Copied!",
        description: "Your IP address has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy IP address.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="What Is My IP Address?"
        description="Your public IP address is displayed below. This is the address external services see when you connect to them."
        icon={Wifi}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Public IP Address</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          {isLoading && <Skeleton className="h-12 w-full sm:w-64" />}
          {error && (
            <p className="text-destructive font-semibold">{error}</p>
          )}
          {!isLoading && !error && ipAddress && (
            <>
              <p className="text-2xl md:text-3xl font-bold font-code bg-muted/50 px-4 py-2 rounded-md">
                {ipAddress}
              </p>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyToClipboard}
                aria-label="Copy IP address"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Command-Line Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Using cURL</h3>
            <pre className="bg-muted/50 p-3 rounded-md font-code text-sm">
              <code>curl https://devtoolbox.icu/api/ip</code>
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Using Wget</h3>
            <pre className="bg-muted/50 p-3 rounded-md font-code text-sm">
              <code>wget -qO- https://devtoolbox.icu/api/ip</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
