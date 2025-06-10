"use client";

import { useState, useEffect } from "react";
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
import { Shuffle, Copy, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MIN_LENGTH = 1;
const MAX_LENGTH = 2048;
const DEFAULT_LENGTH = 16;

const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
const NUMBER_CHARS = "0123456789";
const SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export default function RandomStringGeneratorPage() {
  const [length, setLength] = useState<number>(DEFAULT_LENGTH);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [generatedString, setGeneratedString] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Generate an initial string on load
    handleGenerateString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // Only run on client mount

  const handleGenerateString = () => {
    if (!isClient) return;
    setError(null);
    setGeneratedString("");
    setIsLoading(true);

    if (isNaN(length) || length < MIN_LENGTH || length > MAX_LENGTH) {
      setError(`Length must be between ${MIN_LENGTH} and ${MAX_LENGTH}.`);
      setIsLoading(false);
      return;
    }

    let charPool = "";
    if (includeUppercase) charPool += UPPERCASE_CHARS;
    if (includeLowercase) charPool += LOWERCASE_CHARS;
    if (includeNumbers) charPool += NUMBER_CHARS;
    if (includeSymbols) charPool += SYMBOL_CHARS;

    if (charPool === "") {
      setError("Please select at least one character type to include.");
      setIsLoading(false);
      return;
    }

    let result = "";
    // For better randomness, especially for security-sensitive contexts,
    // window.crypto.getRandomValues would be preferred.
    // For a general utility tool, Math.random is usually sufficient.
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charPool.length);
      result += charPool[randomIndex];
    }

    // Simulate slight delay for UX
    setTimeout(() => {
      setGeneratedString(result);
      setIsLoading(false);
    }, 100);
  };

  const handleCopyToClipboard = async () => {
    if (!generatedString) return;
    try {
      await navigator.clipboard.writeText(generatedString);
      toast({
        title: "String Copied!",
        description: "The random string has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy string.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="Random String Generator"
        description="Generate random strings with customizable length and character sets."
        icon={Shuffle}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="stringLength">
              String Length ({MIN_LENGTH}-{MAX_LENGTH})
            </Label>
            <Input
              id="stringLength"
              type="number"
              value={length}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setLength(isNaN(val) ? 0 : val); // Allow clearing, validate on generate
              }}
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              className="w-full sm:w-[120px] font-code"
            />
          </div>

          <div className="space-y-3">
            <Label className="block font-medium">
              Include Character Types:
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeUppercase"
                  checked={includeUppercase}
                  onCheckedChange={(checked) => setIncludeUppercase(!!checked)}
                />
                <Label htmlFor="includeUppercase" className="cursor-pointer">
                  Uppercase (A-Z)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeLowercase"
                  checked={includeLowercase}
                  onCheckedChange={(checked) => setIncludeLowercase(!!checked)}
                />
                <Label htmlFor="includeLowercase" className="cursor-pointer">
                  Lowercase (a-z)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeNumbers"
                  checked={includeNumbers}
                  onCheckedChange={(checked) => setIncludeNumbers(!!checked)}
                />
                <Label htmlFor="includeNumbers" className="cursor-pointer">
                  Numbers (0-9)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSymbols"
                  checked={includeSymbols}
                  onCheckedChange={(checked) => setIncludeSymbols(!!checked)}
                />
                <Label htmlFor="includeSymbols" className="cursor-pointer">
                  Symbols (!@#$...)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenerateString}
            disabled={isLoading || !isClient}
          >
            {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Generating..." : "Generate String"}
          </Button>
        </CardFooter>
      </Card>

      {isClient && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isClient && generatedString && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Generated String</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              value={generatedString}
              readOnly
              className="font-code bg-muted/50 text-base"
              aria-label="Generated random string"
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              disabled={!generatedString}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy String
            </Button>
          </CardFooter>
        </Card>
      )}

      {isClient && !isLoading && !generatedString && !error && (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Configure options and click "Generate String". An initial string
              is generated on load.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
