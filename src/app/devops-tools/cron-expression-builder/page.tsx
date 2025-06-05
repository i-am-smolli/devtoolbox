
'use client';

import type { Metadata } from 'next';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarClock, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export const metadata: Metadata = {
  title: 'Cron Expression Builder - Visual Cron Tool',
  description: 'Visually construct and generate cron expressions for scheduling tasks. Easy-to-use interface for minutes, hours, days, months, and day of the week.',
};

type CronPartMode = 'every' | 'specific' | 'range' | 'step';

interface CronPartConfig {
  mode: CronPartMode;
  specificValue: string;
  rangeStart: string;
  rangeEnd: string;
  stepValue: string;
}

const initialCronPartConfig: CronPartConfig = {
  mode: 'every',
  specificValue: '',
  rangeStart: '',
  rangeEnd: '',
  stepValue: '',
};

const CRON_PARTS = [
  { id: 'minute', name: 'Minute', range: '0-59' },
  { id: 'hour', name: 'Hour', range: '0-23' },
  { id: 'dayOfMonth', name: 'Day of Month', range: '1-31' },
  { id: 'month', name: 'Month', range: '1-12 (JAN-DEC)' },
  { id: 'dayOfWeek', name: 'Day of Week', range: '0-6 (SUN-SAT)' },
] as const;

type CronPartId = typeof CRON_PARTS[number]['id'];

export default function CronExpressionBuilderPage() {
  const [configs, setConfigs] = useState<Record<CronPartId, CronPartConfig>>(
    Object.fromEntries(
      CRON_PARTS.map(part => [part.id, { ...initialCronPartConfig }])
    ) as Record<CronPartId, CronPartConfig>
  );
  const [cronExpression, setCronExpression] = useState('* * * * *');
  const { toast } = useToast();

  const buildPartExpression = useCallback((config: CronPartConfig): string => {
    switch (config.mode) {
      case 'every':
        return '*';
      case 'specific':
        return config.specificValue || '*'; // Default to * if empty
      case 'range':
        return (config.rangeStart && config.rangeEnd) ? `${config.rangeStart}-${config.rangeEnd}` : '*';
      case 'step':
        return config.stepValue ? `*/${config.stepValue}` : '*';
      default:
        return '*';
    }
  }, []);

  useEffect(() => {
    const expressionParts = CRON_PARTS.map(part => buildPartExpression(configs[part.id]));
    setCronExpression(expressionParts.join(' '));
  }, [configs, buildPartExpression]);

  const handleConfigChange = (partId: CronPartId, field: keyof CronPartConfig, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [partId]: {
        ...prev[partId],
        [field]: value,
      },
    }));
  };

  const handleModeChange = (partId: CronPartId, mode: CronPartMode) => {
    setConfigs(prev => ({
      ...prev,
      [partId]: {
        ...initialCronPartConfig, // Reset values when mode changes
        mode: mode,
      },
    }));
  };
  
  const handleCopyToClipboard = async () => {
    if (!cronExpression) return;
    try {
      await navigator.clipboard.writeText(cronExpression);
      toast({
        title: "Cron Expression Copied!",
        description: "The generated expression has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy expression.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Cron Expression Builder"
        description="Visually construct cron expressions for scheduling tasks."
        icon={CalendarClock}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Configure Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="minute" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              {CRON_PARTS.map(part => (
                <TabsTrigger key={part.id} value={part.id}>{part.name}</TabsTrigger>
              ))}
            </TabsList>
            {CRON_PARTS.map(part => (
              <TabsContent key={part.id} value={part.id} className="mt-4 space-y-4">
                <h3 className="text-lg font-medium">
                  {part.name} Configuration <span className="text-sm text-muted-foreground">({part.range})</span>
                </h3>
                <div className="space-y-2">
                  <Label htmlFor={`${part.id}-mode`}>Mode</Label>
                  <Select
                    value={configs[part.id].mode}
                    onValueChange={(value) => handleModeChange(part.id, value as CronPartMode)}
                  >
                    <SelectTrigger id={`${part.id}-mode`}>
                      <SelectValue placeholder={`Select ${part.name} mode`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="every">Every {part.name.toLowerCase()} (*)</SelectItem>
                      <SelectItem value="specific">Specific {part.name.toLowerCase()}(s)</SelectItem>
                      <SelectItem value="range">{part.name} Range</SelectItem>
                      <SelectItem value="step">Every X {part.name.toLowerCase()}(s) (Step)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {configs[part.id].mode === 'specific' && (
                  <div className="space-y-2">
                    <Label htmlFor={`${part.id}-specific`}>Specific Value(s) (comma-separated)</Label>
                    <Input
                      id={`${part.id}-specific`}
                      placeholder={part.id === 'month' ? 'e.g., 1,3,MAR' : part.id === 'dayOfWeek' ? 'e.g., 1,FRI,SUN' : 'e.g., 0,15,30,45'}
                      value={configs[part.id].specificValue}
                      onChange={(e) => handleConfigChange(part.id, 'specificValue', e.target.value)}
                      className="font-code"
                    />
                  </div>
                )}

                {configs[part.id].mode === 'range' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${part.id}-rangeStart`}>From</Label>
                      <Input
                        id={`${part.id}-rangeStart`}
                        placeholder={part.id.startsWith('day') ? '1' : '0'}
                        value={configs[part.id].rangeStart}
                        onChange={(e) => handleConfigChange(part.id, 'rangeStart', e.target.value)}
                        className="font-code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${part.id}-rangeEnd`}>To</Label>
                      <Input
                        id={`${part.id}-rangeEnd`}
                        placeholder={part.id === 'minute' || part.id === 'dayOfWeek' ? (parseInt(part.range.split('-')[1], 10)).toString() : part.range.split('-')[1].match(/\d+/)?.[0] || ''}
                        value={configs[part.id].rangeEnd}
                        onChange={(e) => handleConfigChange(part.id, 'rangeEnd', e.target.value)}
                        className="font-code"
                      />
                    </div>
                  </div>
                )}

                {configs[part.id].mode === 'step' && (
                  <div className="space-y-2">
                    <Label htmlFor={`${part.id}-step`}>Step Value (every X)</Label>
                    <Input
                      id={`${part.id}-step`}
                      placeholder="e.g., 5"
                      value={configs[part.id].stepValue}
                      onChange={(e) => handleConfigChange(part.id, 'stepValue', e.target.value)}
                      className="font-code"
                    />
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="flex-col items-start space-y-2 pt-6">
          <Label htmlFor="generatedCron" className="text-lg font-semibold">Generated Cron Expression</Label>
          <div className="flex w-full items-center space-x-2">
            <Input
              id="generatedCron"
              value={cronExpression}
              readOnly
              className="font-code bg-muted/50 text-base"
            />
            <Button variant="outline" size="icon" onClick={handleCopyToClipboard} aria-label="Copy Cron Expression">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
