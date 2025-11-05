
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { format } from "date-fns";

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, isSettingsLoading } = useSettings();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem("welcomeDialogShown");
    if (!hasBeenShown && !isSettingsLoading) {
      setIsOpen(true);
      sessionStorage.setItem("welcomeDialogShown", "true");
      setCurrentDate(format(new Date(), "PPP"));
    }
  }, [isSettingsLoading]);

  if (isSettingsLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted overflow-hidden">
            <img src={settings.logo} alt="logo" className="object-cover w-full h-full" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Welcome to {settings.name}
          </DialogTitle>
          <DialogDescription>Developed by Mian Mudassar.</DialogDescription>
          <DialogDescription>{currentDate}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
