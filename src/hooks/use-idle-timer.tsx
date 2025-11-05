
'use client';

import { useEffect, useRef } from 'react';

export function useIdleTimer(onIdle: () => void, timeout: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    if (timeout <= 0) {
      return;
    }

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };
    
    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimer(); // Start the timer initially

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [onIdle, timeout]);
}
