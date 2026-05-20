'use client';

import { useSettings } from "@/hooks/use-settings";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";
import Image from "next/image";

export function Logo({ noText = false, onLogin = false }: { noText?: boolean, onLogin?: boolean }) {
  const { settings, isSettingsLoading } = useSettings();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const logoSrc = settings.logo || '/logo.png';
  const academyName = settings.name || 'My Academy';

  if (!isClient || (isSettingsLoading && !sessionStorage.getItem('cachedSettings'))) {
    return (
        <div className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
            <Skeleton className="h-12 w-12 rounded-full" />
            {!noText && <Skeleton className="h-6 w-32" />}
        </div>
    )
  }

  if (onLogin) {
    return (
         <div className="flex flex-col items-center justify-center gap-4 font-headline text-2xl font-bold text-primary w-full h-full">
            <div className='h-32 w-32 bg-muted rounded-full flex items-center justify-center overflow-hidden shrink-0 relative'>
                <Image 
                    src={logoSrc} 
                    alt="logo" 
                    fill 
                    className="object-contain p-1" 
                    priority
                />
            </div>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2 font-headline text-2xl font-bold text-primary w-full h-full">
      <div className="h-14 w-14 relative shrink-0">
        <Image 
            src={logoSrc} 
            alt="logo" 
            fill 
            className="object-contain" 
            priority
        />
      </div>
      {!noText && <span className="font-bold tracking-tighter text-xl">{academyName}</span>}
    </div>
  );
}