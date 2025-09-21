'use client';

import { summarizeAnnouncement } from '@/ai/flows/summarize-announcements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';

const exampleText = `To all esteemed faculty and students of AcademiaLite,

We are writing to inform you of the upcoming annual sports gala, which is scheduled to take place from the 15th to the 17th of next month. All classes will be suspended during this period to encourage full participation. The events will include cricket, football, basketball, and athletics. Interested students must register with the sports office by the 10th of next month.

Furthermore, please be advised that the final term examinations will commence a week after the sports gala, starting from the 25th. The full examination schedule will be posted on the main notice board and the student portal by the end of this week.

Attendance at the sports gala opening ceremony is mandatory for all students. We look forward to your enthusiastic participation.`;

export function Summarizer() {
  const [announcementText, setAnnouncementText] = useState(exampleText);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!announcementText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Announcement text cannot be empty.',
      });
      return;
    }

    setIsLoading(true);
    setSummary('');

    try {
      const result = await summarizeAnnouncement({ announcementText });
      setSummary(result.summary);
    } catch (error) {
      console.error('Summarization failed:', error);
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
        description: 'An error occurred while generating the summary.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Textarea
          placeholder="Paste your announcement text here..."
          value={announcementText}
          onChange={(e) => setAnnouncementText(e.target.value)}
          className="min-h-[200px] text-base"
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSummarize} disabled={isLoading}>
          <Wand2 className="mr-2" />
          {isLoading ? 'Summarizing...' : 'Summarize'}
        </Button>
      </div>

      {(isLoading || summary) && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p>{summary}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
