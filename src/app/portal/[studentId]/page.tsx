'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getStudent, getStudentExams, getStudentIncomeHistory } from '@/lib/firebase/firestore';
import { Student, Exam, Income } from '@/lib/data';
import { useSettings } from '@/hooks/use-settings';
import { Logo } from '@/components/logo';
import { 
  Shield, Sun, Moon, LogOut, CheckCircle, Clock, 
  FileText, GraduationCap, BookOpen, Download, 
  Calculator, Receipt, Facebook, Twitter, Instagram, 
  MapPin, Phone, Mail, TrendingUp, CalendarCheck, 
  ChevronRight, Award, Percent, AlertCircle, User, ArrowLeft
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';

// --- Sub-components ---

const GlassCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl shadow-sm transition-all duration-300",
      className
    )}
  >
    {children}
  </div>
);

const PortalBadge = ({ children, colorClass }: { children: React.ReactNode, colorClass: string }) => (
  <span className={cn("px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border", colorClass)}>
    {children}
  </span>
);

const IconBox = ({ icon: Icon, className }: { icon: any, className: string }) => (
  <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 border", className)}>
    <Icon size={20} className="sm:w-6 sm:h-6" />
  </div>
);

function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export default function StudentPortalDashboard() {
  const { studentId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { settings, isSettingsLoading } = useSettings();
  const { theme, setTheme } = useTheme();
  
  const providedPhone = searchParams.get('p');
  
  const [student, setStudent] = useState<Student | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [incomeHistory, setIncomeHistory] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'ledger'>('results');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!studentId || !providedPhone) {
        setError('Verification required. Please log in through the portal page.');
        setLoading(false);
        return;
    }

    async function loadStudentData() {
      setLoading(true);
      try {
        const studentData = await getStudent(studentId as string);
        
        if (studentData && studentData.status === 'active') {
          const normalizedProvided = providedPhone?.replace(/\D/g, '');
          const normalizedRecord = studentData.phone?.replace(/\D/g, '');

          if (normalizedProvided !== normalizedRecord) {
            setError('Verification failed. The phone number does not match our records.');
            setLoading(false);
            return;
          }

          setStudent(studentData);
          const [examsData, historyData] = await Promise.all([
            getStudentExams(studentData.id, studentData.class),
            getStudentIncomeHistory(studentData.id)
          ]);
          setExams(examsData);
          setIncomeHistory(historyData);
        } else {
          setError('Student record not found or is currently inactive.');
        }
      } catch (e) {
        console.error(e);
        setError('Unable to retrieve portal data at this time.');
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, [studentId, providedPhone]);

  const totalPaid = useMemo(() => {
    return incomeHistory.reduce((sum, inc) => sum + inc.amount, 0);
  }, [incomeHistory]);

  const performanceData = useMemo(() => {
    if (!exams.length || !student) return [];
    return [...exams].reverse().map(exam => {
      const result = exam.results?.find(r => r.studentId === student.id);
      if (!result) return null;
      const obtained = Object.values(result.marks).reduce((sum, m) => sum + (typeof m === 'number' ? m : 0), 0);
      const total = exam.subjects.length * exam.totalMarks;
      return {
        name: exam.name.length > 10 ? exam.name.substring(0, 8) + '...' : exam.name,
        score: total > 0 ? Math.round((obtained / total) * 100) : 0,
      };
    }).filter((item): item is { name: string; score: number } => item !== null);
  }, [exams, student]);

  const handleConfetti = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSignOut = () => {
    router.push('https://www.saathsamundri.com');
  };

  if (loading || isSettingsLoading) {
    return <PortalSkeleton />;
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900">
        <GlassCard className="p-10 text-center max-w-md animate-fade-in border-slate-700">
            <div className="bg-rose-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">{error || 'Security verification failed.'}</p>
            <Button onClick={() => router.push('/portal')} className="w-full rounded-xl py-6 font-bold bg-primary hover:bg-primary/90 text-white shadow-xl">
              Back to Portal
            </Button>
        </GlassCard>
      </div>
    );
  }

  const isDarkMode = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 font-sans selection:bg-primary/30",
      isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
    )}>
      
      {/* Background Mesh */}
      <div className="fixed inset-0 -z-10 opacity-50 dark:opacity-20 pointer-events-none"
           style={{
             backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
             backgroundImage: isDarkMode 
              ? `radial-gradient(at 0% 0%, hsla(266,59%,20%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(189,100%,20%,1) 0px, transparent 50%)`
              : `radial-gradient(at 0% 0%, hsla(266,59%,94%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(189,100%,96%,1) 0px, transparent 50%)`
           }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg overflow-hidden p-1.5">
              <Logo noText />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-sm sm:text-lg leading-tight tracking-tight uppercase">{settings.name}</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:scale-110 transition-transform border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-500" />}
            </button>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all text-xs sm:text-sm font-bold uppercase tracking-wide border border-red-100 dark:border-red-900/30"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Profile Hero */}
        <GlassCard className="p-4 sm:p-8 relative overflow-hidden animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-float shadow-lg">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 p-1">
                  <Avatar className="w-full h-full rounded-full">
                    <AvatarImage src={student.imageUrl} className="object-cover" />
                    <AvatarFallback className="text-4xl font-bold text-primary bg-primary/5">{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-md">
                <CheckCircle size={12} className="text-white" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-md">
                ACTIVE
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-tight uppercase">
                  {student.name}
                </h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <PortalBadge colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50">
                    Roll No: {student.id}
                  </PortalBadge>
                  <PortalBadge colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/50">
                    {student.class}
                  </PortalBadge>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-600 dark:text-slate-400 pt-2 font-bold uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-primary" />
                  <span>{student.fatherName}</span>
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                <div className="flex items-center gap-2">
                  <CalendarCheck size={18} className="text-primary" />
                  <span>Session {settings.academicSession}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats (Desktop) */}
            <div className="hidden lg:flex flex-col gap-3 min-w-[140px]">
              <div className="bg-white/50 dark:bg-slate-700/50 p-3 rounded-xl flex items-center gap-3 border border-slate-200 dark:border-slate-600 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Performance</p>
                  <p className="font-bold text-lg tracking-tight">Active</p>
                </div>
              </div>
              <div className="bg-white/50 dark:bg-slate-700/50 p-3 rounded-xl flex items-center gap-3 border border-slate-200 dark:border-slate-600 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Percent size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Attendance</p>
                  <p className="font-bold text-lg tracking-tight text-green-500">98%</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Finance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Paid Card */}
          <GlassCard className="p-6 relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform border-slate-200 dark:border-slate-700" onClick={handleConfetti}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex justify-between items-start">
              <div className="space-y-4">
                <IconBox icon={CheckCircle} className="bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-green-500/30 border-green-400/20" />
                <div>
                  <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Fees Paid</p>
                  <h3 className="text-3xl font-bold mt-1 tabular-nums">{totalPaid.toLocaleString()} <span className="text-sm font-normal text-slate-500">PKR</span></h3>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-black uppercase tracking-widest">
              <TrendingUp size={16} />
              <span>Verified Records</span>
            </div>
          </GlassCard>

          {/* Dues Card */}
          <GlassCard className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform border-slate-200 dark:border-slate-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex justify-between items-start">
              <div className="space-y-4">
                <IconBox icon={Clock} className="bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-amber-500/30 border-amber-400/20" />
                <div>
                  <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Dues Pending</p>
                  <h3 className={cn("text-3xl font-bold mt-1 tabular-nums", student.totalFee > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400")}>
                    {student.totalFee.toLocaleString()} <span className="text-sm font-normal text-slate-500">PKR</span>
                  </h3>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-black uppercase tracking-widest">
              {student.totalFee > 0 ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              <span>{student.totalFee > 0 ? 'Pending Payment' : 'Account Cleared'}</span>
            </div>
          </GlassCard>

          {/* Status Card */}
          <GlassCard className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform sm:col-span-2 lg:col-span-1 border-slate-200 dark:border-slate-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex justify-between items-start">
              <div className="space-y-4">
                <IconBox icon={FileText} className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-blue-500/30 border-blue-400/20" />
                <div>
                  <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Current Status</p>
                  <h3 className={cn(
                    "text-3xl font-bold mt-1 uppercase tracking-tighter",
                    student.feeStatus === 'Paid' ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  )}>
                    {student.feeStatus}
                  </h3>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border shadow-sm",
                student.feeStatus === 'Paid' ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
              )}>
                <span className={cn("w-2 h-2 rounded-full animate-pulse", student.feeStatus === 'Paid' ? "bg-green-500" : "bg-amber-500")} />
                {student.feeStatus === 'Paid' ? 'Verified' : 'Action Required'}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-widest">
              <Receipt size={16} />
              <span>Session {settings.academicSession}</span>
            </div>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-1.5 inline-flex relative shadow-md border border-slate-200 dark:border-slate-700">
            <div 
              className="absolute top-1.5 bottom-1.5 w-1/2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl transition-all duration-300 ease-out shadow-lg"
              style={{ left: activeTab === 'results' ? '6px' : '50%' }}
            />
            <button 
              onClick={() => setActiveTab('results')}
              className={`relative z-10 flex-1 sm:flex-none px-6 sm:px-12 py-2.5 rounded-xl font-black uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-2 text-[10px] sm:text-xs ${activeTab === 'results' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-primary'}`}
            >
              <TrendingUp size={18} />
              <span>RESULTS</span>
            </button>
            <button 
              onClick={() => setActiveTab('ledger')}
              className={`relative z-10 flex-1 sm:flex-none px-6 sm:px-12 py-2.5 rounded-xl font-black uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-2 text-[10px] sm:text-xs ${activeTab === 'ledger' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-primary'}`}
            >
              <BookOpen size={18} />
              <span>LEDGER</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in pb-12">
          {activeTab === 'results' ? (
            <div className="space-y-6">
                <GlassCard className="overflow-hidden border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center gap-4">
                    <IconBox icon={GraduationCap} className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-400/20" />
                    <div>
                        <h3 className="text-xl font-bold tracking-tight uppercase">Academic Records</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mt-0.5">Official examination results matrix</p>
                    </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-[0.2em]">
                        CYCLE {settings.academicSession}
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                        <tr>
                        <th className="px-10 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Examination Name</th>
                        <th className="px-10 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Subjects</th>
                        <th className="px-10 py-4 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Raw Score</th>
                        <th className="px-10 py-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Performance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {exams.length > 0 ? exams.map((exam) => {
                            const result = exam.results?.find(r => r.studentId === student.id);
                            if (!result) return null;
                            const obtained = Object.values(result.marks).reduce((sum, m) => sum + (typeof m === 'number' ? m : 0), 0);
                            const total = exam.subjects.length * exam.totalMarks;
                            const percentage = total > 0 ? (obtained / total) * 100 : 0;

                            return (
                                <tr key={exam.id} className="hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors group">
                                    <td className="px-10 py-6">
                                        <div className="font-bold text-lg text-blue-600 dark:text-blue-400 tracking-tight uppercase">{exam.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{format(exam.date, 'MMMM yyyy')}</div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {exam.subjects.map(sub => (
                                                <PortalBadge key={sub} colorClass="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/50 uppercase tracking-widest text-[9px] font-black">{sub}</PortalBadge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-base tabular-nums">
                                            {obtained} <span className="text-slate-400 dark:text-slate-500 font-normal">/ {total}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm tracking-widest border shadow-sm",
                                            percentage >= 80 ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20" : 
                                            percentage >= 50 ? "bg-blue-500 text-white border-blue-400 shadow-blue-500/20" : 
                                            "bg-rose-500 text-white border-rose-400 shadow-rose-500/20"
                                        )}>
                                            {percentage.toFixed(1)}%
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={4} className="h-48 text-center text-slate-400 font-black uppercase tracking-widest opacity-20">No Results Found</td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>

                {/* Mobile List */}
                <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {exams.map((exam) => {
                        const result = exam.results?.find(r => r.studentId === student.id);
                        if (!result) return null;
                        const obtained = Object.values(result.marks).reduce((sum, m) => sum + (typeof m === 'number' ? m : 0), 0);
                        const total = exam.subjects.length * exam.totalMarks;
                        const percentage = total > 0 ? (obtained / total) * 100 : 0;

                        return (
                            <div key={exam.id} className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400 tracking-tight uppercase">{exam.name}</span>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(exam.date, 'MMMM yyyy')}</p>
                                    </div>
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-widest border",
                                        percentage >= 80 ? "bg-emerald-500 text-white border-emerald-400" : "bg-blue-500 text-white border-blue-400"
                                    )}>
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {exam.subjects.map(sub => (
                                        <PortalBadge key={sub} colorClass="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/50 uppercase tracking-widest text-[9px] font-black">{sub}</PortalBadge>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <span className="text-slate-400">Total Score</span>
                                    <span className="text-slate-900 dark:text-white">{obtained} / {total}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Chart */}
                {performanceData.length > 0 && (
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 h-[300px]">
                        <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-3 text-slate-400">
                        <TrendingUp size={18} className="text-blue-500" />
                        Growth Analysis Matrix
                        </h4>
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 900}} 
                                dy={10} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 900}} 
                                domain={[0, 100]}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: isDarkMode ? '#1e293b' : '#fff', 
                                    borderRadius: '1rem', 
                                    border: '1px solid #e2e8f0', 
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '1rem'
                                }}
                                itemStyle={{ color: '#8b5cf6', fontWeight: 900, fontSize: '1rem' }}
                                labelStyle={{ fontWeight: 900, marginBottom: '0.25rem', color: '#64748b', fontSize: '0.7rem' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
                </GlassCard>
            </div>
          ) : (
            <div className="space-y-6">
                <GlassCard className="overflow-hidden border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center gap-4">
                    <IconBox icon={BookOpen} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20 border-emerald-400/20" />
                    <div>
                        <h3 className="text-xl font-bold tracking-tight uppercase">Verified Fee Ledger</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mt-0.5">Comprehensive transaction timeline</p>
                    </div>
                    </div>
                    <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all font-black text-[10px] uppercase tracking-widest">
                        <Download size={16} className="text-primary" />
                        <span>Download Statement</span>
                    </button>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                        <tr>
                        <th className="px-10 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Transaction Date</th>
                        <th className="px-10 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Verified Receipt ID</th>
                        <th className="px-10 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Billing Cycle</th>
                        <th className="px-10 py-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Credit Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {incomeHistory.length > 0 ? incomeHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-emerald-[0.02] dark:hover:bg-emerald-[0.05] transition-colors group">
                            <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 shadow-inner">
                                <CalendarCheck size={18} />
                                </div>
                                <div>
                                <p className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">{format(item.date, 'MMMM do, yyyy')}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(item.date, 'hh:mm a')}</p>
                                </div>
                            </div>
                            </td>
                            <td className="px-10 py-6">
                            <code className="text-xs bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl font-mono text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700 shadow-inner">
                                {item.receiptId || item.id.substring(0, 12).toUpperCase()}
                            </code>
                            </td>
                            <td className="px-10 py-6">
                            <PortalBadge colorClass="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 uppercase tracking-widest text-[9px] font-black">
                                {item.forMonth || format(item.date, 'MMMM yyyy')}
                            </PortalBadge>
                            </td>
                            <td className="px-10 py-6 text-right">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter">
                                +{item.amount.toLocaleString()} <span className="text-xs font-bold opacity-40 ml-1">PKR</span>
                            </span>
                            </td>
                        </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="h-48 text-center text-slate-400 font-black uppercase tracking-widest opacity-20">No Financial Records</td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>

                {/* Mobile List */}
                <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {incomeHistory.map((item) => (
                    <div key={item.id} className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shadow-inner">
                            <CalendarCheck size={18} />
                            </div>
                            <div>
                            <p className="font-bold text-sm tracking-tight">{format(item.date, 'MMM d, yyyy')}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(item.date, 'hh:mm a')}</p>
                            </div>
                        </div>
                        <span className="text-xl font-black text-emerald-600 tabular-nums tracking-tighter">+{item.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                        <span className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-[10px] text-slate-500 font-black border border-slate-200 dark:border-slate-700">{item.receiptId || 'OFFICIAL'}</span>
                        <PortalBadge colorClass="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 uppercase tracking-widest text-[9px] font-black">{item.forMonth || 'MONTHLY'}</PortalBadge>
                        </div>
                    </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="p-6 sm:p-10 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50/30 dark:bg-slate-800/10">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl flex items-center gap-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aggregate Paid</p>
                        <p className="text-xl font-black tracking-tighter">{totalPaid.toLocaleString()} PKR</p>
                    </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl flex items-center gap-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 border border-purple-500/20">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Cycles</p>
                        <p className="text-xl font-black tracking-tighter">{incomeHistory.length} Payments</p>
                    </div>
                    </div>
                    <div className={cn(
                        "p-5 rounded-2xl flex items-center gap-5 border shadow-sm",
                        student.totalFee === 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
                    )}>
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg",
                        student.totalFee === 0 ? "bg-emerald-500 text-white border-emerald-400" : "bg-amber-500 text-white border-amber-400"
                    )}>
                        {student.totalFee === 0 ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fiscal Status</p>
                        <p className={cn(
                            "text-xl font-black tracking-tighter uppercase",
                            student.totalFee === 0 ? "text-emerald-600" : "text-amber-600"
                        )}>{student.totalFee === 0 ? 'CLEARED' : 'PENDING'}</p>
                    </div>
                    </div>
                </div>
                </GlassCard>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border border-white/30 dark:border-slate-700/50 mb-10">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-xl p-2">
                    <Logo noText />
                  </div>
                  <div>
                    <h4 className="font-black text-xl tracking-tighter uppercase text-slate-900 dark:text-white leading-none">{settings.name}</h4>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1">Excellence in Education</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md font-medium">
                  Dedicated to providing a transformative educational experience through personalized learning and state-of-the-art academic resources.
                </p>
                <div className="flex gap-4">
                  {[Facebook, Twitter, Instagram, Mail].map((Icon, i) => (
                    <a key={i} href="#" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white border border-slate-200 dark:border-slate-700 transition-all duration-300">
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <h5 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Navigation Matrix</h5>
                <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                  <li><button onClick={() => router.push('/portal')} className="hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> Main Portal</button></li>
                  <li><button className="hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> Academic Calendar</button></li>
                  <li><button className="hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> Help & Support</button></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h5 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Administration Contact</h5>
                <ul className="space-y-5 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <MapPin size={16} />
                    </div>
                    <span className="leading-tight text-[10px] font-black uppercase tracking-wider">{settings.address}</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <Phone size={16} />
                    </div>
                    <span className="text-primary font-black tracking-tight text-base">{settings.phone}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="py-8 bg-slate-100/50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    &copy; {new Date().getFullYear()} {settings.name} • All Rights Reserved. 
                </p>
                <div className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4">
                    <span>Powered by <span className="text-primary hover:underline cursor-pointer transition-all">SchoolUP Platform</span></span>
                    <span className="hidden sm:block text-slate-300">|</span>
                    <span>Developed by <span className="text-primary hover:underline cursor-pointer transition-all">Mian Mudassar</span></span>
                </div>
            </div>
        </footer>

      </main>

      {/* Toast Notification */}
      <div className={cn(
        "fixed bottom-6 right-6 transform transition-all duration-500 z-50",
        showToast ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-90"
      )}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-l-4 border-emerald-500 flex items-center gap-5 border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shadow-inner">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white">Congratulations!</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">Your payment status is verified</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
