'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useIdleTimer } from './use-idle-timer';
import { useSettings } from './use-settings';

const LOCK_STORAGE_KEY = 'app_lock_state';

interface LockContextType {
  isLocked: boolean;
  isLockReady: boolean;
  lock: () => void;
  unlock: (pin: string) => boolean;
  showWelcomeBack: boolean;
  setShowWelcomeBack: (show: boolean) => void;
}

const LockContext = createContext<LockContextType | undefined>(undefined);

export const LockProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with false to match server render
  const [isLocked, setIsLocked] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const { settings, isSettingsLoading } = useSettings();
  const [isLockReady, setIsLockReady] = useState(false);

  useEffect(() => {
    // Check lock state and set readiness only after mounting
    const savedLockState = sessionStorage.getItem(LOCK_STORAGE_KEY) === 'locked';
    setIsLocked(savedLockState);
    
    if (!isSettingsLoading) {
        setIsLockReady(true);
    }
  }, [isSettingsLoading]);

  const handleIdle = useCallback(() => {
    if (isLockReady && settings.autoLockEnabled && settings.securityPin) {
      setIsLocked(true);
      sessionStorage.setItem(LOCK_STORAGE_KEY, 'locked');
    }
  }, [settings.autoLockEnabled, settings.securityPin, isLockReady]);
  
  const timeout = isLockReady && settings.autoLockEnabled ? (settings.autoLockTimeout || 60) * 1000 : 0;
  useIdleTimer(handleIdle, timeout);


  const lock = () => {
    setIsLocked(true);
    sessionStorage.setItem(LOCK_STORAGE_KEY, 'locked');
  };

  const unlock = (pin: string) => {
    if (pin === settings.securityPin) {
      setIsLocked(false);
      sessionStorage.removeItem(LOCK_STORAGE_KEY);
      setShowWelcomeBack(true);
      return true;
    }
    return false;
  };
  
  useEffect(() => {
    // Sync state if another tab changes the storage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCK_STORAGE_KEY) {
        setIsLocked(event.newValue === 'locked');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = { isLocked, isLockReady, lock, unlock, showWelcomeBack, setShowWelcomeBack };

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