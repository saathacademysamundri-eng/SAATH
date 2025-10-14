
'use client';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import React from 'react';

interface PaidStampProps extends React.HTMLAttributes<HTMLDivElement> {
  academyName: string;
  academyPhone: string;
  date: Date;
}

export function PaidStamp({ academyName, academyPhone, date, className }: PaidStampProps) {
  const formattedDate = format(date, 'dd/MM/yy');

  return (
    <div className={cn("relative w-48 h-48", className)}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Base Stamp Image */}
        <image href="https://storage.googleapis.com/project-spark-341015.appspot.com/generic/paid-stamp-base-1722008893498.png" x="0" y="0" width="200" height="200" />
        
        {/* Top Text (Academy Name) */}
        <defs>
          <path id="top-arc" d="M 40,100 a 60,60 0 1,1 120,0" fill="none" />
        </defs>
        <text fill="#C81E1E" fontSize="13" fontWeight="bold" letterSpacing="1.5">
          <textPath href="#top-arc" startOffset="50%" textAnchor="middle">
            {academyName.toUpperCase()}
          </textPath>
        </text>

        {/* Bottom Text (Phone Number) */}
        <defs>
          <path id="bottom-arc" d="M 40,100 a 60,60 0 0,0 120,0" fill="none" />
        </defs>
        <text fill="#C81E1E" fontSize="13" fontWeight="bold" letterSpacing="1.5">
          <textPath href="#bottom-arc" startOffset="50%" textAnchor="middle">
            {academyPhone}
          </textPath>
        </text>

        {/* Date Text */}
        <text x="50%" y="58%" textAnchor="middle" fill="#C81E1E" fontSize="10" fontWeight="bold">
          DATE: {formattedDate}
        </text>
      </svg>
    </div>
  );
}
