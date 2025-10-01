
'use client';

import { getClasses, getExpenses, getIncome, getStudents, getTeachers, getAllSubjects } from '@/lib/firebase/firestore';
import type { Class, Expense, Income, Student, Subject, Teacher } from '@/lib/data';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

interface AppContextType {
  students: Student[];
  teachers: Teacher[];
  classes: Class[];
  income: Income[];
  expenses: Expense[];
  allSubjects: Subject[];
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
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        studentsData,
        teachersData,
        classesData,
        incomeData,
        expensesData,
        allSubjectsData
      ] = await Promise.all([
        getStudents(),
        getTeachers(),
        getClasses(),
        getIncome(),
        getExpenses(),
        getAllSubjects(),
      ]);

      setStudents(studentsData);
      setTeachers(teachersData);
      setClasses(classesData);
      setIncome(incomeData);
      setExpenses(expensesData);
      setAllSubjects(allSubjectsData);

    } catch (error) {
      console.error("Failed to fetch app data:", error);
      // Handle error appropriately, maybe show a toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = {
    students,
    teachers,
    classes,
    income,
    expenses,
    allSubjects,
    loading,
    refreshData: fetchData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
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
