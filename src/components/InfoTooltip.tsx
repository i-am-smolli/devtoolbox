import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type React from "react";

type InfoTooltipProps = {
  children: React.ReactNode;
};

export function InfoTooltip({ children }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="ml-1 cursor-help text-muted-foreground">
          <Info className="inline h-4 w-4" aria-label="More info" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}
