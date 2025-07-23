"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from "lucide-react";

interface PasswordStrengthResult {
  score: number;
  level: "Very Weak" | "Weak" | "Medium" | "Strong" | "Very Strong" | "Ultra";
  suggestions: string[];
  percentage: number;
  colorClass: string;
  levelIcon: React.ElementType;
}

const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const calculatePasswordStrength = (
  password: string,
): PasswordStrengthResult => {
  let score = 0;
  const allPossibleSuggestions: string[] = [];
  const len = password.length;

  // 1. Length score and initial suggestions
  if (len === 0) {
    // No score, no suggestions yet; handled in level determination
  } else if (len < 8) {
    score += 0; // No points for very short
    allPossibleSuggestions.push(
      "Password is too short (minimum 8 characters recommended).",
    );
  } else if (len >= 8 && len <= 11) {
    score += 20;
    allPossibleSuggestions.push(
      "Consider making your password longer (12+ characters) for greater strength.",
    );
  } else if (len >= 12 && len <= 15) {
    score += 30;
    allPossibleSuggestions.push(
      "Consider making your password longer (16+ characters) for very strong strength.",
    );
  } else if (len >= 16 && len <= 19) {
    score += 40;
    allPossibleSuggestions.push(
      "Consider making it even longer (20+ characters) for ultra strength.",
    );
  } else {
    // len >= 20
    score += 50;
  }

  // 2. Character type checks and suggestions
  let typesCount = 0;
  if (/[a-z]/.test(password)) {
    score += 10;
    typesCount++;
  } else if (len > 0) {
    allPossibleSuggestions.push("Add lowercase letters (a-z).");
  }
  if (/[A-Z]/.test(password)) {
    score += 10;
    typesCount++;
  } else if (len > 0) {
    allPossibleSuggestions.push("Add uppercase letters (A-Z).");
  }
  if (/[0-9]/.test(password)) {
    score += 10;
    typesCount++;
  } else if (len > 0) {
    allPossibleSuggestions.push("Add numbers (0-9).");
  }
  if (
    new RegExp(`[${SYMBOLS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`).test(
      password,
    )
  ) {
    score += 10;
    typesCount++;
  } else if (len > 0) {
    allPossibleSuggestions.push("Add symbols (e.g., !@#$%^&*).");
  }

  // 3. Variety bonus
  if (typesCount === 2) score += 5;
  else if (typesCount === 3) score += 15;
  else if (typesCount === 4) score += 25;

  // 4. Pattern Penalties & suggestions
  const consecutiveCharPenalty = 10;
  const sequentialCharPenalty = 10;
  const repeatingSubstringPenalty = 15;

  let numConsecutiveGroups = 0;
  if (len > 0) {
    for (let i = 0; i < len - 2; i++) {
      if (
        password[i] === password[i + 1] &&
        password[i + 1] === password[i + 2]
      ) {
        numConsecutiveGroups++;
        i += 2;
      }
    }
    if (numConsecutiveGroups > 0) {
      score -= numConsecutiveGroups * consecutiveCharPenalty;
      allPossibleSuggestions.push(
        `Avoid using ${numConsecutiveGroups > 1 ? "multiple groups of " : ""}three or more identical characters in a row (e.g., "aaa", "111").`,
      );
    }

    let numSequentialGroups = 0;
    const sequences = [
      "abcdefghijklmnopqrstuvwxyz",
      "0123456789",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ];
    const lowerPassword = password.toLowerCase();
    for (let i = 0; i < len - 2; i++) {
      const sub = lowerPassword.substring(i, i + 3);
      let foundSequence = false;
      for (const seq of sequences) {
        if (
          seq.includes(sub) ||
          seq.split("").reverse().join("").includes(sub)
        ) {
          numSequentialGroups++;
          i += 2;
          foundSequence = true;
          break;
        }
      }
      if (foundSequence) continue;
    }
    if (numSequentialGroups > 0) {
      score -= numSequentialGroups * sequentialCharPenalty;
      allPossibleSuggestions.push(
        `Avoid using ${numSequentialGroups > 1 ? "multiple " : ""}sequences of three or more characters (e.g., "abc", "123").`,
      );
    }

    let numRepeatingSubstrings = 0;
    for (let subLen = 2; subLen <= Math.floor(len / 2); subLen++) {
      for (let i = 0; i <= len - 2 * subLen; i++) {
        const sub1 = password.substring(i, i + subLen);
        const sub2 = password.substring(i + subLen, i + 2 * subLen);
        if (sub1 === sub2) {
          numRepeatingSubstrings++;
          i += subLen * 2 - 1;
        }
      }
    }
    if (numRepeatingSubstrings > 0) {
      score -= numRepeatingSubstrings * repeatingSubstringPenalty;
      allPossibleSuggestions.push(
        `Avoid using ${numRepeatingSubstrings > 1 ? "multiple " : ""}repeating patterns (e.g., "patternpattern").`,
      );
    }
  }

  // 5. Determine level and curated suggestions
  let level: PasswordStrengthResult["level"];
  let colorClass: string;
  let levelIcon: React.ElementType;
  let finalDisplaySuggestions: string[] = [];
  let percentage = Math.min(100, Math.max(0, score));

  const hasPatternWarnings = allPossibleSuggestions.some((s) =>
    s.includes("Avoid using"),
  );
  const hasImprovementTips = allPossibleSuggestions.some(
    (s) =>
      !s.includes("Avoid using") &&
      !s.startsWith("Password is too short") &&
      !s.includes("even longer (20+ characters) for ultra strength"), // This specific tip is for Ultra, not an "issue" for Ultra itself
  );
  const isUltraScore = score > 110; // Max possible score with 20+ chars, all types, no penalties is 115

  if (len === 0) {
    level = "Very Weak";
    colorClass = "[&>div]:bg-muted";
    percentage = 0;
    levelIcon = AlertTriangle;
    finalDisplaySuggestions.push(
      "Start typing a password to see its strength.",
    );
  } else if (len < 8) {
    level = "Very Weak";
    colorClass = "[&>div]:bg-destructive";
    percentage = Math.max(5, percentage);
    levelIcon = XCircle;
    finalDisplaySuggestions.push(
      allPossibleSuggestions.find((s) =>
        s.startsWith("Password is too short"),
      ) ?? "Password is too short (minimum 8 characters recommended).",
    );
    finalDisplaySuggestions.push(
      ...allPossibleSuggestions.filter(
        (s) =>
          s.includes("Avoid using") && !s.startsWith("Password is too short"),
      ),
    );
  } else if (
    isUltraScore &&
    !hasPatternWarnings &&
    !hasImprovementTips &&
    typesCount === 4 &&
    len >= 20
  ) {
    // All positive criteria met, no patterns
    level = "Ultra";
    colorClass = "[&>div]:bg-purple-600";
    levelIcon = ShieldAlert;
    finalDisplaySuggestions.push("This is an exceptionally strong password!");
  } else if (
    isUltraScore &&
    (hasPatternWarnings || hasImprovementTips || typesCount < 4 || len < 20)
  ) {
    // High score, but not "perfect"
    level = "Very Strong"; // "Nearly Perfect" / Demoted Ultra
    colorClass = "[&>div]:bg-green-500";
    levelIcon = ShieldAlert; // Keep strong icon for high score
    finalDisplaySuggestions.push(
      "Excellent score! To reach 'Ultra' perfection, consider the following:",
    );
    const relevantTips = allPossibleSuggestions.filter(
      (s) => !s.startsWith("Password is too short"),
    );
    if (relevantTips.length > 0) {
      finalDisplaySuggestions.push(...relevantTips);
    } else if (len < 20) {
      // Should be caught by "even longer for ultra" if not present in allPossibleSuggestions
      finalDisplaySuggestions.push(
        "Ensure password is 20+ characters for Ultra strength.",
      );
    } else if (typesCount < 4) {
      finalDisplaySuggestions.push(
        "Ensure all character types (uppercase, lowercase, numbers, symbols) are used for Ultra strength.",
      );
    }
  } else if (score > 100) {
    // Natural Very Strong (score 101-110)
    level = "Very Strong";
    colorClass = "[&>div]:bg-green-500";
    levelIcon = CheckCircle2;
    finalDisplaySuggestions.push("This password appears to be very strong!");
    const ultraTips = allPossibleSuggestions.filter((s) =>
      s.includes("even longer (20+ characters) for ultra strength"),
    );
    const patternTips = allPossibleSuggestions.filter((s) =>
      s.includes("Avoid using"),
    );
    if (ultraTips.length > 0) finalDisplaySuggestions.push(...ultraTips);
    if (patternTips.length > 0) finalDisplaySuggestions.push(...patternTips);
    if (
      finalDisplaySuggestions.length === 1 &&
      len < 20 &&
      !allPossibleSuggestions.some((s) => s.includes("ultra strength"))
    ) {
      finalDisplaySuggestions.push(
        "For 'Ultra' strength, ensure it's 20+ characters, includes all character types, and has no pattern warnings.",
      );
    }
  } else if (score > 80) {
    // Strong (81-100)
    level = "Strong";
    colorClass = "[&>div]:bg-sky-500";
    levelIcon = CheckCircle2;
    finalDisplaySuggestions = allPossibleSuggestions.filter(
      (s) => !s.startsWith("Password is too short"),
    );
  } else if (score > 60) {
    // Medium (61-80)
    level = "Medium";
    colorClass = "[&>div]:bg-yellow-500";
    levelIcon = AlertTriangle;
    finalDisplaySuggestions = allPossibleSuggestions.filter(
      (s) => !s.startsWith("Password is too short"),
    );
  } else if (score > 40) {
    // Weak (41-60, len >= 8)
    level = "Weak";
    colorClass = "[&>div]:bg-orange-500";
    levelIcon = AlertTriangle;
    finalDisplaySuggestions = allPossibleSuggestions.filter(
      (s) => !s.startsWith("Password is too short"),
    );
  } else {
    // Very Weak (score <= 40, len >= 8)
    level = "Very Weak";
    colorClass = "[&>div]:bg-destructive";
    levelIcon = XCircle;
    finalDisplaySuggestions = allPossibleSuggestions.filter(
      (s) => !s.startsWith("Password is too short"),
    );
  }

  if (
    len >= 8 &&
    finalDisplaySuggestions.length === 0 &&
    !["Ultra", "Very Strong"].includes(level)
  ) {
    finalDisplaySuggestions.push(
      "Consider adding more character types (uppercase, lowercase, numbers, symbols) and increasing length.",
    );
  }

  // Clean up redundant "make longer" suggestions
  finalDisplaySuggestions = [...new Set(finalDisplaySuggestions)]; // Deduplicate first
  if (finalDisplaySuggestions.some((s) => s.includes("ultra strength"))) {
    finalDisplaySuggestions = finalDisplaySuggestions.filter(
      (s) =>
        !s.match(
          /longer \(\d+\+ characters\) for (greater|very strong) strength/,
        ),
    );
  } else if (
    finalDisplaySuggestions.some((s) => s.includes("very strong strength"))
  ) {
    finalDisplaySuggestions = finalDisplaySuggestions.filter(
      (s) => !s.includes("longer (+ characters) for greater strength"),
    );
  }
  finalDisplaySuggestions = [...new Set(finalDisplaySuggestions)]; // Deduplicate again after filtering

  return {
    score,
    level,
    suggestions: finalDisplaySuggestions,
    percentage,
    colorClass,
    levelIcon,
  };
};

