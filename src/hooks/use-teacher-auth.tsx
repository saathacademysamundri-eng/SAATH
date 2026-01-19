
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Teacher } from '@/lib/data';
import { getTeacherByEmail } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

interface TeacherAuthContextType {
  teacher: Teacher | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updatePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

const TeacherAuthContext = createContext<TeacherAuthContextType | undefined>(undefined);

const TEACHER_SESSION_KEY = 'teacherAuth';

export const TeacherAuthProvider = ({ children }: { children: ReactNode }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user && user.email) {
         try {
          const storedTeacher = sessionStorage.getItem(TEACHER_SESSION_KEY);
          if (storedTeacher) {
            const parsed = JSON.parse(storedTeacher);
            if (parsed.email === user.email) {
              setTeacher(parsed);
              setLoading(false);
              return;
            }
          }
          
          const teacherData = await getTeacherByEmail(user.email);
          if (teacherData) {
            setTeacher(teacherData);
            sessionStorage.setItem(TEACHER_SESSION_KEY, JSON.stringify(teacherData));
          } else {
            setTeacher(null);
          }
        } catch (error) {
          console.error("Failed to process teacher session", error);
          setTeacher(null);
          sessionStorage.removeItem(TEACHER_SESSION_KEY);
        }
      } else {
        setTeacher(null);
        sessionStorage.removeItem(TEACHER_SESSION_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      if (user.email) {
        const teacherData = await getTeacherByEmail(user.email);
        if (teacherData) {
          setTeacher(teacherData);
          sessionStorage.setItem(TEACHER_SESSION_KEY, JSON.stringify(teacherData));
          setLoading(false);
          router.push('/teacher/dashboard');
          return { success: true, message: 'Login successful' };
        } else {
          await signOut(auth);
          setLoading(false);
          return { success: false, message: 'This account does not have teacher privileges.' };
        }
      }
      throw new Error("User has no email.");
    } catch (error: any) {
      setLoading(false);
      console.error("Teacher login failed: ", error.code);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        return { success: false, message: 'Invalid email or password.' };
      }
      return { success: false, message: 'An unknown error occurred during login.' };
    }
  }, [router]);

  const logout = useCallback(async () => {
    setLoading(true);
    await signOut(auth);
    setTeacher(null);
    sessionStorage.removeItem(TEACHER_SESSION_KEY);
    router.push('/teacher/login');
    setLoading(false);
  }, [router]);

  const updatePassword = useCallback(async (currentPass: string, newPass: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, message: 'No authenticated user found.' };
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      return { success: true, message: 'Password updated successfully.' };
    } catch (error: any) {
      console.error('Password update failed:', error);
      let errorMessage = 'An unexpected error occurred.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'The current password you entered is incorrect.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      return { success: false, message: errorMessage };
    }
  }, []);

  const value = { teacher, loading, login, logout, updatePassword };

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
