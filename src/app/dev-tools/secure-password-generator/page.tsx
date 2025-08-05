"use client";

import { AlertCircle, Copy, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;
const DEFAULT_LENGTH = 16;

export default function SecurePasswordGeneratorPage() {
  const [passwordLength, setPasswordLength] = useState<number>(DEFAULT_LENGTH);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [symbolFormat, setSymbolFormat] = useState<string>("default");
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
    const symbolCharsWeak = "_+-=,.";
    const symbolCharsMedium = "!@#$%_+-=";
    const symbolCharsStrong = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let charSet = "";
    if (includeUppercase) charSet += uppercaseChars;
    if (includeLowercase) charSet += lowercaseChars;
    if (includeNumbers) charSet += numberChars;

    switch (symbolFormat) {
      case "weak":
        charSet += symbolCharsWeak;
        break;
      case "default":
        charSet += symbolCharsMedium;
        break;
      case "strong":
        charSet += symbolCharsStrong;
        break;
      case "none":
        // No symbols added, charSet remains unchanged
        break;
    }

    if (charSet === "") {
      setError("Please select at least one character type.");
      setGeneratedPassword("");
      return;
    }

    let newPassword = "";

    function getSecureRandomInt(max: number): number {
      if (max <= 0 || max > 0x7fffffff) throw new Error("Invalid max value");
      const uint32Max = 0xffffffff;
      const limit = uint32Max - (uint32Max % max);
      let rand: number;
      do {
        const arr = new Uint32Array(1);
        window.crypto.getRandomValues(arr);
        rand = arr[0];
      } while (rand >= limit);
      return rand % max;
    }

    // Helper to check if password contains at least one char from each selected type
    function isValidPassword(pw: string) {
      if (includeUppercase && !/[A-Z]/.test(pw)) return false;
      if (includeLowercase && !/[a-z]/.test(pw)) return false;
      if (includeNumbers && !/[0-9]/.test(pw)) return false;
      if (symbolFormat !== "none") {
        let symbolRegex: RegExp | undefined;
        switch (symbolFormat) {
          case "weak":
            symbolRegex = new RegExp(
              `[${symbolCharsWeak.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}]`,
            );
            break;
          case "default":
            symbolRegex = new RegExp(
              `[${symbolCharsMedium.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}]`,
            );
            break;
          case "strong":
            symbolRegex = new RegExp(
              `[${symbolCharsStrong.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}]`,
            );
            break;
        }
        if (symbolRegex && !symbolRegex.test(pw)) return false;
      }
      return true;
    }

    let attempts = 0;
    const maxAttempts = 10;
    do {
      newPassword = "";
      for (let i = 0; i < passwordLength; i++) {
        const randomIndex = getSecureRandomInt(charSet.length);
        newPassword += charSet[randomIndex];
      }
      attempts++;
    } while (!isValidPassword(newPassword) && attempts < maxAttempts);

    if (!isValidPassword(newPassword)) {
      setError(
        "Could not generate a password with the selected options. Try adjusting your settings.",
      );
      setGeneratedPassword("");
      return;
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
                if (!Number.isNaN(val)) {
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
            <div className="space-y-1">
              <Label htmlFor="symbolFormat">
                Include Symbols
                <InfoTooltip>
                  Choose the type of symbols to include in the password.
                  <ul className="list-disc pl-5">
                    <li>
                      <strong>Default set:</strong> !@#$%_+-=
                    </li>
                    <li>
                      <strong>Strong set:</strong> !@#$%^&*()_+-=[]{}
                      |;:,.&lt;&gt;?
                    </li>
                    <li>
                      <strong>Weak set:</strong> _+-=,. (less secure)
                    </li>
                    <li>
                      <strong>None:</strong> No symbols included (not
                      recommended)
                    </li>
                  </ul>
                </InfoTooltip>
              </Label>
              <Select value={symbolFormat} onValueChange={setSymbolFormat}>
                <SelectTrigger id="symbolFormat">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Medium</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                  <SelectItem value="weak">Weak</SelectItem>
                  <SelectItem value="none">None, unsecure</SelectItem>
                </SelectContent>
              </Select>
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
