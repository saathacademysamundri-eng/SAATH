
"use client"

import { cn } from "@/lib/utils";

type PreloaderStyle =
  | 'style-1' | 'style-2' | 'style-3' | 'style-4' | 'style-5'
  | 'style-6' | 'style-7' | 'style-8' | 'style-9' | 'style-10'
  | 'style-11' | 'style-12' | 'style-13' | 'style-14' | 'style-15';

interface PreloaderProps extends React.SVGProps<SVGSVGElement> {
  style: PreloaderStyle;
}

export function Preloader({ style, className, ...props }: PreloaderProps) {
  const styles: Record<PreloaderStyle, React.ReactNode> = {
    'style-1': (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <g>
            <path d="M12 2.99982V5.99982" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
            <path d="M12 18V21" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
            <path d="M5.12109 5.12109L7.24219 7.24219" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
            <path d="M16.7578 16.7578L18.8789 18.8789" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
            <path d="M3 12H6" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
            <path d="M18 12H21" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
            <path d="M5.12109 18.8789L7.24219 16.7578" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
            <path d="M16.7578 7.24219L18.8789 5.12109" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1.5s" repeatCount="indefinite"/>
          </g>
        </svg>
    ),
    'style-2': (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <g>
            {[...Array(12)].map((_, i) => (
                <path
                    key={i}
                    d="M12 3V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    transform={`rotate(${i * 30} 12 12)`}
                >
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin={`${i/12}s`} repeatCount="indefinite"/>
                </path>
            ))}
          </g>
        </svg>
    ),
    'style-3': (
      <svg viewBox="0 0 24 24" {...props}>
        {[...Array(8)].map((_, i) => (
          <circle key={i} cx="12" cy="12" r="2.5" fill="currentColor" transform={`rotate(${i * 45} 12 12) translate(8)`}>
             <animate attributeName="opacity" values="1;0.3" begin={`${i * 0.125}s`} dur="1s" repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    ),
    'style-4': (
      <svg viewBox="0 0 24 24" {...props}>
        {[...Array(12)].map((_, i) => (
            <rect key={i} x="11" y="4" width="2" height="5" rx="1" fill="currentColor" transform={`rotate(${i*30} 12 12)`}>
                <animate attributeName="opacity" values="1;0.2" begin={`${i * 0.083}s`} dur="1s" repeatCount="indefinite" />
            </rect>
        ))}
      </svg>
    ),
     'style-5': (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="15, 10" strokeLinecap="round" opacity="0.3"/>
          <path d="M12 2 a10 10 0 0 1 0 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </path>
        </svg>
    ),
     'style-6': (
        <svg viewBox="0 0 24 24" {...props}>
          <g fill="currentColor">
            {[...Array(8)].map((_, i) => (
              <circle key={i} cx="4" cy="12" r="3" transform={`rotate(${i*45} 12 12)`}>
                  <animate attributeName="opacity" values="1;0.5;1" begin={`${i * 0.125}s`} dur="1s" repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        </svg>
    ),
    'style-7': (
      <svg viewBox="0 0 24 24" {...props}>
        {[...Array(12)].map((_, i) => (
          <rect key={i} x="11" y="2" width="2" height="6" rx="1" fill="currentColor" transform={`rotate(${i * 30} 12 12)`}>
            <animate attributeName="opacity" values="1;0.3" begin={`${i * 0.083}s`} dur="1s" repeatCount="indefinite" />
          </rect>
        ))}
      </svg>
    ),
    'style-8': (
      <svg viewBox="0 0 24 24" {...props}>
        <g fill="currentColor">
            {[...Array(8)].map((_, i) => (
                <path key={i} d="M12 2 L14 6 L10 6 Z" transform={`rotate(${i * 45} 12 12)`}>
                    <animate attributeName="opacity" values="1;0.3" begin={`${i*0.125}s`} dur="1s" repeatCount="indefinite" />
                </path>
            ))}
        </g>
      </svg>
    ),
    'style-9': (
      <svg viewBox="0 0 24 24" {...props}>
        {[...Array(8)].map((_, i) => (
          <circle key={i} cx="12" cy="12" r="0" fill="currentColor" transform={`rotate(${i*45} 12 12)`}>
            <animate attributeName="r" from="0" to="8" dur="1s" begin={`${i*0.125}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" from="1" to="0" dur="1s" begin={`${i*0.125}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    ),
     'style-10': (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M2 12 C2 6.477 6.477 2 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
          </path>
        </svg>
    ),
     'style-11': (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path d="M12 2 V4 M12 20 V22 M4 12 H2 M22 12 H20 M5.6 5.6 L7 7 M17 17 L18.4 18.4 M5.6 18.4 L7 17 M17 7 L18.4 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 6 a6 6 0 1 1-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </path>
        </svg>
    ),
     'style-12': (
        <svg viewBox="0 0 24 24" {...props}>
          <g fill="currentColor">
             {[...Array(8)].map((_, i) => (
                <rect key={i} x="11" y="2" width="2" height="7" rx="1" transform={`rotate(${i * 45} 12 12)`}>
                    <animate attributeName="opacity" values="1;0.2" begin={`${i * 0.125}s`} dur="1s" repeatCount="indefinite" />
                </rect>
            ))}
          </g>
        </svg>
    ),
    'style-13': (
      <svg viewBox="0 0 24 24" {...props}>
        {[...Array(8)].map((_, i) => (
          <circle key={i} cx="12" cy="12" r="1.5" fill="currentColor" transform={`rotate(${i * 45} 12 12) translate(9)`}>
            <animate attributeName="opacity" values="1;0.3" begin={`${i * 0.125}s`} dur="1s" repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    ),
     'style-14': (
       <svg viewBox="0 0 24 24" fill="none" {...props}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
          <path d="M12 2 a 10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
             <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1.5s" repeatCount="indefinite"/>
          </path>
        </svg>
    ),
     'style-15': (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
           <g transform="translate(2 2)">
            {[...Array(3)].map((_, i) => (
              <circle key={i} cx="10" cy="10" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="10 60">
                 <animateTransform attributeName="transform" type="rotate" from={`${i*120} 10 10`} to={`${360 + i*120} 10 10`} dur="2s" repeatCount="indefinite" />
              </circle>
            ))}
           </g>
        </svg>
    ),
  };

  return (
    <div className={cn("w-12 h-12 text-primary", className)}>
      {styles[style]}
    </div>
  );
}
