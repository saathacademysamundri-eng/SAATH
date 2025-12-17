
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Teacher } from '@/lib/data';
import { getTeacherByEmail } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';

interface TeacherAuthContextType {
  teacher: Teacher | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const TeacherAuthContext = createContext<TeacherAuthContextType | undefined>(undefined);

const TEACHER_SESSION_KEY = 'teacherAuth';

export const TeacherAuthProvider = ({ children }: { children: ReactNode }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedTeacher = sessionStorage.getItem(TEACHER_SESSION_KEY);
      if (storedTeacher) {
        setTeacher(JSON.parse(storedTeacher));
      }
    } catch (error) {
      console.error("Failed to parse teacher session data", error);
      sessionStorage.removeItem(TEACHER_SESSION_KEY);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    // In a real app, you would hash and compare the password.
    // For this prototype, we'll fetch the teacher and do a simple check.
    const teacherData = await getTeacherByEmail(email);

    if (teacherData && teacherData.phone === pass) { // Using phone as password for prototype
      setTeacher(teacherData);
      sessionStorage.setItem(TEACHER_SESSION_KEY, JSON.stringify(teacherData));
      setLoading(false);
      router.push('/teacher/dashboard');
      return { success: true, message: 'Login successful' };
    } else {
      setLoading(false);
      return { success: false, message: 'Invalid email or password.' };
    }
  }, [router]);

  const logout = useCallback(() => {
    setTeacher(null);
    sessionStorage.removeItem(TEACHER_SESSION_KEY);
    router.push('/teacher/login');
  }, [router]);

  const value = { teacher, loading, login, logout };

  return (
    <TeacherAuthContext.Provider value={value}>
      {children}
    </TeacherAuthContext.Provider>
  );
};

export const useTeacherAuth = () => {
  const context = useContext(TeacherAuthContext);
  if (context === undefined) {
    throw new Error('useTeacherAuth must be used within a TeacherAuthProvider');
  }
  return context;
};
