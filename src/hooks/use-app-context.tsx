
'use client';

import { getClasses, getExpenses, getIncome, getStudents, getTeachers, getAllSubjects, getAllPayouts, getRecentActivities, checkAndGenerateMonthlyFees, getAcademyShare } from '@/lib/firebase/firestore';
import type { Class, Expense, Income, Student, Subject, Teacher, TeacherPayout, Report, Activity, Payout } from '@/lib/data';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

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

const getInitialState = (): Omit<AppContextType, 'loading' | 'refreshData'> => {
  if (typeof window !== 'undefined') {
    const cachedData = sessionStorage.getItem('appContextCache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        // Dates need to be re-hydrated
        return {
          ...parsed,
          income: parsed.income.map((i: any) => ({ ...i, date: new Date(i.date) })),
          expenses: parsed.expenses.map((e: any) => ({ ...e, date: new Date(e.date) })),
          allPayouts: parsed.allPayouts.map((p: any) => ({ ...p, payoutDate: new Date(p.payoutDate) })),
          activities: parsed.activities.map((a: any) => ({ ...a, date: new Date(a.date) })),
          academyShare: parsed.academyShare.map((a: any) => ({ ...a, payoutDate: new Date(a.payoutDate) })),
        };
      } catch (e) {
        console.error("Failed to parse app context cache", e);
      }
    }
  }
  return {
    students: [],
    teachers: [],
    classes: [],
    income: [],
    expenses: [],
    allSubjects: [],
    allPayouts: [],
    activities: [],
    academyShare: [],
  };
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [initialState] = useState(getInitialState);
  const [students, setStudents] = useState<Student[]>(initialState.students);
  const [teachers, setTeachers] = useState<Teacher[]>(initialState.teachers);
  const [classes, setClasses] = useState<Class[]>(initialState.classes);
  const [income, setIncome] = useState<Income[]>(initialState.income);
  const [expenses, setExpenses] = useState<Expense[]>(initialState.expenses);
  const [allSubjects, setAllSubjects] = useState<Subject[]>(initialState.allSubjects);
  const [allPayouts, setAllPayouts] = useState<(TeacherPayout & { report?: Report, academyShare?: number })[]>(initialState.allPayouts);
  const [activities, setActivities] = useState<Activity[]>(initialState.activities);
  const [academyShare, setAcademyShare] = useState<Payout[]>(initialState.academyShare);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    // Only show loader on initial hard load
    if (sessionStorage.getItem('appContextCache') === null) {
      setLoading(true);
    } else {
        setLoading(false);
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
      
      const fullState = {
        students: studentsData,
        teachers: teachersData,
        classes: classesData,
        income: incomeData,
        expenses: expensesData,
        allSubjects: allSubjectsData,
        allPayouts: allPayoutsData,
        activities: activitiesData,
        academyShare: academyShareData,
      };

      setStudents(studentsData);
      setTeachers(teachersData);
      setClasses(classesData);
      setIncome(incomeData);
      setExpenses(expensesData);
      setAllSubjects(allSubjectsData);
      setAllPayouts(allPayoutsData);
      setActivities(activitiesData);
      setAcademyShare(academyShareData);

      sessionStorage.setItem('appContextCache', JSON.stringify(fullState));

    } catch (error) {
      console.error("Failed to fetch app data:", error);
      // Handle error appropriately, maybe show a toast
    } finally {
       setLoading(false);
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
