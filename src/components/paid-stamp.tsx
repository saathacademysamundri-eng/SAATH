
'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface PaidStampProps extends React.HTMLAttributes<HTMLDivElement> {
  academyName: string;
  academyPhone: string;
}

export function PaidStamp({ academyName, academyPhone, className }: PaidStampProps) {
  return (
    <div className={cn("pointer-events-none z-10 aspect-square w-[300px] opacity-20", className)}>
      <div className="relative h-full w-full">
        <img src="https://storage.googleapis.com/project-spark-341015.appspot.com/generic/paid-stamp-1721932362070.png" alt="Paid Stamp" className="absolute inset-0 h-full w-full" />

        <div className="relative h-full w-full">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-[15deg] transform">
            {/* Top Text Path */}
            <path id="top-curve" d="M10,50 a40,40 0 1,1 80,0" fill="none" />
            <text width="100" fill="white" className="text-[7px] font-bold uppercase tracking-wider">
              <textPath href="#top-curve" startOffset="50%" textAnchor="middle">
                {academyName}
              </textPath>
            </text>

            {/* Bottom Text Path */}
            <path id="bottom-curve" d="M10,50 a40,40 0 0,0 80,0" fill="none" />
             <text width="100" fill="white" className="text-[7px] font-bold uppercase tracking-wider">
              <textPath href="#bottom-curve" startOffset="50%" textAnchor="middle">
                {academyPhone}
              </textPath>
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
