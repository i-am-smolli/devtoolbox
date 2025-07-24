"use client";

import { AlertCircle, Copy, Pilcrow, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Metadata is now handled by layout.tsx

const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "reprehenderit",
  "in",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

const DEVOPS_WORDS = [
  "kubernetes",
  "docker",
  "ci/cd",
  "pipeline",
  "microservices",
  "iac",
  "monitoring",
  "alerting",
  "sprint",
  "scrum",
  "git",
  "jenkins",
  "ansible",
  "terraform",
  "cloud",
  "serverless",
  "agile",
  "deployment",
  "automation",
  "observability",
  "slo",
  "artifact",
  "containerization",
  "devops",
  "aws",
  "azure",
  "gcp",
  "lambda",
  "helm",
  "prometheus",
  "grafana",
  "elk",
  "jira",
  "confluence",
  "bitbucket",
  "github",
  "gitlab",
  "nexus",
  "sonarqube",
  "security",
  "compliance",
  "scalability",
  "resilience",
  "reliability",
  "velocity",
  "collaboration",
  "feedback",
];

const STARTUP_WORDS = [
  "synergy",
  "pivot",
  "unicorn",
  "disrupt",
  "mvp",
  "agile",
  "lean",
  "growth hacking",
  "burn rate",
  "vc",
  "angel investor",
  "pitch deck",
  "hockey stick",
  "b2b",
  "saas",
  "platform",
  "ecosystem",
  "traction",
  "monetize",
  "value proposition",
  "freemium",
  "bootstrapping",
  "iteration",
  "scale",
  "innovation",
  "gamification",
  "influencer",
  "market fit",
  "user acquisition",
  "retention",
  "churn",
  "kpi",
  "metrics",
  "blockchain",
  "ai",
  "ml",
  "big data",
  "iot",
  "fintech",
  "edtech",
  "healthtech",
  "deep tech",
  "network effect",
];

const GENERATOR_TYPES = [
  { value: "lorem", label: "Standard Lorem Ipsum", words: LOREM_WORDS },
  { value: "devops", label: "DevOps Ipsum", words: DEVOPS_WORDS },
  { value: "startup", label: "Tech Startup Ipsum", words: STARTUP_WORDS },
];

const MIN_PARAGRAPHS = 1;
const MAX_PARAGRAPHS = 100;
const MIN_SENTENCES_PER_PARAGRAPH = 1;
const MAX_SENTENCES_PER_PARAGRAPH = 20;
const MIN_WORDS_PER_SENTENCE = 5;
const MAX_WORDS_PER_SENTENCE = 15;

export default function LoremIpsumGeneratorPage() {
  const [generatorType, setGeneratorType] = useState<string>(
    GENERATOR_TYPES[0].value,
  );
  const [numParagraphs, setNumParagraphs] = useState<number>(3);
  const [numSentences, setNumSentences] = useState<number>(5);
  const [outputText, setOutputText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && outputTextareaRef.current) {
      outputTextareaRef.current.style.height = "auto";
      outputTextareaRef.current.style.height = `${outputTextareaRef.current.scrollHeight}px`;
    }
  }, [isClient]);

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getRandomWord = (wordList: string[]): string => {
    return wordList[Math.floor(Math.random() * wordList.length)];
  };

  const generateSentence = (wordList: string[]): string => {
    const numWords = getRandomInt(
      MIN_WORDS_PER_SENTENCE,
      MAX_WORDS_PER_SENTENCE,
    );
    let sentence = "";
    for (let i = 0; i < numWords; i++) {
      sentence += getRandomWord(wordList) + (i === numWords - 1 ? "" : " ");
    }
    return `${sentence.charAt(0).toUpperCase() + sentence.slice(1)}.`;
  };

  const generateParagraph = (
    wordList: string[],
    sentencesPerParagraph: number,
  ): string => {
    let paragraph = "";
    for (let i = 0; i < sentencesPerParagraph; i++) {
      paragraph +=
        generateSentence(wordList) +
        (i === sentencesPerParagraph - 1 ? "" : " ");
    }
    return paragraph;
  };

  const handleGenerateText = () => {
    if (!isClient) return;
    setError(null);
    setIsLoading(true);

    if (numParagraphs < MIN_PARAGRAPHS || numParagraphs > MAX_PARAGRAPHS) {
      setError(
        `Number of paragraphs must be between ${MIN_PARAGRAPHS} and ${MAX_PARAGRAPHS}.`,
      );
      setIsLoading(false);
      setOutputText("");
      return;
    }
    if (
      numSentences < MIN_SENTENCES_PER_PARAGRAPH ||
      numSentences > MAX_SENTENCES_PER_PARAGRAPH
    ) {
      setError(
        `Sentences per paragraph must be between ${MIN_SENTENCES_PER_PARAGRAPH} and ${MAX_SENTENCES_PER_PARAGRAPH}.`,
      );
      setIsLoading(false);
      setOutputText("");
      return;
    }

    const selectedGenerator = GENERATOR_TYPES.find(
      (g) => g.value === generatorType,
    );
    if (!selectedGenerator) {
      setError("Invalid generator type selected.");
      setIsLoading(false);
      setOutputText("");
      return;
    }

    const { words } = selectedGenerator;
    let generatedText = "";
    for (let i = 0; i < numParagraphs; i++) {
      generatedText += generateParagraph(words, numSentences);
      if (i < numParagraphs - 1) {
        generatedText += "\n\n";
      }
    }

    setTimeout(() => {
      setOutputText(generatedText);
      setIsLoading(false);
    }, 300);
  };

  const handleCopyToClipboard = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Text Copied!",
        description: "The generated text has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy text.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="Lorem Ipsum & Placeholder Text Generator"
        description="Generate placeholder text in various styles like standard Lorem Ipsum, DevOps, or Tech Startup jargon."
        icon={Pilcrow}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="generatorType">
              Generator Type
              <InfoTooltip>
                Select the type of placeholder text to generate. <br />
                Options include standard Lorem Ipsum, DevOps jargon, or Tech
                Startup language.
              </InfoTooltip>
            </Label>
            <Select value={generatorType} onValueChange={setGeneratorType}>
              <SelectTrigger id="generatorType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {GENERATOR_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numParagraphs">
              Number of Paragraphs ({MIN_PARAGRAPHS}-{MAX_PARAGRAPHS})
              <InfoTooltip>
                Specify how many paragraphs of text to generate. <br />
                Each paragraph will contain the specified number of sentences.
              </InfoTooltip>
            </Label>
            <Input
              id="numParagraphs"
              type="number"
              value={numParagraphs}
              onChange={(e) =>
                setNumParagraphs(
                  Math.max(
                    MIN_PARAGRAPHS,
                    Math.min(
                      MAX_PARAGRAPHS,
                      parseInt(e.target.value, 10) || MIN_PARAGRAPHS,
                    ),
                  ),
                )
              }
              min={MIN_PARAGRAPHS}
              max={MAX_PARAGRAPHS}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numSentences">
              Sentences per Paragraph ({MIN_SENTENCES_PER_PARAGRAPH}-
              {MAX_SENTENCES_PER_PARAGRAPH})
              <InfoTooltip>
                Specify how many sentences each paragraph should contain. <br />
                This allows you to control the length and complexity of the
                generated text.
              </InfoTooltip>
            </Label>
            <Input
              id="numSentences"
              type="number"
              value={numSentences}
              onChange={(e) =>
                setNumSentences(
                  Math.max(
                    MIN_SENTENCES_PER_PARAGRAPH,
                    Math.min(
                      MAX_SENTENCES_PER_PARAGRAPH,
                      parseInt(e.target.value, 10) ||
                        MIN_SENTENCES_PER_PARAGRAPH,
                    ),
                  ),
                )
              }
              min={MIN_SENTENCES_PER_PARAGRAPH}
              max={MAX_SENTENCES_PER_PARAGRAPH}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenerateText}
            disabled={isLoading || !isClient}
          >
            {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Generating..." : "Generate Text"}
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

      {isClient && outputText && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Generated Text</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              ref={outputTextareaRef}
              value={outputText}
              readOnly
              className="w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-code text-sm bg-muted/50 min-h-[200px]"
              style={{ overflowY: "hidden" }}
              aria-label="Generated placeholder text"
              rows={10}
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              disabled={!outputText}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
            </Button>
          </CardFooter>
        </Card>
      )}
      {isClient && !isLoading && !outputText && !error && (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Configure options and click &quot;Generate Text&quot; to create
              placeholder content.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
