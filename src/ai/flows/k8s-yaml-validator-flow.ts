
'use server';
/**
 * @fileOverview A Kubernetes YAML validator AI agent.
 *
 * - validateK8sYaml - A function that handles the Kubernetes YAML validation.
 * - K8sYamlValidationInput - The input type for the validateK8sYaml function.
 * - K8sYamlValidationOutput - The return type for the validateK8sYaml function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IssueSchema = z.object({
  severity: z.enum(['error', 'warning', 'info']).describe('The severity of the issue.'),
  message: z.string().describe('A descriptive message about the issue.'),
  path: z.string().optional().describe('The JSONPath-like path to the problematic element in the YAML, if applicable (e.g., "spec.template.spec.containers[0].image").'),
  suggestion: z.string().optional().describe('A brief suggestion on how to fix the issue, if applicable.'),
});

const K8sYamlValidationInputSchema = z.object({
  yamlContent: z.string().describe('The Kubernetes YAML content to validate.'),
});
export type K8sYamlValidationInput = z.infer<typeof K8sYamlValidationInputSchema>;

const K8sYamlValidationOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the YAML is considered valid based on the analysis.'),
  issues: z.array(IssueSchema).describe('A list of issues found in the YAML. Empty if no issues are found.'),
  summary: z.string().describe('A brief summary of the validation result.'),
});
export type K8sYamlValidationOutput = z.infer<typeof K8sYamlValidationOutputSchema>;

export async function validateK8sYaml(input: K8sYamlValidationInput): Promise<K8sYamlValidationOutput> {
  return k8sYamlValidatorFlow(input);
}

const validatorPrompt = ai.definePrompt({
  name: 'k8sYamlValidatorPrompt',
  input: {schema: K8sYamlValidationInputSchema},
  output: {schema: K8sYamlValidationOutputSchema},
  prompt: `You are an expert Kubernetes administrator and YAML linter.
Your task is to validate the provided Kubernetes YAML content for syntax errors, adherence to best practices, and common misconfigurations.

YAML Content to Validate:
\`\`\`yaml
{{{yamlContent}}}
\`\`\`

Analyze the YAML carefully.
If it's valid and follows best practices, set 'isValid' to true, provide an empty 'issues' array, and set 'summary' to a positive confirmation message.

If issues are found:
- Set 'isValid' to false.
- For each issue, provide:
  - 'severity': 'error' for critical problems, 'warning' for best practice violations or potential issues, 'info' for informational notes.
  - 'message': A clear and concise description of the issue.
  - 'path': (Optional) If possible, provide a JSONPath-like string indicating the location of the issue within the YAML structure (e.g., "spec.replicas", "metadata.labels.app"). This helps the user pinpoint the problem.
  - 'suggestion': (Optional) A brief suggestion on how to fix or improve the identified issue.
- Set 'summary' to a message indicating that issues were found.

Focus on correctness, security, and operational best practices. Examples of checks:
- Correct YAML syntax.
- Valid Kubernetes kinds and apiVersions.
- Required fields for specific resources.
- Deprecated API usage.
- Security best practices (e.g., not running containers as root, resource limits).
- Labeling conventions.
- Probe configurations (liveness, readiness).
- Resource requests and limits.

Return the output in the specified JSON format.
`,
});

const k8sYamlValidatorFlow = ai.defineFlow(
  {
    name: 'k8sYamlValidatorFlow',
    inputSchema: K8sYamlValidationInputSchema,
    outputSchema: K8sYamlValidationOutputSchema,
  },
  async (input) => {
    const {output} = await validatorPrompt(input);
    if (!output) {
        throw new Error("Validation failed to produce an output.");
    }
    return output;
  }
);
