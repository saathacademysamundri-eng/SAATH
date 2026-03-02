'use client';

import { getClasses, getTeachers, getAllSubjects, getStudents } from '@/lib/firebase/firestore';
import type { Class, Subject, Teacher, Student } from '@/lib/data';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface AppContextType {
  teachers: Teacher[];
  classes: Class[];
  students: Student[];
  allSubjects: Subject[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
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
      // Fetch configuration and active students
      const [
        teachersData,
        classesData,
        allSubjectsData,
        studentsData,
      ] = await Promise.all([
        getTeachers(),
        getClasses(),
        getAllSubjects(),
        getStudents(),
      ]);
      
      const fullState = {
        teachers: teachersData,
        classes: classesData,
        allSubjects: allSubjectsData,
        students: studentsData,
      };

      setTeachers(teachersData);
      setClasses(classesData);
      setAllSubjects(allSubjectsData);
      setStudents(studentsData);

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
        setStudents(parsed.students || []);
      } catch (e) {
        console.error("Failed to parse app context cache", e);
      }
    }
    fetchData(true);
  }, [fetchData]);

  const value = {
    teachers,
    classes,
    students,
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