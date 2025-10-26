
'use client';

import { useSettings } from "@/hooks/use-settings";
import { Preloader } from "./ui/preloader";

export function GlobalPreloader() {
  const { settings, isSettingsLoading } = useSettings();

  if (isSettingsLoading) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <Preloader style="style-1" />
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Preloader style={settings.preloaderStyle as any} />
    </div>
  );
}
