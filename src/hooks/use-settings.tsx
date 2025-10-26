
'use client';

import { getSettings as getDBSettings, updateSettings as updateDBSettings } from '@/lib/firebase/firestore';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

export interface Settings {
  name: string;
  address: string;
  phone: string;
  logo: string;
  academicSession: string;
  preloaderStyle: string;
  ultraMsgEnabled: boolean;
  officialApiEnabled: boolean;
  ultraMsgApiUrl: string;
  ultraMsgToken: string;
  officialApiNumberId: string;
  officialApiToken: string;
  newAdmissionMsg: boolean;
  absentMsg: boolean;
  paymentReceiptMsg: boolean;
  newAdmissionTemplate: string;
  absentTemplate: string;
  paymentReceiptTemplate: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  isSettingsLoading: boolean;
}

const defaultSettings: Settings = {
  name: '', // Default to empty to allow fallback to 'My Academy'
  address: 'Housing Colony 2, Samundri Faisalabad',
  phone: '0333 9114333',
  logo: '/logo.png',
  academicSession: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  preloaderStyle: 'style-1',
  ultraMsgEnabled: false,
  officialApiEnabled: false,
  ultraMsgApiUrl: '',
  ultraMsgToken: '',
  officialApiNumberId: '',
  officialApiToken: '',
  newAdmissionMsg: true,
  absentMsg: true,
  paymentReceiptMsg: true,
  newAdmissionTemplate: 'Welcome {student_name} to {academy_name}! Your Roll No is {student_id}.',
  absentTemplate: 'Dear parent, your child {student_name} (Roll No: {student_id}) was absent today.',
  paymentReceiptTemplate: 'Dear parent, we have received a payment of {amount} for {student_name}. Thank you!',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setIsSettingsLoading(true);
      try {
        const cachedSettings = localStorage.getItem('academySettings');
        if (cachedSettings) {
          setSettingsState(prev => ({...prev, ...JSON.parse(cachedSettings)}));
        }

        const dbSettings = await getDBSettings();
        if (dbSettings) {
          const mergedSettings = { ...defaultSettings, ...dbSettings };
          setSettingsState(mergedSettings);
          localStorage.setItem('academySettings', JSON.stringify(mergedSettings));
        } else {
          // If no settings in DB, let's try to save the default ones.
          await updateDBSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        setSettingsState(defaultSettings);
      } finally {
        setIsSettingsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettingsState(updatedSettings); 
    await updateDBSettings(updatedSettings);
    localStorage.setItem('academySettings', JSON.stringify(updatedSettings));
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
