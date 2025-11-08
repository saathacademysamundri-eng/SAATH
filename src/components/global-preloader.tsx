
'use client';

import { useSettings } from "@/hooks/use-settings";
import { Preloader } from "./ui/preloader";
import { useEffect, useState } from "react";

export function GlobalPreloader() {
  const { settings, isSettingsLoading } = useSettings();
  const [initialStyle, setInitialStyle] = useState<string>('style-1');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Try to get initial style from session storage to reduce flicker on reload
    const cachedSettings = sessionStorage.getItem('cachedSettings');
    if (cachedSettings) {
      try {
        const parsed = JSON.parse(cachedSettings);
        if (parsed.preloaderStyle) {
          setInitialStyle(parsed.preloaderStyle);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  const styleToShow = isSettingsLoading ? initialStyle : settings.preloaderStyle;
  
  if (!isClient) {
      return null; // Don't render anything on the server
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <Preloader style={styleToShow as any} />
    </div>
  );
}
