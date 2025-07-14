"use client";

import React from "react";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { KeyRound, Copy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Metadata is now handled by layout.tsx

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;
const DEFAULT_LENGTH = 16;

export default function SecurePasswordGeneratorPage() {
  const [passwordLength, setPasswordLength] = useState<number>(DEFAULT_LENGTH);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGeneratePassword = () => {
    setError(null);
    if (passwordLength < MIN_LENGTH || passwordLength > MAX_LENGTH) {
      setError(
        `Password length must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`,
      );
      setGeneratedPassword("");
      return;
    }

    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let charSet = "";
    if (includeUppercase) charSet += uppercaseChars;
    if (includeLowercase) charSet += lowercaseChars;
    if (includeNumbers) charSet += numberChars;
    if (includeSymbols) charSet += symbolChars;

    if (charSet === "") {
      setError("Please select at least one character type.");
      setGeneratedPassword("");
      return;
    }

    let newPassword = "";
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * charSet.length);
      newPassword += charSet[randomIndex];
    }
    setGeneratedPassword(newPassword);
  };

  const handleCopyToClipboard = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast({
        title: "Password Copied!",
        description:
          "The generated password has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy password to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Secure Password Generator"
        description="Create strong, random passwords with customizable options."
        icon={KeyRound}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generator Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="passwordLength">
              Password Length (min {MIN_LENGTH}, max {MAX_LENGTH})
            </Label>
            <Input
              id="passwordLength"
              type="number"
              value={passwordLength}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  setPasswordLength(val);
                } else if (e.target.value === "") {
                  setPasswordLength(0); // Allow clearing, handle validation on generate
                }
              }}
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              className="font-code"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeUppercase"
                checked={includeUppercase}
                onCheckedChange={(checked) => setIncludeUppercase(!!checked)}
              />
              <Label htmlFor="includeUppercase" className="cursor-pointer">
                Include Uppercase (A-Z)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeLowercase"
                checked={includeLowercase}
                onCheckedChange={(checked) => setIncludeLowercase(!!checked)}
              />
              <Label htmlFor="includeLowercase" className="cursor-pointer">
                Include Lowercase (a-z)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeNumbers"
                checked={includeNumbers}
                onCheckedChange={(checked) => setIncludeNumbers(!!checked)}
              />
              <Label htmlFor="includeNumbers" className="cursor-pointer">
                Include Numbers (0-9)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeSymbols"
                checked={includeSymbols}
                onCheckedChange={(checked) => setIncludeSymbols(!!checked)}
              />
              <Label htmlFor="includeSymbols" className="cursor-pointer">
                Include Symbols (!@#$...)
              </Label>
            </div>
          </div>

          <Button onClick={handleGeneratePassword} className="w-full sm:w-auto">
            Generate Password
          </Button>

          {isClient && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isClient && generatedPassword && !error && (
            <div className="space-y-2">
              <Label htmlFor="generatedPassword">Generated Password</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="generatedPassword"
                  type="text"
                  value={generatedPassword}
                  readOnly
                  className="font-code bg-muted/50 grow"
                  aria-label="Generated password"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyToClipboard}
                  aria-label="Copy password"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
