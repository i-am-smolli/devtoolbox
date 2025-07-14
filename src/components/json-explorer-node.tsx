"use client";

import React from "react";
import type { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JsonExplorerNodeProps {
  data: unknown;
  name?: string;
  defaultOpen?: boolean;
  isRoot?: boolean;
}

const getNodeType = (
  value: unknown,
):
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "undefined"
  | "function"
  | "symbol"
  | "bigint" => {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value as
    | "object"
    | "array"
    | "string"
    | "number"
    | "boolean"
    | "undefined"
    | "function"
    | "symbol"
    | "bigint";
};

const JsonExplorerNode: FC<JsonExplorerNodeProps> = ({
  data,
  name,
  defaultOpen = false,
  isRoot = false,
}) => {
  const type = getNodeType(data);

  if (type === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    const triggerContent = (
      <>
        {name && (
          <span className="font-semibold mr-1 truncate max-w-48 inline-block">
            {name}:
          </span>
        )}
        <span className="mr-1">{"{"}</span>
        <Badge variant="secondary" className="mr-1">
          {entries.length} {entries.length === 1 ? "key" : "keys"}
        </Badge>
        {"}"}
      </>
    );

    if (entries.length === 0) {
      return (
        <div className="ml-0.5 py-1 px-2 text-sm text-muted-foreground">
          {name ? (
            <>
              <span className="font-semibold mr-1 break-words">{name}:</span>
              <span>{"{ }"}</span>
            </>
          ) : (
            "{ }"
          )}
        </div>
      );
    }

    return (
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={isRoot || defaultOpen ? "item" : undefined}
      >
        <AccordionItem value="item" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-1 px-2 rounded hover:bg-muted/50 text-sm font-normal justify-start gap-1">
            {triggerContent}
          </AccordionTrigger>
          <AccordionContent className="pl-4 border-l border-dashed ml-2.5 relative">
            <div className="absolute left-0 top-0 w-px h-full"></div>
            {entries.map(([key, value]) => (
              <JsonExplorerNode key={key} name={key} data={value} />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  } else if (type === "array") {
    const arr = data as unknown[];
    const triggerContent = (
      <>
        {name && (
          <span className="font-semibold mr-1 truncate max-w-48 inline-block">
            {name}:
          </span>
        )}
        <span className="mr-1">{"["}</span>
        <Badge variant="secondary" className="mr-1">
          {arr.length} {arr.length === 1 ? "item" : "items"}
        </Badge>
        {"]"}
      </>
    );
    if (arr.length === 0) {
      return (
        <div className="ml-0.5 py-1 px-2 text-sm text-muted-foreground">
          {name ? (
            <>
              <span className="font-semibold mr-1 break-words">{name}:</span>
              <span>{"[ ]"}</span>
            </>
          ) : (
            "[ ]"
          )}
        </div>
      );
    }

    return (
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={isRoot || defaultOpen ? "item" : undefined}
      >
        <AccordionItem value="item" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-1 px-2 rounded hover:bg-muted/50 text-sm font-normal justify-start gap-1">
            {triggerContent}
          </AccordionTrigger>
          <AccordionContent className="pl-4 border-l border-dashed ml-2.5 relative">
            <div className="absolute left-0 top-0 w-px h-full"></div>
            {arr.map((item, index) => (
              <JsonExplorerNode
                key={index}
                name={`Index ${index}`}
                data={item}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  let valueDisplay;
  let valueClass = "text-sm"; // Base class, removed break-all
  switch (type) {
    case "string":
      valueDisplay = `"${data}"`;
      valueClass = cn(valueClass, "text-accent break-words"); // Added break-words for strings
      break;
    case "number":
      valueDisplay = String(data);
      valueClass = cn(valueClass, "text-primary"); // Numbers usually don't need specific break, but could add break-all if very long ones are common
      break;
    case "boolean":
      valueDisplay = data ? "true" : "false";
      valueClass = cn(valueClass, "text-secondary-foreground font-medium");
      break;
    case "null":
      valueDisplay = "null";
      valueClass = cn(valueClass, "text-muted-foreground italic");
      break;
    default:
      valueDisplay = String(data);
  }

  return (
    <div className="flex items-start py-1 px-2 text-sm ml-0.5">
      {name && (
        <span className="font-semibold mr-1 shrink-0 break-words">{name}:</span>
      )}
      <span className={valueClass}>{valueDisplay}</span>
    </div>
  );
};

export default JsonExplorerNode;
