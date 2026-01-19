
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSettings } from '@/hooks/use-settings';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function TeacherWelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { teacher, loading: teacherLoading } = useTeacherAuth();
  const { settings, isSettingsLoading } = useSettings();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('teacherWelcomeDialogShown');
    if (!hasBeenShown && !isSettingsLoading && !teacherLoading && teacher) {
      setIsOpen(true);
      sessionStorage.setItem('teacherWelcomeDialogShown', 'true');
      setCurrentDate(format(new Date(), 'PPP'));
    }
  }, [isSettingsLoading, teacherLoading, teacher]);

  if (isSettingsLoading || teacherLoading || !teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted overflow-hidden">
            <Avatar className="h-24 w-24">
              <AvatarImage src={teacher.imageUrl} />
              <AvatarFallback className="text-4xl">{teacher.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <DialogTitle className="text-2xl font-bold">
            Welcome, {teacher.name}
          </DialogTitle>
          <DialogDescription>
            You have successfully logged into the {settings.name} Teacher Portal.
          </DialogDescription>
          <DialogDescription>{currentDate}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
