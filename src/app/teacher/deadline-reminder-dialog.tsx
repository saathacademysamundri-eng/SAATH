'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Exam } from '@/lib/data';
import { AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export function ExamDeadlineReminderDialog({
  isOpen,
  onOpenChange,
  exams,
  onSnooze,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  exams: Exam[];
  onSnooze: () => void;
}) {
  const router = useRouter();

  const handleGoToExam = (examId: string) => {
    router.push(`/teacher/exams/${examId}`);
    onOpenChange(false);
  };

  const handleSnoozeClick = () => {
    onSnooze();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Exam Submission Reminder</DialogTitle>
          <DialogDescription className="text-center">
            You have exams with upcoming or past-due submission deadlines. Please enter the marks as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 max-h-60 overflow-y-auto space-y-3 pr-2">
          {exams.map(exam => (
            <div key={exam.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-semibold">{exam.name} ({exam.className})</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Deadline: {format(exam.submissionDeadline!, 'PPP')}
                </p>
              </div>
              <Button size="sm" onClick={() => handleGoToExam(exam.id)}>Enter Marks</Button>
            </div>
          ))}
        </div>
        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="ghost" onClick={handleSnoozeClick}>
            Snooze for 2 hours
          </Button>
          <Button onClick={() => onOpenChange(false)}>Dismiss</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
