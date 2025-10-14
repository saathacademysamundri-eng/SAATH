
'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface PaidStampProps extends React.HTMLAttributes<HTMLDivElement> {
  academyName: string;
  academyPhone: string;
}

export function PaidStamp({ academyName, academyPhone, className }: PaidStampProps) {
  return (
    <div className={cn("pointer-events-none z-10 aspect-square w-[300px] opacity-15", className)}>
      <div className="relative h-full w-full">
        {/* Using a high-quality, pre-made stamp image */}
        <img 
          src="https://storage.googleapis.com/project-spark-341015.appspot.com/generic/paid-stamp-final-1721997380006.png" 
          alt="Paid Stamp" 
          className="absolute inset-0 h-full w-full object-contain" 
        />
      </div>
    </div>
  );
}
