'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Settings {
  name: string;
  address: string;
  phone: string;
  logo: string;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

const defaultSettings: Settings = {
  name: 'SAATH Academy Samundri',
  address: 'Housing Colony 2, Samundri Faisalabad',
  phone: '0333 9114333',
  logo: '/logo.png',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettingsState] = useState<Settings>(() => {
    if (typeof window === 'undefined') {
        return defaultSettings;
    }
    try {
        const item = window.localStorage.getItem('academySettings');
        return item ? JSON.parse(item) : defaultSettings;
    } catch (error) {
        console.error(error);
        return defaultSettings;
    }
  });

  useEffect(() => {
    try {
        window.localStorage.setItem('academySettings', JSON.stringify(settings));
    } catch (error) {
        console.error(error);
    }
  }, [settings]);

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
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
