
'use client';

import { useSettings } from "@/hooks/use-settings";
import { Preloader } from "./ui/preloader";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { WifiOff } from "lucide-react";

export function GlobalPreloader() {
  const { settings, isSettingsLoading } = useSettings();
  const [initialStyle, setInitialStyle] = useState<string>('style-1');
  const [isClient, setIsClient] = useState(false);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Safety timeout: if loading takes > 8 seconds, something is likely blocked
    const timer = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, 8000);

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

    return () => clearTimeout(timer);
  }, []);

  const styleToShow = isSettingsLoading ? initialStyle : settings.preloaderStyle;
  
  if (!isClient) {
      return null; // Don't render anything on the server
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-6 text-center">
        {!showTimeoutMessage ? (
          <Preloader style={styleToShow as any} />
        ) : (
          <div className="max-w-md animate-in fade-in zoom-in duration-500">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <WifiOff className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold tracking-tight text-foreground uppercase">Connection Issue Detected</h2>
            <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
              The connection to the server is being blocked or is very slow. 
              Please check your internet connection and <strong>disable any Ad-Blockers</strong> or VPNs.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="font-bold uppercase tracking-widest">
              Retry Connection
            </Button>
          </div>
        )}
    </div>
  );
}
