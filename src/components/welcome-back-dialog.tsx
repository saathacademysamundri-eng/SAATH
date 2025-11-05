
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { useLock } from "@/hooks/use-lock";
import { useEffect } from "react";

export function WelcomeBackDialog() {
  const { isSettingsLoading, settings } = useSettings();
  const { showWelcomeBack, setShowWelcomeBack } = useLock();

  useEffect(() => {
    if (showWelcomeBack) {
      const timer = setTimeout(() => {
        setShowWelcomeBack(false);
      }, 2000); // Auto-close after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [showWelcomeBack, setShowWelcomeBack]);
  
  if (isSettingsLoading) return null;

  return (
    <Dialog open={showWelcomeBack} onOpenChange={setShowWelcomeBack}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted overflow-hidden">
            <img src={settings.logo} alt="logo" className="object-cover w-full h-full" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Welcome Back
          </DialogTitle>
          <DialogDescription>Developed by Mian Mudassar.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
