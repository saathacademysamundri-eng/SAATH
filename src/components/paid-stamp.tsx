
'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PaidStampProps extends React.HTMLAttributes<HTMLDivElement> {}

// The image URL provided by the user for the stamp
const STAMP_IMAGE_URL = 'https://i.postimg.cc/25bFSj1P/Whats-App-Image-2025-11-07-at-2-10-20-PM.jpg';

export function PaidStamp({ className, ...props }: PaidStampProps) {
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
