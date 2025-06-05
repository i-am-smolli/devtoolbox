
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Eye, EyeOff, AlertTriangle, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

interface PasswordStrengthResult {
  score: number; // Can be negative due to penalties, but visually capped 0-115+ for levels
  level: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong' | 'Ultra';
  suggestions: string[];
  percentage: number; // For progress bar, 0-100
  colorClass: string;
  levelIcon: React.ElementType;
}

const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;
  const suggestions: string[] = [];
  const len = password.length;

  // Length score
  if (len < 8) {
    score += 0; 
  } else if (len >= 8 && len <= 11) {
    score += 20;
  } else if (len >= 12 && len <= 15) {
    score += 30;
  } else if (len >= 16 && len <= 19) {
    score += 40;
  } else if (len >= 20) {
    score += 50; 
  }

  let typesCount = 0;
  // Character type checks
  if (/[a-z]/.test(password)) {
    score += 10;
    typesCount++;
  } else {
    suggestions.push("Add lowercase letters (a-z).");
  }

  if (/[A-Z]/.test(password)) {
    score += 10;
    typesCount++;
  } else {
    suggestions.push("Add uppercase letters (A-Z).");
  }

  if (/[0-9]/.test(password)) {
    score += 10;
    typesCount++;
  } else {
    suggestions.push("Add numbers (0-9).");
  }

  if (new RegExp(`[${SYMBOLS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
    score += 10;
    typesCount++;
  } else {
    suggestions.push("Add symbols (e.g., !@#$%^&*).");
  }

  // Variety bonus
  if (typesCount === 2) score += 5;
  else if (typesCount === 3) score += 15;
  else if (typesCount === 4) score += 25;
  
  // Pattern Penalties
  const consecutiveCharPenalty = 10;
  const sequentialCharPenalty = 10;
  const repeatingSubstringPenalty = 15;

  let numConsecutiveGroups = 0;
  if (len > 0) {
    for (let i = 0; i < len - 2; i++) {
      if (password[i] === password[i+1] && password[i+1] === password[i+2]) {
        numConsecutiveGroups++;
        // Move i past the current detected group to avoid re-penalizing parts of it.
        // e.g., for "aaaa", penalize "aaa" once, then next check starts after "aaa".
        i += 2; 
      }
    }
    if (numConsecutiveGroups > 0) {
      score -= numConsecutiveGroups * consecutiveCharPenalty;
      suggestions.push(`Avoid using ${numConsecutiveGroups > 1 ? 'multiple groups of ' : ''}three or more identical characters in a row (e.g., "aaa", "111").`);
    }

    let numSequentialGroups = 0;
    const sequences = [
      "abcdefghijklmnopqrstuvwxyz",
      "0123456789",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ" 
    ];
    const lowerPassword = password.toLowerCase(); // Check sequences case-insensitively for simplicity

    for (let i = 0; i < len - 2; i++) {
      const sub = lowerPassword.substring(i, i + 3);
      let foundSequence = false;
      for (const seq of sequences) {
        if (seq.includes(sub) || seq.split('').reverse().join('').includes(sub)) {
          numSequentialGroups++;
          i += 2; // Move past this 3-char sequence
          foundSequence = true;
          break; 
        }
      }
      if (foundSequence) continue;
    }
    if (numSequentialGroups > 0) {
      score -= numSequentialGroups * sequentialCharPenalty;
      suggestions.push(`Avoid using ${numSequentialGroups > 1 ? 'multiple ' : ''}sequences of three or more characters (e.g., "abc", "123").`);
    }

    let numRepeatingSubstrings = 0;
    // Check for repeating substrings like "abcabc" (non-overlapping)
    for (let subLen = 2; subLen <= Math.floor(len / 2); subLen++) {
        for (let i = 0; i <= len - (2 * subLen); i++) {
            const sub1 = password.substring(i, i + subLen);
            const sub2 = password.substring(i + subLen, i + (2 * subLen));
            if (sub1 === sub2) {
                numRepeatingSubstrings++;
                i += (subLen * 2) - 1; // Advance past the full detected pattern
            }
        }
    }
    if (numRepeatingSubstrings > 0) {
        score -= numRepeatingSubstrings * repeatingSubstringPenalty;
        suggestions.push(`Avoid using ${numRepeatingSubstrings > 1 ? 'multiple ' : ''}repeating patterns (e.g., "patternpattern").`);
    }
  }

  // Determine level and color
  let level: PasswordStrengthResult['level'];
  let colorClass: string;
  let levelIcon: React.ElementType;
  // Percentage for progress bar is capped 0-100, actual score can be different
  let percentage = Math.min(100, Math.max(0, score)); 

  if (len === 0) {
    level = 'Very Weak';
    colorClass = '[&>div]:bg-muted';
    percentage = 0;
    levelIcon = AlertTriangle;
    suggestions.length = 0;
    suggestions.push("Start typing a password to see its strength.");
  } else if (len < 8) {
    level = 'Very Weak';
    colorClass = '[&>div]:bg-destructive';
    percentage = Math.max(5, percentage); // Show a sliver for short passwords
    levelIcon = XCircle;
    if (!suggestions.includes("Password is too short (minimum 8 characters recommended).")) {
        suggestions.unshift("Password is too short (minimum 8 characters recommended).");
    }
  } else if (score <= 40) {
    level = 'Very Weak';
    colorClass = '[&>div]:bg-destructive';
    levelIcon = XCircle;
  } else if (score <= 60) {
    level = 'Weak';
    colorClass = '[&>div]:bg-orange-500';
    levelIcon = AlertTriangle;
  } else if (score <= 80) {
    level = 'Medium';
    colorClass = '[&>div]:bg-yellow-500';
    levelIcon = AlertTriangle;
  } else if (score <= 100) {
    level = 'Strong';
    colorClass = '[&>div]:bg-sky-500';
    levelIcon = CheckCircle2;
  } else if (score <= 110) { 
    level = 'Very Strong';
    colorClass = '[&>div]:bg-green-500';
    levelIcon = CheckCircle2;
  } else { // score > 110
    level = 'Ultra';
    colorClass = '[&>div]:bg-purple-600'; 
    levelIcon = ShieldAlert; 
  }
  
  // Additional suggestions based on overall score and length AFTER penalties
  if (level !== 'Ultra' && level !== 'Very Strong' && len > 0 && len < 12 && score >= 50 && typesCount < 4) {
     if (!suggestions.some(s => s.includes("longer"))) {
        suggestions.push("Consider making your password longer (12+ characters) for greater strength.");
     }
  }
  
  // Refine suggestions based on final level
  if (level === 'Ultra') {
    const patternSuggestions = suggestions.filter(s => s.includes("Avoid using"));
    suggestions.length = 0;
    suggestions.push("This is an exceptionally strong password!");
    if (patternSuggestions.length > 0) {
      suggestions.push(...patternSuggestions); // Keep pattern warnings if any
    }
  } else if (level === 'Very Strong') {
    const patternSuggestions = suggestions.filter(s => s.includes("Avoid using"));
    const onlyLengthSuggestion = suggestions.every(s => s.startsWith("Consider making it even longer") || s.includes("Avoid using"));
    
    if (suggestions.filter(s => !s.startsWith("Consider making") && !s.includes("Avoid using")).length === 0 && len >=12) {
        suggestions.length = 0;
        suggestions.push("This password appears to be very strong!");
        if (len < 20 && !suggestions.some(s => s.includes("longer"))) {
             suggestions.push("For ultra strength, consider making it even longer (20+ characters).");
        }
        if (patternSuggestions.length > 0) {
          suggestions.push(...patternSuggestions); // Keep pattern warnings
        }
    }
  } else if (len > 0 && len < 8 && level === 'Very Weak' && !suggestions.includes("Password is too short (minimum 8 characters recommended).")) {
     suggestions.unshift("Password is too short (minimum 8 characters recommended).");
  }


  return { score, level, suggestions, percentage, colorClass, levelIcon };
};

export default function PasswordStrengthMeterPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordStrengthResult | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setStrength(calculatePasswordStrength('')); // Calculate for empty string on mount
  }, []);

  useEffect(() => {
    if (isClient) {
        setStrength(calculatePasswordStrength(password));
    }
  }, [password, isClient]);

  const toggleShowPassword = () => setShowPassword(!showPassword);

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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type your password here"
                className="font-code"
              />
              <Button variant="outline" size="icon" onClick={toggleShowPassword} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {isClient && strength && (
            <div className="space-y-3">
              <Progress value={strength.percentage} className={strength.colorClass} aria-label={`Password strength: ${strength.level}`} />
              <div className="flex items-center space-x-2">
                <strength.levelIcon className={`h-5 w-5 ${
                    strength.level === 'Very Weak' ? 'text-destructive' :
                    strength.level === 'Weak' ? 'text-orange-500' :
                    strength.level === 'Medium' ? 'text-yellow-500' :
                    strength.level === 'Strong' ? 'text-sky-500' :
                    strength.level === 'Very Strong' ? 'text-green-500' :
                    strength.level === 'Ultra' ? 'text-purple-600' : 'text-muted-foreground'
                }`} />
                <p className="text-sm font-medium">
                  Strength: <span className={`font-semibold ${
                    strength.level === 'Very Weak' ? 'text-destructive' :
                    strength.level === 'Weak' ? 'text-orange-500' :
                    strength.level === 'Medium' ? 'text-yellow-500' :
                    strength.level === 'Strong' ? 'text-sky-500' :
                    strength.level === 'Very Strong' ? 'text-green-500' :
                    strength.level === 'Ultra' ? 'text-purple-600' : 'text-muted-foreground'
                  }`}>{strength.level}</span>
                   <span className="text-xs text-muted-foreground"> (Score: {strength.score})</span>
                </p>
              </div>
            </div>
          )}

          {isClient && strength && strength.suggestions.length > 0 && (
            <Alert 
              variant={
                strength.level === 'Very Weak' || (strength.level === 'Weak' && password.length > 0 && strength.score <= 60) 
                ? 'destructive' 
                : 'default'
              } 
              className={
                strength.level === 'Ultra' && password.length > 0 ? 'border-purple-500' :
                strength.level === 'Very Strong' && password.length > 0 ? 'border-green-500' :
                strength.level === 'Strong' && password.length > 0 ? 'border-sky-500' :
                strength.level === 'Medium' && password.length > 0 ? 'border-yellow-500' :
                ''
            }>
              <strength.levelIcon className="h-4 w-4" />
              <AlertTitle>
                { password.length === 0 ? "Password Check" :
                  strength.level === 'Ultra' && !strength.suggestions.some(s=>s.includes("Avoid using")) ? "Exceptional Strength!" :
                  strength.level === 'Very Strong' && !strength.suggestions.some(s=>s.includes("Avoid using")) ? "Excellent!" : 
                  "Suggestions for a stronger password"
                }
              </AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {strength.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
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