export default function PasswordStrengthMeterPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordStrengthResult | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setStrength(calculatePasswordStrength(""));
  }, []);

  useEffect(() => {
    if (isClient) {
      setStrength(calculatePasswordStrength(password));
    }
  }, [password, isClient]);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const getAlertTitle = (): string => {
    if (!strength || password.length === 0) return "Password Check";
    if (strength.level === "Ultra") return "Exceptional Strength!";
    if (strength.level === "Very Strong") {
      if (
        strength.suggestions.some((s) =>
          s.startsWith("Excellent score! To reach 'Ultra'"),
        )
      )
        return "Nearly Perfect!";
      return "Excellent!";
    }
    return "Suggestions for a stronger password";
  };

  return (
    <div>
      <PageHeader
        title="Password Strength Meter"
        description="Analyze the strength of your password and get suggestions for improvement."
        icon={ShieldCheck}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Enter Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="passwordInput">Password</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="passwordInput"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type your password here"
                className="font-code"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={toggleShowPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {isClient && strength && (
            <div className="space-y-3">
              <Progress
                value={strength.percentage}
                className={strength.colorClass}
                aria-label={`Password strength: ${strength.level}`}
              />
              <div className="flex items-center space-x-2">
                <strength.levelIcon
                  className={`h-5 w-5 ${
                    strength.level === "Very Weak"
                      ? "text-destructive"
                      : strength.level === "Weak"
                        ? "text-orange-500"
                        : strength.level === "Medium"
                          ? "text-yellow-500"
                          : strength.level === "Strong"
                            ? "text-sky-500"
                            : strength.level === "Very Strong"
                              ? "text-green-500"
                              : strength.level === "Ultra"
                                ? "text-purple-600"
                                : "text-muted-foreground"
                  }`}
                />
                <p className="text-sm font-medium">
                  Strength:{" "}
                  <span
                    className={`font-semibold ${
                      strength.level === "Very Weak"
                        ? "text-destructive"
                        : strength.level === "Weak"
                          ? "text-orange-500"
                          : strength.level === "Medium"
                            ? "text-yellow-500"
                            : strength.level === "Strong"
                              ? "text-sky-500"
                              : strength.level === "Very Strong"
                                ? "text-green-500"
                                : strength.level === "Ultra"
                                  ? "text-purple-600"
                                  : "text-muted-foreground"
                    }`}
                  >
                    {strength.level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    (Score: {strength.score})
                  </span>
                </p>
              </div>
            </div>
          )}

          {isClient && strength && strength.suggestions.length > 0 && (
            <Alert
              variant={
                strength.level === "Very Weak" ||
                (strength.level === "Weak" &&
                  password.length > 0 &&
                  strength.score <= 60)
                  ? "destructive"
                  : "default"
              }
              className={
                strength.level === "Ultra" && password.length > 0
                  ? "border-purple-500"
                  : strength.level === "Very Strong" && password.length > 0
                    ? "border-green-500"
                    : strength.level === "Strong" && password.length > 0
                      ? "border-sky-500"
                      : strength.level === "Medium" && password.length > 0
                        ? "border-yellow-500"
                        : ""
              }
            >
              <strength.levelIcon className="h-4 w-4" />
              <AlertTitle>{getAlertTitle()}</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {strength.suggestions.map((suggestion) => (
                    <li key={suggestion}>{suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
