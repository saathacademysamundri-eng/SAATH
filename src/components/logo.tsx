'use client';

import { useSettings } from "@/hooks/use-settings";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";

export function Logo({ noText = false, onLogin = false }: { noText?: boolean, onLogin?: boolean }) {
  const { settings, isSettingsLoading } = useSettings();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isSettingsLoading || !isClient) {
    return (
        <div className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
            <Skeleton className="h-10 w-10 rounded-full" />
            {!noText && <Skeleton className="h-6 w-32" />}
        </div>
    )
  }

  if (onLogin) {
    return (
         <div className="flex flex-col items-center justify-center gap-4 font-headline text-2xl font-bold text-primary w-full h-full">
            <div className='h-24 w-24 bg-muted rounded-full flex items-center justify-center overflow-hidden shrink-0'>
                <img src={settings.logo} alt="logo" className="object-cover w-full h-full" />
            </div>
            <span className="font-bold tracking-tighter text-3xl">{settings.name}</span>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2 font-headline text-2xl font-bold text-primary w-full h-full">
      <img src={settings.logo} alt="logo" className="h-full w-full object-cover" />
      {!noText && <span className="font-bold tracking-tighter">{settings.name}</span>}
    </div>
  );
}
