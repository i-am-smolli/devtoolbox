"use client";

import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addYears,
  format,
  formatISO,
  formatRFC7231,
  fromUnixTime,
  getUnixTime,
  isValid,
  parse,
  parseISO,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subSeconds,
  subYears,
} from "date-fns";
import { AlertCircle, Clock, Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Metadata is now handled by layout.tsx

type TimeFormat =
  | "unixSeconds"
  | "unixMilliseconds"
  | "iso8601"
  | "dateOnly"
  | "timeOnly"
  | "isoWeek"
  | "http"
  | "sql";

interface InputField {
  id: TimeFormat;
  label: string;
  placeholder: string;
  error: string | null;
  value: string;
}

const initialFieldsDefinition: Record<
  TimeFormat,
  Omit<InputField, "value" | "error">
> = {
  unixSeconds: {
    id: "unixSeconds",
    label: "Unix Timestamp (seconds)",
    placeholder: "e.g., 1678886400",
  },
  unixMilliseconds: {
    id: "unixMilliseconds",
    label: "Unix Timestamp (ms)",
    placeholder: "e.g., 1678886400000",
  },
  iso8601: {
    id: "iso8601",
    label: "ISO 8601",
    placeholder: "e.g., 2023-03-15T10:30:00.000Z",
  },
  dateOnly: {
    id: "dateOnly",
    label: "Date (YYYY-MM-DD)",
    placeholder: "e.g., 2023-03-15",
  },
  timeOnly: {
    id: "timeOnly",
    label: "Time (HH:mm:ss)",
    placeholder: "e.g., 10:30:00",
  },
  isoWeek: {
    id: "isoWeek",
    label: "ISO Week Date",
    placeholder: "e.g., 2023-W11-3",
  },
  http: {
    id: "http",
    label: "HTTP Date (RFC1123)",
    placeholder: "Wed, 15 Mar 2023 10:30:00 GMT",
  },
  sql: {
    id: "sql",
    label: "SQL Timestamp",
    placeholder: "e.g., 2023-03-15 10:30:00",
  },
};

const initialFieldStates = (): Record<TimeFormat, InputField> =>
  Object.entries(initialFieldsDefinition).reduce(
    (acc, [key, val]) => {
      acc[key as TimeFormat] = { ...val, value: "", error: null };
      return acc;
    },
    {} as Record<TimeFormat, InputField>,
  );

export default function TimeConverterPage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [fieldStates, setFieldStates] =
    useState<Record<TimeFormat, InputField>>(initialFieldStates);
  const [localTimeDisplay, setLocalTimeDisplay] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentDate(new Date()); // Set current date on client mount
  }, []);

  const formatFieldValue = useCallback(
    (date: Date | null, fieldId: TimeFormat): string => {
      if (!date || !isValid(date)) return "";
      try {
        switch (fieldId) {
          case "unixSeconds":
            return getUnixTime(date).toString();
          case "unixMilliseconds":
            return date.getTime().toString();
          case "iso8601":
            return formatISO(date);
          case "dateOnly":
            return format(date, "yyyy-MM-dd");
          case "timeOnly":
            return format(date, "HH:mm:ss");
          case "isoWeek":
            return format(date, "yyyy-'W'II-i");
          case "http":
            return formatRFC7231(date);
          case "sql":
            return format(date, "yyyy-MM-dd HH:mm:ss");
          default:
            return "";
        }
      } catch {
        return "";
      }
    },
    [],
  );

  useEffect(() => {
    if (!isClient || !currentDate || !isValid(currentDate)) {
      if (isClient && !currentDate) {
        // Handle initial null state gracefully
        setLocalTimeDisplay("Calculating...");
        setFieldStates(initialFieldStates()); // Reset fields if date becomes null
      }
      return;
    }

    setFieldStates((prevStates) => {
      const newStates = { ...prevStates };
      let changed = false;
      for (const key in newStates) {
        const fieldId = key as TimeFormat;
        const formattedValue = formatFieldValue(currentDate, fieldId);
        if (
          newStates[fieldId].value !== formattedValue ||
          newStates[fieldId].error
        ) {
          newStates[fieldId] = {
            ...newStates[fieldId],
            value: formattedValue,
            error: null,
          };
          changed = true;
        }
      }
      return changed ? newStates : prevStates;
    });
    setLocalTimeDisplay(format(currentDate, "yyyy-MM-dd HH:mm:ss.SSS (OOOO)"));
  }, [currentDate, formatFieldValue, isClient]);

  const handleInputChange = (fieldId: TimeFormat, value: string) => {
    setFieldStates((prev) => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], value, error: null },
    }));
    if (!currentDate && value.trim() === "") return; // Don't parse if currentDate not set and input is cleared

    let parsedDate: Date | null = null;
    try {
      switch (fieldId) {
        case "unixSeconds":
          parsedDate = fromUnixTime(Number(value));
          break;
        case "unixMilliseconds":
          parsedDate = new Date(Number(value));
          break;
        case "iso8601":
          parsedDate = parseISO(value);
          break;
        case "dateOnly": {
          const d = parse(value, "yyyy-MM-dd", new Date());
          if (isValid(d)) {
            const tempDate = currentDate ? new Date(currentDate) : new Date(0); // use epoch if no current date
            tempDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
            parsedDate = tempDate;
          }
          break;
        }
        case "timeOnly": {
          const t = parse(value, "HH:mm:ss", new Date());
          if (isValid(t)) {
            const tempDate = currentDate ? new Date(currentDate) : new Date(0);
            tempDate.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), 0);
            parsedDate = tempDate;
          }
          break;
        }
        case "isoWeek":
          parsedDate = parse(value, "yyyy-'W'II-i", new Date());
          break;
        case "http":
          parsedDate = new Date(value);
          if (!isValid(parsedDate) && value.trim() !== "") {
            const d = parse(value, "EEE, dd MMM yyyy HH:mm:ss zzz", new Date());
            if (isValid(d)) parsedDate = d;
          }
          break;
        case "sql":
          parsedDate = parse(value, "yyyy-MM-dd HH:mm:ss", new Date());
          break;
      }

      if (parsedDate && isValid(parsedDate)) {
        setCurrentDate(parsedDate);
      } else if (value.trim() !== "") {
        setFieldStates((prev) => ({
          ...prev,
          [fieldId]: { ...prev[fieldId], error: "Invalid format" },
        }));
      }
    } catch {
      if (value.trim() !== "") {
        setFieldStates((prev) => ({
          ...prev,
          [fieldId]: { ...prev[fieldId], error: "Invalid format" },
        }));
      }
    }
  };

  const handleSetToNow = () => setCurrentDate(new Date());

  const adjustTime = (
    operation: (date: Date, amount: number) => Date,
    amount: number,
  ) => {
    setCurrentDate((prevDate) => {
      if (!prevDate || !isValid(prevDate)) return new Date(); // Fallback if no valid date
      return operation(prevDate, amount);
    });
  };

  const tinkerButtonsConfig = [
    { label: "Year", addFn: addYears, subFn: subYears },
    { label: "Month", addFn: addMonths, subFn: subMonths },
    { label: "Day", addFn: addDays, subFn: subDays },
    { label: "Hour", addFn: addHours, subFn: subHours },
    { label: "Minute", addFn: addMinutes, subFn: subMinutes },
    { label: "Second", addFn: addSeconds, subFn: subSeconds },
  ];

  if (!isClient) {
    return (
      <div>
        <PageHeader
          title="Time Converter"
          description="Convert between various date/time formats."
          icon={Clock}
        />
        <Card>
          <CardContent className="p-6 text-center">
            Loading converter...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Time Converter"
        description="Convert between various date/time formats. All inputs are interactive."
        icon={Clock}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Controls & Local Time</CardTitle>
          <div className="flex flex-wrap gap-2 items-center mt-2">
            <Button onClick={handleSetToNow} variant="outline" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" /> Set to Current Time
            </Button>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-md">
            <Label className="text-sm font-medium">Current Local Time</Label>
            <p className="font-code text-lg">
              {localTimeDisplay || "Calculating..."}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-md font-semibold mb-2">Adjust Time</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {tinkerButtonsConfig.map((tb) => (
                <div key={tb.label} className="space-y-1">
                  <Label className="text-xs">{tb.label}</Label>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => adjustTime(tb.addFn, 1)}
                      variant="outline"
                      size="icon"
                      aria-label={`Add 1 ${tb.label}`}
                      className="h-8 w-8"
                    >
                      {" "}
                      <Plus className="h-4 w-4" />{" "}
                    </Button>
                    <Button
                      onClick={() => adjustTime(tb.subFn, 1)}
                      variant="outline"
                      size="icon"
                      aria-label={`Subtract 1 ${tb.label}`}
                      className="h-8 w-8"
                    >
                      {" "}
                      <Minus className="h-4 w-4" />{" "}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {Object.values(fieldStates).map((field) => (
              <div key={field.id} className="space-y-1">
                <Label
                  htmlFor={field.id}
                  className={field.error ? "text-destructive" : ""}
                >
                  {field.label}
                </Label>
                <Input
                  id={field.id}
                  type="text"
                  value={field.value}
                  placeholder={field.placeholder}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`font-code ${field.error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  aria-invalid={!!field.error}
                  aria-describedby={
                    field.error ? `${field.id}-error` : undefined
                  }
                  disabled={!currentDate && !field.value} // Disable if no date set yet, unless user is typing
                />
                {field.error && (
                  <p
                    id={`${field.id}-error`}
                    className="text-xs text-destructive flex items-center"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" /> {field.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
