"use client";

import { AlertCircle, Binary } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HexToBinaryPage() {
  const [hexInput, setHexInput] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const convertHexToBinary = () => {
    const sanitizedHex = hexInput.replace(/\s/g, ""); // Remove spaces
    if (!sanitizedHex) {
      setBinaryOutput("");
      setError(null);
      return;
    }

    if (!/^[0-9A-Fa-f]*$/.test(sanitizedHex)) {
      setError("Invalid hexadecimal characters. Only 0-9 and A-F are allowed.");
      setBinaryOutput("");
      return;
    }

    try {
      let binaryString = "";
      for (let i = 0; i < sanitizedHex.length; i++) {
        const decimalValue = parseInt(sanitizedHex[i], 16);
        const binaryChunk = decimalValue.toString(2).padStart(4, "0");
        binaryString +=
          binaryChunk +
          ((i + 1) % 2 === 0 && i < sanitizedHex.length - 1 ? " " : ""); // Add space every 8 bits (2 hex chars)
      }
      setBinaryOutput(binaryString.trim());
      setError(null);
    } catch {
      setError("An error occurred during conversion.");
      setBinaryOutput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value);
    // Optionally, auto-convert on type:
    // convertHexToBinary();
    // For now, we'll use a button.
  };

  return (
    <div>
      <PageHeader
        title="Hex to Binary Converter"
        description="Convert hexadecimal values to their binary representation."
        icon={Binary}
      />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-headline">Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hexInput">Hexadecimal Input</Label>
            <Input
              id="hexInput"
              type="text"
              placeholder="e.g., 1A2B or 1a2b"
              value={hexInput}
              onChange={handleInputChange}
              className="font-code"
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>

          <Button onClick={convertHexToBinary} className="w-full sm:w-auto">
            Convert to Binary
          </Button>

          {error && (
            <Alert variant="destructive" id="error-message">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {binaryOutput && !error && (
            <div className="space-y-2">
              <Label htmlFor="binaryOutput">Binary Output</Label>
              <Input
                id="binaryOutput"
                type="text"
                value={binaryOutput}
                readOnly
                className="font-code bg-muted/50"
                aria-label="Binary output"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(binaryOutput)}
              >
                Copy to Clipboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
