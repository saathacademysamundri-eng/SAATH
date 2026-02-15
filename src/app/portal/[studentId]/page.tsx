'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getStudent, getStudentExams, getStudentIncomeHistory } from '@/lib/firebase/firestore';
import { Student, Exam, Income } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { Logo } from '@/components/logo';
import { ArrowLeft, Wallet, GraduationCap, Calendar, CheckCircle2, AlertCircle, ShieldCheck, User, BookOpen, Star, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeSwitcher } from '@/components/theme-switcher';

function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function StudentPortalDashboard() {
  const { studentId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { settings, isSettingsLoading } = useSettings();
  
  const providedPhone = searchParams.get('p');
  
  const [student, setStudent] = useState<Student | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [incomeHistory, setIncomeHistory] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading || isSettingsLoading) {
    return <PortalSkeleton />;
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl text-center max-w-md border border-slate-100 dark:border-slate-800">
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{error || 'Security verification failed.'}</p>
            <Button onClick={() => router.push('/portal')} className="w-full rounded-xl py-6 font-bold shadow-lg shadow-primary/20">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portal
            </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-auto">
                <Logo noText />
            </div>
            <span className="font-bold text-slate-900 dark:text-white hidden sm:inline-block tracking-tight text-lg uppercase">{settings.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" onClick={() => router.push('/portal')} className="text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 rounded-full px-4 gap-2 transition-all">
              <LogOut className="h-4 w-4" /> <span className="hidden xs:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Profile Card */}
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-indigo-500 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
            <Card className="relative border-none shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] rotate-12">
                    <GraduationCap className="h-64 w-64" />
                </div>
                <CardContent className="p-8 sm:p-12 flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-12">
                    <div className="relative">
                        <Avatar className="h-32 w-32 sm:h-40 sm:w-40 ring-8 ring-slate-50 dark:ring-slate-800/50 shadow-2xl">
                            <AvatarImage src={student.imageUrl} alt={student.name} className="object-cover" />
                            <AvatarFallback className="bg-primary/5 text-primary text-5xl font-black">{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full border-4 border-white dark:border-slate-900 shadow-lg uppercase tracking-widest">
                            Active
                        </div>
                    </div>
                    <div className="text-center md:text-left space-y-4 flex-1">
                        <div className="space-y-1">
                            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{student.name}</h1>
                            <p className="text-xl text-slate-400 dark:text-slate-500 font-bold tracking-tight">Roll No: <span className="text-primary">{student.id}</span> • Class: <span className="text-primary">{student.class}</span></p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-black px-4 py-1.5 rounded-xl text-xs uppercase tracking-widest border-none">
                                <User className="h-3.5 w-3.5 mr-2 text-primary" /> {student.fatherName}
                            </Badge>
                            <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-black px-4 py-1.5 rounded-xl text-xs uppercase tracking-widest border-none">
                                <Star className="h-3.5 w-3.5 mr-2" /> Session {settings.academicSession}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-md rounded-3xl bg-white dark:bg-slate-900 transition-transform hover:scale-[1.02] duration-300">
            <CardContent className="p-8 flex items-center gap-6">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Fees Paid</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{totalPaid.toLocaleString()} <span className="text-sm font-bold opacity-30">PKR</span></p>
                </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md rounded-3xl bg-white dark:bg-slate-900 transition-transform hover:scale-[1.02] duration-300">
            <CardContent className="p-8 flex items-center gap-6">
                <div className={cn("p-4 rounded-2xl", student.totalFee > 0 ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400")}>
                    <AlertCircle className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Dues Pending</p>
                    <p className={cn("text-3xl font-black tabular-nums", student.totalFee > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>
                        {student.totalFee.toLocaleString()} <span className="text-sm font-bold opacity-30">PKR</span>
                    </p>
                </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-3xl bg-white dark:bg-slate-900 transition-transform hover:scale-[1.02] duration-300">
            <CardContent className="p-8 flex items-center gap-6">
                <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl text-primary dark:text-primary-foreground/80">
                    <Wallet className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Fee Status</p>
                    <p className={cn("text-2xl font-black uppercase tracking-tight", 
                        student.feeStatus === 'Paid' ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    )}>{student.feeStatus}</p>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Content Tabs */}
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-[2rem] shadow-inner border dark:border-slate-800 w-full sm:w-fit mb-10 overflow-hidden">
            <TabsTrigger value="results" className="flex-1 sm:flex-none text-sm font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary data-[state=active]:shadow-xl rounded-[1.8rem] px-10 py-4 transition-all duration-500">
              <GraduationCap className="mr-2 h-4 w-4" /> Results
            </TabsTrigger>
            <TabsTrigger value="ledger" className="flex-1 sm:flex-none text-sm font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary data-[state=active]:shadow-xl rounded-[1.8rem] px-10 py-4 transition-all duration-500">
              <Wallet className="mr-2 h-4 w-4" /> Ledger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-10 py-8 border-b dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="bg-primary p-3 rounded-2xl text-white shadow-lg shadow-primary/20">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Academic Performance</CardTitle>
                        <CardDescription className="text-slate-400 dark:text-slate-500 font-bold">Official examination results for the current academic session.</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/20">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 py-6 pl-10 tracking-[0.2em]">Exam Name</TableHead>
                        <TableHead className="font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 py-6 tracking-[0.2em]">Subjects</TableHead>
                        <TableHead className="text-center font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 py-6 tracking-[0.2em]">Obtained Marks</TableHead>
                        <TableHead className="text-right font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 py-6 pr-10 tracking-[0.2em]">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.length > 0 ? exams.map(exam => {
                        const result = exam.results?.find(r => r.studentId === student.id);
                        if (!result) return null;

                        const obtained = Object.values(result.marks).reduce((sum, m) => sum + (typeof m === 'number' ? m : 0), 0);
                        const total = exam.subjects.length * exam.totalMarks;
                        const percentage = (obtained / total) * 100;

                        return (
                          <TableRow key={exam.id} className="border-slate-50 dark:border-slate-800 hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all group">
                            <TableCell className="py-8 pl-10">
                                <div className="font-black text-slate-900 dark:text-white text-lg group-hover:text-primary transition-colors">{exam.name}</div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.1em] mt-1">{format(exam.date, 'MMMM yyyy')}</div>
                            </TableCell>
                            <TableCell className="py-8">
                              <div className="flex flex-wrap gap-2">
                                {exam.subjects.map(s => <Badge key={s} variant="outline" className="font-bold text-[10px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-3 py-0.5 rounded-lg"> {s} </Badge>)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-8">
                                <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{obtained} <span className="text-slate-300 dark:text-slate-600 font-bold text-sm">/ {total}</span></div>
                            </TableCell>
                            <TableCell className="text-right py-8 pr-10">
                              <Badge className={cn("text-xs font-black px-4 py-1.5 rounded-xl border-none shadow-sm", 
                                percentage >= 80 ? "bg-emerald-500 text-white" : 
                                percentage >= 50 ? "bg-blue-500 text-white" : 
                                "bg-rose-500 text-white"
                              )} variant="default">
                                {percentage.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-64 text-center">
                            <div className="flex flex-col items-center gap-4 text-slate-200 dark:text-slate-800">
                                <GraduationCap className="h-20 w-20 opacity-20" />
                                <p className="text-xl font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">No results found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ledger" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-10 py-8 border-b dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Fee Ledger</CardTitle>
                        <CardDescription className="text-slate-400 dark:text-slate-500 font-bold">Verified history of all payments and financial transactions.</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/20">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 py-6 pl-10 tracking-[0.2em]">Transaction Date</TableHead>
                        <TableHead className="font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 py-6 tracking-[0.2em]">Receipt ID</TableHead>
                        <TableHead className="font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 py-6 tracking-[0.2em]">Billing Cycle</TableHead>
                        <TableHead className="text-right font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 py-6 pr-10 tracking-[0.2em]">Amount Received</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeHistory.length > 0 ? incomeHistory.map(inc => (
                        <TableRow key={inc.id} className="border-slate-50 dark:border-slate-800 hover:bg-emerald-[0.02] dark:hover:bg-emerald-[0.05] transition-all">
                          <TableCell className="py-8 pl-10">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-500">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <span className="font-black text-slate-700 dark:text-slate-200 text-lg tracking-tight">{format(inc.date, 'PPP')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-8">
                            <code className="text-xs bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-mono text-slate-500 dark:text-slate-400 font-black border border-slate-100 dark:border-slate-700">
                                {inc.receiptId || inc.id.substring(0, 8)}
                            </code>
                          </TableCell>
                          <TableCell className="py-8">
                            <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl px-4 py-1 border-none">
                                {inc.forMonth || format(inc.date, 'MMMM yyyy')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-8 pr-10">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">+{inc.amount.toLocaleString()} <span className="text-xs font-bold opacity-40">PKR</span></span>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-64 text-center">
                             <div className="flex flex-col items-center gap-4 text-slate-200 dark:text-slate-800">
                                <Wallet className="h-20 w-20 opacity-20" />
                                <p className="text-xl font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">No payment history found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Soft Branded Footer */}
      <footer className="mt-24 pt-16 border-t dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 pb-16">
            <div className="space-y-6 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <div className="h-10 w-auto">
                        <Logo noText />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white tracking-tighter text-2xl uppercase">{settings.name}</span>
                </div>
                <p className="text-slate-400 dark:text-slate-500 max-w-sm text-sm leading-relaxed font-bold mx-auto md:mx-0">
                    Providing excellence in education and personalized learning experiences for every student since our inception.
                </p>
            </div>
            <div className="space-y-6 text-center md:text-right">
                <p className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-[10px]">Contact Administration</p>
                <div className="text-slate-500 dark:text-slate-400 text-sm space-y-2 font-bold">
                    <p className="tracking-tight">{settings.address}</p>
                    <p className="text-primary text-lg">Hotline: {settings.phone}</p>
                </div>
            </div>
        </div>
        <div className="border-t dark:border-slate-800 py-8 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                <p>&copy; {new Date().getFullYear()} {settings.name}</p>
                <div className="flex items-center gap-4">
                    <span className="opacity-30">Powered by SchoolUP Platform</span>
                    <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                    <span className="text-primary">Dev by Mian Mudassar</span>
                </div>
            </div>
        </div>
      </footer>
    </main>
  );
}
