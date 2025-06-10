"use client";

// Removed: import type { Metadata } from 'next';
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardList, AlertCircle } from "lucide-react";

// Metadata is now handled by layout.tsx

interface ParsedCronPart {
  label: string;
  originalValue: string;
  description: string;
}

const PART_NAMES = ["Minute", "Hour", "Day of Month", "Month", "Day of Week"];
const PART_RANGES = [
  { min: 0, max: 59 }, // Minute
  { min: 0, max: 23 }, // Hour
  { min: 1, max: 31 }, // Day of Month
  { min: 1, max: 12 }, // Month
  { min: 0, max: 6 }, // Day of Week (0 or 7 is Sunday)
];

function getOrdinalSuffix(i: number): string {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function parseCronPart(partValue: string, partIndex: number): string {
  const partName = PART_NAMES[partIndex].toLowerCase();
  const range = PART_RANGES[partIndex];

  if (partValue === "*") {
    return `Every ${partName}`;
  }

  if (partValue === "?") {
    if (partIndex === 2 || partIndex === 4) {
      // Day of Month or Day of Week
      return "Any value (no specific value)";
    } else {
      throw new Error(
        `'?' can only be used for Day of Month or Day of Week in ${partName} part.`,
      );
    }
  }

  if (partValue.includes("*/")) {
    const step = partValue.split("*/")[1];
    if (/^\d+$/.test(step) && parseInt(step) >= 1) {
      const stepNum = parseInt(step);
      // Basic validation for step against range (e.g. */70 for minutes is not ideal)
      if (
        (partIndex === 0 && stepNum > 59) ||
        (partIndex === 1 && stepNum > 23)
      ) {
        // This is a soft warning, cron might still be "valid" but unusual
        return `Every ${stepNum}${getOrdinalSuffix(stepNum)} ${partName} (note: step value ${stepNum} is large for this field)`;
      }
      return `Every ${stepNum}${getOrdinalSuffix(stepNum)} ${partName}`;
    } else {
      throw new Error(
        `Invalid step value in ${partName} part: "${partValue}". Must be a positive number.`,
      );
    }
  }

  if (partValue.includes(",")) {
    const values = partValue.split(",");
    if (
      values.every(
        (v) =>
          /^\d+$/.test(v) &&
          parseInt(v) >= range.min &&
          parseInt(v) <= range.max,
      )
    ) {
      return `At ${partName}(s) ${values.join(", ")}`;
    } else {
      throw new Error(
        `Invalid values in ${partName} part: "${partValue}". Ensure all are numbers within range [${range.min}-${range.max}].`,
      );
    }
  }

  if (partValue.includes("-")) {
    const [start, end] = partValue.split("-");
    if (
      /^\d+$/.test(start) &&
      /^\d+$/.test(end) &&
      parseInt(start) >= range.min &&
      parseInt(end) <= range.max &&
      parseInt(start) <= parseInt(end)
    ) {
      return `From ${partName} ${start} through ${end}`;
    } else {
      throw new Error(
        `Invalid range in ${partName} part: "${partValue}". Ensure start <= end and within range [${range.min}-${range.max}].`,
      );
    }
  }

  if (/^\d+$/.test(partValue)) {
    const numVal = parseInt(partValue);
    if (numVal >= range.min && numVal <= range.max) {
      return `At ${partName} ${partValue}`;
    } else {
      throw new Error(
        `Invalid value in ${partName} part: "${partValue}". Must be a number within range [${range.min}-${range.max}].`,
      );
    }
  }

  // Handle textual day/month names (simplified, no direct validation here)
  // For a robust solution, mapping these to numbers would be needed.
  if (partIndex === 3 && /^[a-zA-Z]{3}$/.test(partValue)) {
    // Month abbreviations like JAN, FEB
    return `In month ${partValue.toUpperCase()}`;
  }
  if (partIndex === 4 && /^[a-zA-Z]{3}$/.test(partValue)) {
    // Day abbreviations like SUN, MON
    return `On ${partValue.toUpperCase()}`;
  }

  // Fallback for unsupported complex values (L, W, # etc.)
  return `Unsupported value: "${partValue}". This parser supports common cron syntax like *, ?, /, ,, -, and numeric values. Advanced symbols (L, W, #) are not fully interpreted.`;
}

export default function CronParserPage() {
  const [cronInput, setCronInput] = useState("*/15 0 1,15 * 1-5");
  const [parsedParts, setParsedParts] = useState<ParsedCronPart[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParseCron = () => {
    setError(null);
    setParsedParts(null);

    if (!cronInput.trim()) {
      setError("Cron expression cannot be empty.");
      return;
    }

    const parts = cronInput.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6) {
      // Allow 6 parts for optional year, though we only parse 5
      setError(
        "Invalid cron expression: Must have 5 (or 6, for year) parts separated by spaces.",
      );
      return;
    }

    // We only parse the standard 5 parts
    const standardParts = parts.slice(0, 5);

    try {
      const newParsedParts: ParsedCronPart[] = standardParts.map(
        (partValue, index) => ({
          label: PART_NAMES[index],
          originalValue: partValue,
          description: parseCronPart(partValue, index),
        }),
      );
      setParsedParts(newParsedParts);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred during parsing.");
    }
  };

  // Initial parse for default value
  useState(() => {
    if (cronInput) handleParseCron();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <div>
      <PageHeader
        title="Cron Expression Parser"
        description="Enter a cron expression to see its human-readable interpretation."
        icon={ClipboardList}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Cron Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cronInputString">Cron Expression</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="cronInputString"
                type="text"
                placeholder="e.g., */15 0 1,15 * 1-5"
                value={cronInput}
                onChange={(e) => setCronInput(e.target.value)}
                className="font-code"
                aria-describedby={error ? "error-message" : undefined}
              />
              <Button onClick={handleParseCron}>Parse</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Standard 5-part cron expressions (minute, hour, day of month,
              month, day of week). Year field (6th part) is ignored if present.
              Some advanced symbols (L, W, #) are not fully interpreted.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" id="error-message">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Parsing Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {parsedParts && !error && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg">
                  Parsed Cron Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parsedParts.map((part) => (
                  <div key={part.label} className="text-sm">
                    <span className="font-semibold">{part.label}</span>
                    <span className="text-muted-foreground font-code">
                      {" "}
                      ({part.originalValue}):{" "}
                    </span>
                    <span>{part.description}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
