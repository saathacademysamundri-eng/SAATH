'use client';

import { getSettings as getDBSettings, updateSettings as updateDBSettings } from '@/lib/firebase/firestore';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

export interface Settings {
  name: string;
  address: string;
  phone: string;
  logo: string;
  academicSession: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  isSettingsLoading: boolean;
}

const defaultSettings: Settings = {
  name: 'SAATH Academy Samundri',
  address: 'Housing Colony 2, Samundri Faisalabad',
  phone: '0333 9114333',
  logo: '/logo.png',
  academicSession: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setIsSettingsLoading(true);
      try {
        // First, try to load from localStorage for speed
        const cachedSettings = localStorage.getItem('academySettings');
        if (cachedSettings) {
          setSettingsState(JSON.parse(cachedSettings));
        }

        // Then, fetch from Firestore to get the latest version
        const dbSettings = await getDBSettings();
        if (dbSettings) {
          setSettingsState(dbSettings);
          localStorage.setItem('academySettings', JSON.stringify(dbSettings));
        } else {
          // If nothing in DB, initialize it with defaults
          await updateDBSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        // Fallback to defaults if DB fails
        setSettingsState(defaultSettings);
      } finally {
        setIsSettingsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettingsState(updatedSettings); // Optimistic UI update
    try {
      await updateDBSettings(updatedSettings);
      localStorage.setItem('academySettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Optionally, revert the UI update
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isSettingsLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
