
'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Anchor, AlertCircle, CheckCircle, Info, Loader2, FileWarning } from 'lucide-react';
import { validateK8sYaml, type K8sYamlValidationOutput, type K8sYamlValidationInput } from '@/ai/flows/k8s-yaml-validator-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const initialYaml = `apiVersion: v1
kind: Pod
metadata:
  name: my-test-pod
  labels:
    app: test
spec:
  containers:
  - name: my-container
    image: nginx:latest # Consider using a specific version instead of 'latest'
    ports:
    - containerPort: 80
    # Missing resource requests and limits
    # Missing livenessProbe and readinessProbe
`;

export default function KubernetesYamlValidatorPage() {
  const [yamlInput, setYamlInput] = useState(initialYaml);
  const [validationResult, setValidationResult] = useState<K8sYamlValidationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isClient, yamlInput]);

  const handleYamlInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setYamlInput(e.target.value);
    setValidationResult(null); // Clear previous results on new input
    if (error) setError(null);
  };

  const handleValidate = async () => {
    if (!yamlInput.trim()) {
      setError("YAML input cannot be empty.");
      setValidationResult(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const result = await validateK8sYaml({ yamlContent: yamlInput });
      setValidationResult(result);
    } catch (e: any) {
      setError(`Validation Error: ${e.message || 'An unexpected error occurred.'}`);
      setValidationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <FileWarning className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };
   const getSeverityBadgeVariant = (severity: 'error' | 'warning' | 'info'): "destructive" | "secondary" | "default" => {
    switch (severity) {
      case 'error':
        return "destructive";
      case 'warning':
        return "secondary"; // Using secondary for warning, as there isn't a direct "warning" variant
      case 'info':
      default:
        return "default"; // Using default for info
    }
  };


  return (
    <div className="flex flex-col">
      <PageHeader
        title="Kubernetes YAML Validator"
        description="Validate your Kubernetes manifest files for syntax, best practices, and common misconfigurations using AI."
        icon={Anchor}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">YAML Input</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <Textarea
              ref={textareaRef}
              placeholder="Paste your Kubernetes YAML here..."
              value={yamlInput}
              onChange={handleYamlInputChange}
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm min-h-[300px]"
              aria-label="Kubernetes YAML Input"
              style={{ overflowY: 'hidden' }}
            />
          </CardContent>
          <CardFooter className="p-4">
            <Button onClick={handleValidate} disabled={isLoading || !yamlInput.trim()} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Validate YAML
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Validation Results</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <ScrollArea className="h-full w-full p-4 min-h-[300px]">
              {isClient && isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Validating...</p>
                </div>
              )}
              {isClient && error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {isClient && !isLoading && validationResult && (
                <>
                  {validationResult.isValid ? (
                    <Alert variant="default" className="border-green-500">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle className="text-green-700">YAML is Valid</AlertTitle>
                      <AlertDescription className="text-green-600">{validationResult.summary || "No issues found. The Kubernetes YAML appears to be valid and follows best practices."}</AlertDescription>
                    </Alert>
                  ) : (
                     <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Validation Issues Found</AlertTitle>
                      <AlertDescription>{validationResult.summary || "The Kubernetes YAML has one or more issues."}</AlertDescription>
                    </Alert>
                  )}

                  {validationResult.issues && validationResult.issues.length > 0 && (
                    <div className="space-y-4 mt-4">
                      <h3 className="text-lg font-semibold font-headline">Detected Issues:</h3>
                      {validationResult.issues.map((issue, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className={cn(
                            "p-4 flex flex-row items-center gap-3 space-y-0",
                            issue.severity === 'error' && 'bg-destructive/10',
                            issue.severity === 'warning' && 'bg-yellow-500/10',
                            issue.severity === 'info' && 'bg-blue-500/10'
                          )}>
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1">
                                <CardTitle className="text-base font-semibold">
                                    <Badge variant={getSeverityBadgeVariant(issue.severity)} className="mr-2 capitalize">{issue.severity}</Badge>
                                    Issue #{index + 1}
                                </CardTitle>
                                {issue.path && <p className="text-xs text-muted-foreground font-code mt-1">Path: {issue.path}</p>}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 text-sm">
                            <p className="mb-2">{issue.message}</p>
                            {issue.suggestion && (
                                <p className="text-xs text-muted-foreground italic">
                                    <strong>Suggestion:</strong> {issue.suggestion}
                                </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
              {isClient && !isLoading && !validationResult && !error && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Enter Kubernetes YAML and click "Validate YAML" to see results.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
