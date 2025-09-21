'use client';

import { useSettings } from "@/hooks/use-settings";
import { Skeleton } from "./ui/skeleton";

export function Logo({ noText = false }: { noText?: boolean }) {
  const { settings, isSettingsLoading } = useSettings();

  if (isSettingsLoading) {
    return (
        <div className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
            <Skeleton className="h-10 w-10 rounded-full" />
            {!noText && <Skeleton className="h-6 w-32" />}
        </div>
    )
  }

  return (
    <div className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
      <img src={settings.logo} alt="logo" className="h-10 w-10 object-contain" />
      {!noText && <span className="font-bold tracking-tighter">{settings.name}</span>}
    </div>
  );
}
