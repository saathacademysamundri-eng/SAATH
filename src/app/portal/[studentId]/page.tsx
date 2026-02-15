'use client';

import { useEffect, useState, useMemo } from 'react';
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
  ChevronRight, Award, Percent, Star, User, AlertCircle,
  TrendingDown, ArrowLeft
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
import { Badge } from '@/components/ui/badge';

// --- Sub-components ---

const GlassCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-2xl sm:rounded-[2.5rem] shadow-sm transition-all duration-300",
      className
    )}
  >
    {children}
  </div>
);

const PortalBadge = ({ children, colorClass }: { children: React.ReactNode, colorClass: string }) => (
  <span className={cn("px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border border-transparent shadow-sm", colorClass)}>
    {children}
  </span>
);

const IconBox = ({ icon: Icon, className }: { icon: any, className: string }) => (
  <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0", className)}>
    <Icon size={20} className="sm:w-6 sm:h-6" />
  </div>
);

function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
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
    // Sort oldest to newest for chart
    return [...exams].reverse().map(exam => {
      const result = exam.results?.find(r => r.studentId === student.id);
      if (!result) return null;
      const obtained = Object.values(result.marks).reduce((sum, m) => sum + (typeof m === 'number' ? m : 0), 0);
      const total = exam.subjects.length * exam.totalMarks;
      return {
        name: exam.name.length > 10 ? exam.name.substring(0, 8) + '...' : exam.name,
        score: total > 0 ? Math.round((obtained / total) * 100) : 0,
      };
    }).filter(Boolean);
  }, [exams, student]);

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
            <Button onClick={() => router.push('/portal')} className="w-full rounded-xl py-6 font-bold bg-primary hover:bg-primary/90 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portal
            </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 font-sans selection:bg-primary/30",
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    )}>
      
      {/* Background Mesh */}
      <div className="fixed inset-0 -z-10 opacity-50 dark:opacity-20 pointer-events-none"
           style={{
             backgroundColor: theme === 'dark' ? '#020617' : '#f8fafc',
             backgroundImage: theme === 'dark' 
              ? `radial-gradient(at 0% 0%, hsla(266,59%,20%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(189,100%,20%,1) 0px, transparent 50%)`
              : `radial-gradient(at 0% 0%, hsla(266,59%,94%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(189,100%,96%,1) 0px, transparent 50%)`
           }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg overflow-hidden p-1.5">
              <Logo noText />
            </div>
            <div className="flex flex-col">
              <h1 className="font-black text-xs sm:text-base leading-tight tracking-tighter uppercase">{settings.name}</h1>
              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Student Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:scale-110 transition-transform border border-slate-200 dark:border-slate-700"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-500" />}
            </button>
            <button 
              onClick={() => router.push('/portal')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-100 dark:border-rose-900/50 transition-all text-xs sm:text-sm font-black uppercase tracking-widest"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Profile Hero */}
        <GlassCard className="p-6 sm:p-10 relative overflow-hidden animate-fade-in-up border-slate-200 dark:border-slate-700">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] rotate-12 pointer-events-none">
              <GraduationCap size={240} />
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-br from-primary via-purple-500 to-indigo-500 animate-float shadow-2xl">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 p-1 overflow-hidden">
                  <Avatar className="w-full h-full rounded-full">
                    <AvatarImage src={student.imageUrl} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-5xl font-black">{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-lg">
                <CheckCircle size={16} className="text-white" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-lg uppercase tracking-[0.2em]">
                ACTIVE
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-4">
              <div className="space-y-2">
                <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                  {student.name}
                </h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                  <PortalBadge colorClass="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800">
                    Roll No: {student.id}
                  </PortalBadge>
                  <PortalBadge colorClass="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-800">
                    {student.class}
                  </PortalBadge>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-slate-500 dark:text-slate-400 pt-2 font-bold">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                    <User size={18} className="text-primary" />
                  </div>
                  <span className="uppercase tracking-widest text-[11px]">{student.fatherName}</span>
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                    <Star size={18} className="text-amber-500" />
                  </div>
                  <span className="uppercase tracking-widest text-[11px]">SESSION {settings.academicSession}</span>
                </div>
              </div>
            </div>

            {/* Attendance (Desktop Placeholder) */}
            <div className="hidden lg:flex flex-col gap-4 min-w-[180px]">
              <GlassCard className="bg-white/40 dark:bg-slate-800/40 p-4 flex items-center gap-4 border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</p>
                  <p className="font-black text-xl tracking-tight">Excellent</p>
                </div>
              </GlassCard>
              <GlassCard className="bg-white/40 dark:bg-slate-800/40 p-4 flex items-center gap-4 border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <Percent size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Access</p>
                  <p className="font-black text-xl tracking-tight text-emerald-500">SECURE</p>
                </div>
              </GlassCard>
            </div>
          </div>
        </GlassCard>

        {/* Finance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Paid Card */}
          <GlassCard className="p-8 relative overflow-hidden group border-slate-200 dark:border-slate-700">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative space-y-6">
              <IconBox icon={CheckCircle} className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30" />
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Total Fees Paid</p>
                <h3 className="text-4xl font-black mt-2 tabular-nums">{totalPaid.toLocaleString()} <span className="text-sm font-bold opacity-30">PKR</span></h3>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/5 py-2 px-4 rounded-xl border border-emerald-500/10 w-fit">
                <TrendingUp size={14} />
                <span>Verified Payments</span>
              </div>
            </div>
          </GlassCard>

          {/* Dues Card */}
          <GlassCard className="p-8 relative overflow-hidden group border-slate-200 dark:border-slate-700">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative space-y-6">
              <IconBox icon={Clock} className="bg-gradient-to-br from-rose-400 to-orange-600 text-white shadow-rose-500/30" />
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Outstanding Dues</p>
                <h3 className={cn("text-4xl font-black mt-2 tabular-nums", student.totalFee > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>
                    {student.totalFee.toLocaleString()} <span className="text-sm font-bold opacity-30">PKR</span>
                </h3>
              </div>
              <div className={cn(
                "flex items-center gap-2 text-xs font-black uppercase tracking-widest py-2 px-4 rounded-xl border w-fit",
                student.totalFee > 0 ? "text-rose-600 dark:text-rose-400 bg-rose-500/5 border-rose-500/10" : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10"
              )}>
                {student.totalFee > 0 ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                <span>{student.totalFee > 0 ? 'Action Required' : 'No Pending Dues'}</span>
              </div>
            </div>
          </GlassCard>

          {/* Status Card */}
          <GlassCard className="p-8 relative overflow-hidden group border-slate-200 dark:border-slate-700 sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative space-y-6">
              <div className="flex justify-between items-start">
                <IconBox icon={FileText} className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-blue-500/30" />
                <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border shadow-sm",
                    student.feeStatus === 'Paid' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                )}>
                    <span className={cn("w-2 h-2 rounded-full animate-pulse", student.feeStatus === 'Paid' ? "bg-emerald-500" : "bg-amber-500")} />
                    {student.feeStatus === 'Paid' ? 'Verified' : 'Pending'}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Account Billing Status</p>
                <h3 className={cn(
                    "text-4xl font-black mt-2 uppercase tracking-tighter",
                    student.feeStatus === 'Paid' ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                )}>
                    {student.feeStatus}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-primary dark:text-primary-foreground/80 text-xs font-black uppercase tracking-widest bg-primary/5 py-2 px-4 rounded-xl border border-primary/10 w-fit">
                <Receipt size={14} />
                <span>Last Activity: {incomeHistory[0] ? format(incomeHistory[0].date, 'MMM d, yyyy') : 'N/A'}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Custom Nav Tabs */}
        <div className="flex justify-center pt-4">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] p-2 inline-flex relative shadow-xl border border-slate-200 dark:border-slate-800">
            <div 
              className="absolute top-2 bottom-2 w-[calc(50%-8px)] bg-gradient-to-r from-primary to-indigo-600 rounded-[2rem] transition-all duration-500 ease-out shadow-lg"
              style={{ left: activeTab === 'results' ? '8px' : '50%' }}
            />
            <button 
              onClick={() => setActiveTab('results')}
              className={cn(
                "relative z-10 px-8 sm:px-12 py-4 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3",
                activeTab === 'results' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-primary'
              )}
            >
              <TrendingUp size={16} />
              <span>Academic Results</span>
            </button>
            <button 
              onClick={() => setActiveTab('ledger')}
              className={cn(
                "relative z-10 px-8 sm:px-12 py-4 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3",
                activeTab === 'ledger' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500'
              )}
            >
              <BookOpen size={16} />
              <span>Financial Ledger</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in pb-12">
          {activeTab === 'results' ? (
            <div className="space-y-8">
                <GlassCard className="overflow-hidden border-slate-200 dark:border-slate-700">
                    <div className="p-8 sm:p-10 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="flex items-center gap-6">
                            <IconBox icon={Award} className="bg-gradient-to-br from-primary to-indigo-600 text-white shadow-primary/20" />
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Academic Progress</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Session {settings.academicSession} Examination Reports</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <CalendarCheck size={16} className="text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Active Cycle</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/10">
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Exam Title</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Enrolled Subjects</th>
                                    <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Raw Marks</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Performance</th>
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
                                            <td className="px-10 py-8">
                                                <div className="font-black text-xl text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">{exam.name}</div>
                                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{format(exam.date, 'MMMM yyyy')}</div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-wrap gap-2">
                                                    {exam.subjects.map(sub => (
                                                        <Badge key={sub} variant="outline" className="font-bold text-[10px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg"> {sub} </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-lg tracking-tighter tabular-nums">
                                                    {obtained} <span className="text-slate-300 dark:text-slate-600 font-bold text-sm">/ {total}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm tracking-widest border shadow-sm",
                                                    percentage >= 80 ? "bg-emerald-500 text-white border-emerald-400" : 
                                                    percentage >= 50 ? "bg-primary text-white border-primary/50" : 
                                                    "bg-rose-500 text-white border-rose-400"
                                                )}>
                                                    {percentage.toFixed(1)}%
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={4} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20 dark:opacity-10">
                                                <GraduationCap size={80} />
                                                <p className="text-2xl font-black uppercase tracking-[0.2em]">No records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Chart Integration */}
                    {performanceData.length > 0 && (
                        <div className="p-8 sm:p-12 border-t border-slate-200 dark:border-slate-800 h-[400px]">
                            <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-10 flex items-center gap-3 text-slate-400">
                                <TrendingUp size={18} className="text-primary" />
                                Growth Analysis Matrix
                            </h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: theme === 'dark' ? '#475569' : '#94a3b8', fontSize: 10, fontWeight: 900}} 
                                        dy={15} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: theme === 'dark' ? '#475569' : '#94a3b8', fontSize: 10, fontWeight: 900}} 
                                        domain={[0, 100]}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', 
                                            borderRadius: '1.5rem', 
                                            border: '1px solid #e2e8f0', 
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '1.5rem'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 900, fontSize: '1rem' }}
                                        labelStyle={{ fontWeight: 900, marginBottom: '0.5rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </GlassCard>
            </div>
          ) : (
            <div className="space-y-8">
                <GlassCard className="overflow-hidden border-slate-200 dark:border-slate-700">
                    <div className="p-8 sm:p-10 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="flex items-center gap-6">
                            <IconBox icon={Receipt} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20" />
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Verified Transactions</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Comprehensive fee ledger & history</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all font-black text-[10px] uppercase tracking-widest">
                            <Download size={16} className="text-primary" />
                            <span>Download Statement</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/10">
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Transaction Timeline</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Verified Receipt ID</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Billing Period</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Credit Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {incomeHistory.length > 0 ? incomeHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-emerald-[0.02] dark:hover:bg-emerald-[0.05] transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 shadow-inner">
                                                    <CalendarCheck size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg text-slate-800 dark:text-slate-200 tracking-tight">{format(item.date, 'MMMM do, yyyy')}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{format(item.date, 'hh:mm a')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <code className="text-xs bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl font-mono text-slate-500 dark:text-slate-400 font-black border border-slate-200 dark:border-slate-700 shadow-inner">
                                                {item.receiptId || item.id.substring(0, 12).toUpperCase()}
                                            </code>
                                        </td>
                                        <td className="px-10 py-8">
                                            <PortalBadge colorClass="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800">
                                                {item.forMonth || format(item.date, 'MMMM yyyy')}
                                            </PortalBadge>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter">
                                                +{item.amount.toLocaleString()} <span className="text-xs font-bold opacity-40 ml-1">PKR</span>
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20 dark:opacity-10">
                                                <Wallet size={80} />
                                                <p className="text-2xl font-black uppercase tracking-[0.2em]">No payments recorded</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 sm:p-12 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-8 bg-slate-50/30 dark:bg-slate-800/10">
                        <GlassCard className="bg-white dark:bg-slate-800 p-6 flex items-center gap-5 border-slate-200 dark:border-slate-700">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                                <Calculator size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Paid</p>
                                <p className="text-2xl font-black tracking-tighter">{totalPaid.toLocaleString()} PKR</p>
                            </div>
                        </GlassCard>
                        <GlassCard className="bg-white dark:bg-slate-800 p-6 flex items-center gap-5 border-slate-200 dark:border-slate-700">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 border border-purple-500/20">
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transactions</p>
                                <p className="text-2xl font-black tracking-tighter">{incomeHistory.length} Payments</p>
                            </div>
                        </GlassCard>
                        <GlassCard className={cn(
                            "p-6 flex items-center gap-5 border",
                            student.totalFee === 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                        )}>
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center border",
                                student.totalFee === 0 ? "bg-emerald-500 text-white border-emerald-400" : "bg-rose-500 text-white border-rose-400"
                            )}>
                                {student.totalFee === 0 ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Status</p>
                                <p className={cn(
                                    "text-2xl font-black tracking-tighter uppercase",
                                    student.totalFee === 0 ? "text-emerald-600" : "text-rose-600"
                                )}>{student.totalFee === 0 ? 'CLEARED' : 'PENDING'}</p>
                            </div>
                        </GlassCard>
                    </div>
                </GlassCard>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/30 dark:border-slate-700/50 mb-10">
            <div className="max-w-7xl mx-auto px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-xl p-2">
                    <Logo noText />
                  </div>
                  <div>
                    <h4 className="font-black text-2xl tracking-tighter uppercase text-slate-900 dark:text-white leading-none">{settings.name}</h4>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1">Excellence in Education</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md font-bold">
                  Dedicated to providing a transformative educational experience through personalized learning, expert faculty, and state-of-the-art academic resources.
                </p>
                <div className="flex gap-4">
                  {[Facebook, Twitter, Instagram, Mail].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white border border-slate-200 dark:border-slate-700 transition-all duration-300">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <h5 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Navigation Matrix</h5>
                <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                  <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> Main Portal</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> Academic Calendar</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> Help & Support</a></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h5 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Administration Contact</h5>
                <ul className="space-y-5 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary flex-shrink-0 border border-slate-200 dark:border-slate-700">
                        <MapPin size={18} />
                    </div>
                    <span className="leading-tight">{settings.address}</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary flex-shrink-0 border border-slate-200 dark:border-slate-700">
                        <Phone size={18} />
                    </div>
                    <span className="text-primary font-black tracking-tight text-lg">{settings.phone}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="py-8 bg-slate-100/50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    &copy; {new Date().getFullYear()} {settings.name} • All Rights Reserved. 
                    <span className="text-primary ml-2">Engineered by SchoolUP Platform</span>
                </p>
                <div className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Developed by <span className="text-primary hover:underline cursor-pointer transition-all">Mian Mudassar</span>
                </div>
            </div>
        </footer>

      </main>

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
