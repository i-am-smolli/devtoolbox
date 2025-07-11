import type { LucideIcon } from "lucide-react";
import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        {Icon && <Icon className="h-8 w-8 text-primary" aria-hidden="true" />}
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {description && (
        <p className="text-lg text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
