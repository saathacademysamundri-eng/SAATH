
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useIdleTimer } from './use-idle-timer';
import { useSettings } from './use-settings';

interface LockContextType {
  isLocked: boolean;
  lock: () => void;
  unlock: (pin: string) => boolean;
}

const LockContext = createContext<LockContextType | undefined>(undefined);

export const LockProvider = ({ children }: { children: ReactNode }) => {
  const [isLocked, setIsLocked] = useState(false);
  const { settings } = useSettings();

  const handleIdle = useCallback(() => {
    if (settings.autoLockEnabled && settings.securityPin) {
      setIsLocked(true);
    }
  }, [settings.autoLockEnabled, settings.securityPin]);
  
  const timeout = settings.autoLockEnabled ? (settings.autoLockTimeout || 60) * 1000 : 0;
  useIdleTimer(handleIdle, timeout);


  const lock = () => {
    setIsLocked(true);
  };

  const unlock = (pin: string) => {
    if (pin === settings.securityPin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const value = { isLocked, lock, unlock };

  return (
    <LockContext.Provider value={value}>
      {children}
    </LockContext.Provider>
  );
};

export const useLock = () => {
  const context = useContext(LockContext);
  if (context === undefined) {
    throw new Error('useLock must be used within a LockProvider');
  }
  return context;
};
