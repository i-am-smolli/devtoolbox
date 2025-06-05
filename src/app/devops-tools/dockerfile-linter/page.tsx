
'use client';

// Removed: import type { Metadata } from 'next';
import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileCode, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Metadata is now handled by layout.tsx

interface LintIssue {
  line: number;
  message: string;
  type: 'error' | 'warning';
}

const KNOWN_INSTRUCTIONS = [
  'FROM', 'RUN', 'CMD', 'LABEL', 'EXPOSE', 'ENV', 'ADD', 'COPY',
  'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD',
  'STOPSIGNAL', 'HEALTHCHECK', 'SHELL',
];

export default function DockerfileLinterPage() {
  const [dockerfileContent, setDockerfileContent] = useState('');
  const [issues, setIssues] = useState<LintIssue[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [dockerfileContent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDockerfileContent(e.target.value);
    setIssues([]);
    setIsValid(null);
  };

  const lintDockerfile = () => {
    if (!dockerfileContent.trim()) {
      setIssues([]);
      setIsValid(null);
      return;
    }

    setIsLoading(true);
    const newIssues: LintIssue[] = [];
    const lines = dockerfileContent.split('\n');
    let hasFromInstruction = false;

    lines.forEach((lineContent, index) => {
      const lineNumber = index + 1;
      const trimmedLine = lineContent.trim();

      if (trimmedLine.startsWith('#') || trimmedLine === '') {
        // Skip comments and empty lines
        return;
      }

      const parts = trimmedLine.split(/\s+/);
      const instruction = parts[0];

      if (instruction === 'FROM') {
        hasFromInstruction = true;
      }

      if (instruction !== instruction.toUpperCase()) {
        newIssues.push({
          line: lineNumber,
          message: `Instruction "${instruction}" should be uppercase.`,
          type: 'warning',
        });
      } else if (!KNOWN_INSTRUCTIONS.includes(instruction)) {
         newIssues.push({
          line: lineNumber,
          message: `Unknown instruction: "${instruction}".`,
          type: 'error',
        });
      }

      // Basic FROM instruction check (must have at least one argument)
      if (instruction === 'FROM' && parts.length < 2) {
        newIssues.push({
          line: lineNumber,
          message: '`FROM` instruction requires a base image.',
          type: 'error',
        });
      }
    });

    if (!hasFromInstruction && lines.some(line => line.trim() !== '' && !line.trim().startsWith('#'))) {
      newIssues.unshift({ // Add to the beginning of issues
        line: 1,
        message: 'Dockerfile should start with a `FROM` instruction (or have one after ARGs).',
        type: 'error',
      });
    }
    
    // Simulate a short delay for UX, as linting is very fast
    setTimeout(() => {
        setIssues(newIssues);
        setIsValid(newIssues.filter(issue => issue.type === 'error').length === 0);
        setIsLoading(false);
    }, 300);
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Dockerfile Linter"
        description="Analyze Dockerfiles for common syntax errors and structural issues."
        icon={FileCode}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Dockerfile Input</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <Textarea
              ref={textareaRef}
              placeholder="Paste your Dockerfile content here..."
              value={dockerfileContent}
              onChange={handleInputChange}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[200px]"
              aria-label="Dockerfile Input"
              style={{ overflowY: 'hidden' }}
            />
          </CardContent>
          <CardFooter className="p-4">
            <Button onClick={lintDockerfile} className="w-full sm:w-auto" disabled={isLoading}>
              {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Linting...' : 'Lint Dockerfile'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Linting Results</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <ScrollArea className="h-full w-full p-4 min-h-[200px]">
              {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
              )}
              {!isLoading && isValid === true && issues.length === 0 && (
                <Alert variant="default" className="border-green-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-500">Dockerfile is Valid</AlertTitle>
                  <AlertDescription>No common syntax issues found.</AlertDescription>
                </Alert>
              )}
              {!isLoading && isValid === true && issues.length > 0 && ( // Valid but with warnings
                <>
                  <Alert variant="default" className="border-yellow-500 mb-4">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="text-yellow-500">Dockerfile has Warnings</AlertTitle>
                    <AlertDescription>The Dockerfile is structurally valid but has some warnings.</AlertDescription>
                  </Alert>
                  <ul className="space-y-2">
                    {issues.map((issue, index) => (
                      <li key={index} className="text-sm">
                        <span className={`font-semibold ${issue.type === 'warning' ? 'text-yellow-500' : ''}`}>
                          Line {issue.line}:
                        </span> ({issue.type}) {issue.message}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {!isLoading && isValid === false && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Issues Found</AlertTitle>
                  <AlertDescription>
                    The following issues were found in your Dockerfile:
                  </AlertDescription>
                </Alert>
              )}
              {!isLoading && issues.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {issues.map((issue, index) => (
                    <li key={index} className="text-sm p-2 rounded-md bg-muted/50">
                      <span className={`font-semibold ${
                        issue.type === 'error' ? 'text-destructive' 
                        : issue.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' 
                        : ''
                      }`}>
                        Line {issue.line}:
                      </span> ({issue.type}) {issue.message}
                    </li>
                  ))}
                </ul>
              )}
              {!isLoading && isValid === null && !dockerfileContent.trim() && (
                <p className="text-muted-foreground">
                  Paste your Dockerfile content and click "Lint Dockerfile" to see the results.
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
