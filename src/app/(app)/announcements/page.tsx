import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Summarizer } from './summarizer';

export default function AnnouncementsPage() {
  return (
    <div className="flex flex-col gap-6">
       <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Use AI to summarize long announcements for students and teachers.
          </p>
        </div>
      <Card>
        <CardHeader>
            <CardTitle>Intelligent Summarizer</CardTitle>
            <CardDescription>Paste the full announcement text below to get a concise summary.</CardDescription>
        </CardHeader>
        <CardContent>
            <Summarizer />
        </CardContent>
      </Card>
    </div>
  );
}
