
'use client';

import { getSettings as getDBSettings, logActivity, updateSettings as updateDBSettings } from '@/lib/firebase/firestore';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

export type StyleProps = {
  textAlign?: 'left' | 'center' | 'right';
}

export type TextElement = {
  id: string;
  type: 'text';
  text: string;
  style?: StyleProps;
}

export type ImageElement = {
  id: string;
  type: 'image';
  src: string;
  alt: string;
  style?: StyleProps;
}

export type IconElement = {
    id: string;
    type: 'icon';
    icon: string; // e.g., 'Award', 'Users', 'Heart'
}

export type Section = {
  id: string;
  name: string;
  elements: (TextElement | ImageElement | IconElement)[];
}

export interface Settings {
  name: string;
  address: string;
  phone: string;
  logo: string;
  academicSession: string;
  preloaderStyle: string;
  
  autoLockEnabled: boolean;
  autoLockTimeout: number; // in seconds
  securityPin: string;

  whatsappProvider: 'none' | 'ultramsg' | 'official';
  ultraMsgApiUrl: string;
  ultraMsgToken: string;
  officialApiUrl: string;
  officialApiToken: string;

  newAdmissionMsg: boolean;
  absentMsg: boolean;
  paymentReceiptMsg: boolean;
  teacherAbsentMsg: boolean;
  newAdmissionTemplate: string;
  absentTemplate: string;
  paymentReceiptTemplate: string;
  teacherAbsentTemplate: string;

  landingPage: {
    sections: Section[];
  }
}

const defaultSettings: Settings = {
  name: 'SAATH Academy Samundri',
  address: 'Housing Colony 2, Samundri Faisalabad',
  phone: '0333 9114333',
  logo: '/logo.png',
  academicSession: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  preloaderStyle: 'style-1',
  autoLockEnabled: false,
  autoLockTimeout: 300,
  securityPin: '',
  
  whatsappProvider: 'none',
  ultraMsgApiUrl: '',
  ultraMsgToken: '',
  officialApiUrl: '',
  officialApiToken: '',

  newAdmissionMsg: true,
  absentMsg: true,
  paymentReceiptMsg: true,
  teacherAbsentMsg: false,
  newAdmissionTemplate: 'Welcome {student_name} to {academy_name}! Your Roll No is {student_id}.',
  absentTemplate: 'Dear parent, your child {student_name} (Roll No: {student_id}) was absent today.',
  teacherAbsentTemplate: 'Dear {teacher_name}, you were marked absent today. Please contact administration if this is an error.',
  paymentReceiptTemplate: 'Dear parent, we have received a payment of {amount} for {student_name}. Thank you!',
  landingPage: {
    sections: []
  },
};


interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>, logMessage?: string) => Promise<void>;
    isSettingsLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Function to get initial settings from cache or defaults
const getInitialSettings = (): Settings => {
    if (typeof window !== 'undefined') {
        const cachedSettings = sessionStorage.getItem('cachedSettings');
        if (cachedSettings) {
            try {
                return { ...defaultSettings, ...JSON.parse(cachedSettings) };
            } catch (e) {
                console.error("Failed to parse cached settings", e);
            }
        }
    }
    return defaultSettings;
};


export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettingsState] = useState<Settings>(getInitialSettings);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setIsSettingsLoading(true);
    try {
      const detailsSnap = await getDBSettings('details');
      
      const dbSettings = { ...detailsSnap };

      const mergedSettings = { 
          ...defaultSettings, 
          ...dbSettings,
        };

      setSettingsState(mergedSettings);
      
      // Update cache
      sessionStorage.setItem('cachedSettings', JSON.stringify(mergedSettings));


    } catch (error) {
      console.error("Failed to load settings:", error);
      // Fallback to initial (possibly cached) state
      setSettingsState(getInitialSettings());
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>, logMessage?: string) => {
    const { landingPage, ...otherSettings } = newSettings;
    const updatedSettings: Settings = { 
      ...settings, 
      ...otherSettings,
      landingPage: landingPage ? { sections: landingPage.sections } : settings.landingPage,
    };
    setSettingsState(updatedSettings);

    // Update cache immediately
    sessionStorage.setItem('cachedSettings', JSON.stringify(updatedSettings));


    if (Object.keys(otherSettings).length > 0) {
        await updateDBSettings('details', otherSettings);
    }
    if (landingPage) {
        await updateDBSettings('landing-page', { sections: landingPage.sections });
    }

    if (logMessage) {
        await logActivity('settings_updated', logMessage, '/settings');
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

export const useLandingPageContent = () => {
    const [content, setContent] = useState<Settings['landingPage']>(defaultSettings.landingPage);
    const { settings, isSettingsLoading } = useSettings();

    useEffect(() => {
        if (!isSettingsLoading) {
            setContent(settings.landingPage);
        }

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'settingsUpdate') {
                setContent(event.data.payload.landingPage);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);

    }, [isSettingsLoading, settings.landingPage]);

    const getSection = (id: string) => {
        return content.sections.find(s => s.id === id);
    }
    
    const getElement = (id: string): TextElement | ImageElement | IconElement | undefined => {
        for (const section of content.sections) {
            const element = section.elements.find(el => el.id === id);
            if (element) return element;
        }
        return undefined;
    }

    return {
        sections: content.sections,
        getSection,
        getElement
    };
};
