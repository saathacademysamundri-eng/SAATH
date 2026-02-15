'use client';

import { getClasses, getTeachers, getAllSubjects } from '@/lib/firebase/firestore';
import type { Class, Subject, Teacher } from '@/lib/data';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface AppContextType {
  teachers: Teacher[];
  classes: Class[];
  allSubjects: Subject[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    const hasCache = sessionStorage.getItem('appContextCache') !== null;
    if (hasCache && isInitialLoad) {
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      // Fetch only the lightweight configuration data globally
      const [
        teachersData,
        classesData,
        allSubjectsData,
      ] = await Promise.all([
        getTeachers(),
        getClasses(),
        getAllSubjects(),
      ]);
      
      const fullState = {
        teachers: teachersData,
        classes: classesData,
        allSubjects: allSubjectsData,
      };

      setTeachers(teachersData);
      setClasses(classesData);
      setAllSubjects(allSubjectsData);

      sessionStorage.setItem('appContextCache', JSON.stringify(fullState));

    } catch (error) {
      console.error("Failed to fetch app data:", error);
    } finally {
       setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Apply cached data after mount to prevent hydration mismatch
    const cachedData = sessionStorage.getItem('appContextCache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setTeachers(parsed.teachers || []);
        setClasses(parsed.classes || []);
        setAllSubjects(parsed.allSubjects || []);
      } catch (e) {
        console.error("Failed to parse app context cache", e);
      }
    }
    fetchData(true);
  }, [fetchData]);

  const value = {
    teachers,
    classes,
    allSubjects,
    loading,
    refreshData: () => fetchData(false),
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <FirebaseErrorListener />
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};