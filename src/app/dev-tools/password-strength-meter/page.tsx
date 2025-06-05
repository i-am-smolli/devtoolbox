
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Eye, EyeOff, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface PasswordStrengthResult {
  score: number; // 0-100+
  level: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  suggestions: string[];
  percentage: number;
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
    suggestions.push("Password is too short (minimum 8 characters recommended).");
  } else if (len >= 8 && len <= 11) {
    score += 20;
  } else if (len >= 12 && len <= 15) {
    score += 30;
  } else if (len >= 16) {
    score += 40;
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
  
  // Additional suggestions
  if (len > 0 && len < 12 && score >= 50) {
     suggestions.push("Consider making your password longer (12+ characters) for even greater strength.");
  }


  // Determine level and color
  let level: PasswordStrengthResult['level'];
  let colorClass: string;
  let levelIcon: React.ElementType;
  let percentage = Math.min(100, Math.max(0, score)); // Cap percentage at 100

  if (len === 0) {
    level = 'Very Weak'; // Or some initial state like 'Enter a password'
    colorClass = '[&>div]:bg-muted';
    percentage = 0;
    levelIcon = AlertTriangle;
    suggestions.length = 0; // Clear suggestions for empty input
    suggestions.push("Start typing a password to see its strength.");
  } else if (len < 8) {
    level = 'Very Weak';
    colorClass = '[&>div]:bg-destructive';
    percentage = Math.max(5, percentage); // Show a little progress even if very weak but not empty
    levelIcon = XCircle;
  } else if (score <= 35) {
    level = 'Very Weak';
    colorClass = '[&>div]:bg-destructive';
    levelIcon = XCircle;
  } else if (score <= 55) {
    level = 'Weak';
    colorClass = '[&>div]:bg-orange-500';
    levelIcon = AlertTriangle;
  } else if (score <= 75) {
    level = 'Medium';
    colorClass = '[&>div]:bg-yellow-500';
    levelIcon = AlertTriangle;
  } else if (score <= 90) {
    level = 'Strong';
    colorClass = '[&>div]:bg-sky-500';
    levelIcon = CheckCircle2;
  } else {
    level = 'Very Strong';
    colorClass = '[&>div]:bg-green-500';
    levelIcon = CheckCircle2;
    if (suggestions.filter(s => !s.startsWith("Consider making")).length === 0 && len >= 12) {
        suggestions.length = 0; // Clear improvement suggestions if very strong
        suggestions.push("This password appears to be very strong!");
    }
  }
  
  // If password is very short but contains variety, it might still be weak
  if (len > 0 && len < 8 && !suggestions.includes("Password is too short (minimum 8 characters recommended).")) {
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
    // Calculate initial strength for empty password on mount
    setStrength(calculatePasswordStrength(''));
  }, []);

  useEffect(() => {
    if (isClient) { // Only run calculations on client
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
                    strength.level === 'Very Strong' ? 'text-green-500' : 'text-muted-foreground'
                }`} />
                <p className="text-sm font-medium">
                  Strength: <span className={`font-semibold ${
                    strength.level === 'Very Weak' ? 'text-destructive' :
                    strength.level === 'Weak' ? 'text-orange-500' :
                    strength.level === 'Medium' ? 'text-yellow-500' :
                    strength.level === 'Strong' ? 'text-sky-500' :
                    strength.level === 'Very Strong' ? 'text-green-500' : 'text-muted-foreground'
                  }`}>{strength.level}</span>
                </p>
              </div>
            </div>
          )}

          {isClient && strength && strength.suggestions.length > 0 && (
            <Alert variant={strength.level === 'Very Weak' || (strength.level === 'Weak' && password.length > 0) ? 'destructive' : 'default'} className={
                strength.level === 'Very Strong' && password.length > 0 ? 'border-green-500' :
                strength.level === 'Strong' && password.length > 0 ? 'border-sky-500' :
                strength.level === 'Medium' && password.length > 0 ? 'border-yellow-500' :
                ''
            }>
              <strength.levelIcon className="h-4 w-4" />
              <AlertTitle>
                { password.length === 0 ? "Password Check" :
                  strength.level === 'Very Strong' ? "Excellent!" : "Suggestions for a stronger password"
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
