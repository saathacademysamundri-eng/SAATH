'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Settings {
  name: string;
  address: string;
  phone: string;
  logo: string;
  academicSession: string;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  isSettingsLoading: boolean;
}

const defaultSettings: Settings = {
  name: 'SAATH Academy Samundri',
  address: 'Housing Colony 2, Samundri Faisalabad',
  phone: '0333 9114333',
  logo: '/logo.png',
  academicSession: '2024-2025',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('academySettings');
      if (item) {
        setSettingsState(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
      setSettingsState(defaultSettings);
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSettingsLoading) {
        try {
            window.localStorage.setItem('academySettings', JSON.stringify(settings));
        } catch (error) {
            console.error(error);
        }
    }
  }, [settings, isSettingsLoading]);

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, isSettingsLoading }}>
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
