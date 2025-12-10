
'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PaidStampProps extends React.HTMLAttributes<HTMLDivElement> {
    isText?: boolean;
}

// The image URL provided by the user for the stamp
const STAMP_IMAGE_URL = 'https://i.postimg.cc/prpyQ22C/Paid-Stamp-Saath-Academy.png';

export function PaidStamp({ className, isText = false, ...props }: PaidStampProps) {
  if (isText) {
    return (
       <div className={cn("flex items-center justify-center pointer-events-none", className)} {...props}>
            <p className="text-[10rem] font-bold text-black/10 -rotate-[30deg] select-none">
                PAID
            </p>
        </div>
    )
  }
  
  return (
    <div className={cn("relative w-48 h-48", className)} {...props}>
      {/* We use a standard img tag here because this component is primarily used 
          within a dynamically generated HTML string for printing, where the Next.js 
          Image component might not work as expected. */}
      <img 
        src={STAMP_IMAGE_URL} 
        alt="Paid Stamp" 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}
