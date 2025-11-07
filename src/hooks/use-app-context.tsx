
'use client';

import { getClasses, getExpenses, getIncome, getStudents, getTeachers, getAllSubjects, getAllPayouts, getRecentActivities, checkAndGenerateMonthlyFees, getAcademyShare } from '@/lib/firebase/firestore';
import type { Class, Expense, Income, Student, Subject, Teacher, TeacherPayout, Report, Activity, Payout } from '@/lib/data';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { GlobalPreloader } from '@/components/global-preloader';

interface AppContextType {
  students: Student[];
  teachers: Teacher[];
  classes: Class[];
  income: Income[];
  expenses: Expense[];
  allSubjects: Subject[];
  allPayouts: (TeacherPayout & { report?: Report, academyShare?: number })[];
  activities: Activity[];
  academyShare: Payout[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allPayouts, setAllPayouts] = useState<(TeacherPayout & { report?: Report, academyShare?: number })[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [academyShare, setAcademyShare] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    try {
      if (isInitialLoad) {
        // Run fee generation check on the very first load.
        await checkAndGenerateMonthlyFees();
      }

      const [
        studentsData,
        teachersData,
        classesData,
        incomeData,
        expensesData,
        allSubjectsData,
        allPayoutsData,
        activitiesData,
        academyShareData,
      ] = await Promise.all([
        getStudents(),
        getTeachers(),
        getClasses(),
        getIncome(),
        getExpenses(),
        getAllSubjects(),
        getAllPayouts(),
        getRecentActivities(),
        getAcademyShare(),
      ]);

      setStudents(studentsData);
      setTeachers(teachersData);
      setClasses(classesData);
      setIncome(incomeData);
      setExpenses(expensesData);
      setAllSubjects(allSubjectsData);
      setAllPayouts(allPayoutsData);
      setActivities(activitiesData);
      setAcademyShare(academyShareData);

    } catch (error) {
      console.error("Failed to fetch app data:", error);
      // Handle error appropriately, maybe show a toast
    } finally {
       if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const value = {
    students,
    teachers,
    classes,
    income,
    expenses,
    allSubjects,
    allPayouts,
    activities,
    academyShare,
    loading,
    refreshData: () => fetchData(false),
  };

  if (loading) {
    return <GlobalPreloader />;
  }

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
