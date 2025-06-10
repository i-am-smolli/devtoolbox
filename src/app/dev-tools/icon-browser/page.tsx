"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  icons as lucideIconCollection,
  Search,
  Copy,
  Sparkles,
  Grid,
  MousePointerSquareDashed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/hooks/use-toast";

const allLucideIcons: { name: string; component: LucideIcon }[] =
  Object.entries(lucideIconCollection)
    .map(([name, component]) => ({ name, component: component as LucideIcon }))
    .sort((a, b) => a.name.localeCompare(b.name));

export default function IconBrowserPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<{
    name: string;
    component: LucideIcon;
  } | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const selectedIconPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) {
      return allLucideIcons;
    }
    return allLucideIcons.filter((icon) =>
      icon.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
    );
  }, [searchTerm]);

  const handleIconClick = (icon: { name: string; component: LucideIcon }) => {
    setSelectedIcon(icon);
    // Scroll behavior is now handled by useEffect
  };

  useEffect(() => {
    if (selectedIcon && selectedIconPanelRef.current) {
      selectedIconPanelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIcon]); // Trigger effect when selectedIcon changes

  const handleCopyToClipboard = async (text: string, type: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${type} Copied!`,
        description: `The ${type.toLowerCase()} has been copied to your clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: `Could not copy ${type.toLowerCase()} to clipboard.`,
        variant: "destructive",
      });
    }
  };

  const IconDisplay = ({
    icon,
    onClick,
    isSelected,
  }: {
    icon: { name: string; component: LucideIcon };
    onClick: () => void;
    isSelected: boolean;
  }) => {
    const IconComponent = icon.component;
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${isSelected ? "ring-2 ring-primary bg-primary/10" : ""}`}
        aria-label={`Select icon ${icon.name}`}
        title={icon.name}
      >
        <IconComponent size={28} className="mb-1.5" />
        <span className="text-xs text-center truncate w-full block">
          {icon.name}
        </span>
      </button>
    );
  };

  const searchPlaceholder = useMemo(() => {
    if (!isClient) return "Loading icons...";
    return `Search ${allLucideIcons.length} icons...`;
  }, [isClient, allLucideIcons.length]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Lucide Icon Browser"
        description={
          isClient
            ? `Browse and search through ${allLucideIcons.length} Lucide icons.`
            : "Browse and search Lucide icons."
        }
        icon={Sparkles}
      />

      <div className="grid md:grid-cols-3 gap-6 flex-grow min-h-0">
        <Card className="md:col-span-2 flex flex-col min-h-0">
          <CardHeader className="p-4">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              aria-label="Search icons"
            />
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0 overflow-hidden">
            {isClient && filteredIcons.length === 0 && searchTerm.trim() && (
              <div className="text-center text-muted-foreground py-10">
                No icons found for "{searchTerm}".
              </div>
            )}
            {isClient &&
              filteredIcons.length === 0 &&
              !searchTerm.trim() &&
              allLucideIcons.length > 0 && (
                <div className="text-center text-muted-foreground py-10">
                  Enter a search term to filter icons.
                </div>
              )}
            {isClient && !filteredIcons.length && !allLucideIcons.length && (
              <div className="text-center text-muted-foreground py-10">
                Loading icon list...
              </div>
            )}
            {isClient && filteredIcons.length > 0 && (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                  {filteredIcons.map((icon) => (
                    <IconDisplay
                      key={icon.name}
                      icon={icon}
                      onClick={() => handleIconClick(icon)}
                      isSelected={selectedIcon?.name === icon.name}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card
          ref={selectedIconPanelRef}
          className="md:col-span-1 flex flex-col min-h-0 sticky top-6 self-start"
        >
          <CardHeader className="p-4">
            <CardTitle className="font-headline text-lg">
              Selected Icon
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center p-4 text-center space-y-3">
            {isClient && selectedIcon ? (
              <>
                <selectedIcon.component
                  size={56}
                  className="text-primary mb-2"
                />
                <p className="text-base font-semibold">{selectedIcon.name}</p>
                <div className="space-y-2 w-full max-w-xs">
                  <Button
                    onClick={() =>
                      handleCopyToClipboard(selectedIcon.name, "Icon Name")
                    }
                    variant="outline"
                    className="w-full text-sm"
                    size="sm"
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Name
                  </Button>
                  <Button
                    onClick={() =>
                      handleCopyToClipboard(
                        `import { ${selectedIcon.name} } from 'lucide-react';`,
                        "Import Statement",
                      )
                    }
                    variant="outline"
                    className="w-full text-sm"
                    size="sm"
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Import
                  </Button>
                </div>
                <CardDescription className="text-xs pt-2">
                  Pass props like{" "}
                  <code className="bg-muted/70 text-accent-foreground px-1 py-0.5 rounded font-code">
                    size
                  </code>
                  ,{" "}
                  <code className="bg-muted/70 text-accent-foreground px-1 py-0.5 rounded font-code">
                    color
                  </code>
                  ,{" "}
                  <code className="bg-muted/70 text-accent-foreground px-1 py-0.5 rounded font-code">
                    strokeWidth
                  </code>
                  .
                </CardDescription>
              </>
            ) : (
              <div className="text-muted-foreground">
                {isClient ? (
                  <>
                    <MousePointerSquareDashed
                      size={40}
                      className="mb-2 mx-auto opacity-50"
                    />
                    <p className="text-sm">Select an icon to see details.</p>
                  </>
                ) : (
                  <p className="text-sm">Loading details panel...</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
