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
import { ArrowLeft, Wallet, GraduationCap, Calendar, CheckCircle2, AlertCircle, ShieldCheck, User, BookOpen, Star } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24 rounded-full" />
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-slate-100">
            <div className="bg-red-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">{error || 'Security verification failed.'}</p>
            <Button onClick={() => router.push('/portal')} className="w-full rounded-xl py-6 font-bold shadow-lg shadow-primary/20">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portal
            </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Dynamic Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-auto">
                <Logo noText />
            </div>
            <span className="font-bold text-slate-900 dark:text-white hidden sm:inline-block tracking-tight">{settings.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/portal')} className="text-slate-500 font-semibold hover:bg-slate-100 rounded-full px-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Profile Card */}
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <Card className="relative border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <GraduationCap className="h-32 w-32" />
                </div>
                <CardContent className="p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8">
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-primary/10 shadow-xl">
                        <AvatarImage src={student.imageUrl} alt={student.name} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left space-y-3 flex-1">
                        <div className="space-y-1">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{student.name}</h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Class: <span className="text-primary font-bold">{student.class}</span> • Roll No: <span className="text-primary font-bold">{student.id}</span></p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold px-3 py-1 rounded-lg">
                                <User className="h-3.5 w-3.5 mr-1.5" /> {student.fatherName}
                            </Badge>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold px-3 py-1 rounded-lg">
                                <Star className="h-3.5 w-3.5 mr-1.5" /> Session {settings.academicSession}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{totalPaid.toLocaleString()} <span className="text-xs font-bold text-slate-400">PKR</span></p>
                </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl", student.totalFee > 0 ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30")}>
                    <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pending Dues</p>
                    <p className={cn("text-2xl font-black", student.totalFee > 0 ? "text-amber-600" : "text-emerald-600")}>
                        {student.totalFee.toLocaleString()} <span className="text-xs font-bold text-slate-400">PKR</span>
                    </p>
                </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/5 p-3 rounded-2xl text-primary">
                    <Wallet className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Status</p>
                    <p className={cn("text-xl font-black", 
                        student.feeStatus === 'Paid' ? "text-emerald-600" : "text-amber-600"
                    )}>{student.feeStatus}</p>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 w-full sm:w-fit mb-8">
            <TabsTrigger value="results" className="flex-1 sm:flex-none text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl px-8 py-3 transition-all duration-300">
              <GraduationCap className="mr-2 h-5 w-5" /> Results
            </TabsTrigger>
            <TabsTrigger value="ledger" className="flex-1 sm:flex-none text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl px-8 py-3 transition-all duration-300">
              <Wallet className="mr-2 h-5 w-5" /> Finance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-6">
            <Card className="shadow-sm border-none rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-xl text-white">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Academic Performance</CardTitle>
                        <CardDescription>Verified results for examinations conducted during this session.</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/20">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="font-black text-xs uppercase text-slate-400 py-5 pl-8">Exam Title</TableHead>
                        <TableHead className="font-black text-xs uppercase text-slate-400 py-5">Subject Breakdown</TableHead>
                        <TableHead className="text-center font-black text-xs uppercase text-slate-400 py-5">Marks</TableHead>
                        <TableHead className="text-right font-black text-xs uppercase text-slate-400 py-5 pr-8">Performance</TableHead>
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
                          <TableRow key={exam.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                            <TableCell className="py-6 pl-8">
                                <div className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{exam.name}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{format(exam.date, 'MMM yyyy')}</div>
                            </TableCell>
                            <TableCell className="py-6">
                              <div className="flex flex-wrap gap-1.5">
                                {exam.subjects.map(s => <Badge key={s} variant="outline" className="font-semibold text-[10px] bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-2 py-0"> {s} </Badge>)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-6">
                                <div className="font-black text-slate-900 dark:text-white">{obtained} <span className="text-slate-300 font-normal text-sm">/ {total}</span></div>
                            </TableCell>
                            <TableCell className="text-right py-6 pr-8">
                              <Badge className={cn("text-xs font-black px-3 py-1 rounded-lg", 
                                percentage >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50" : 
                                percentage >= 50 ? "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50" : 
                                "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50"
                              )} variant="outline">
                                {percentage.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center py-10">
                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                <AlertCircle className="h-12 w-12 opacity-30" />
                                <p className="text-lg font-bold">No results available yet</p>
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

          <TabsContent value="ledger">
            <Card className="shadow-sm border-none rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-xl text-white">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Fee Statement</CardTitle>
                        <CardDescription>Chronological log of verified fee payments and installments.</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/20">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="font-black text-xs uppercase text-slate-400 py-5 pl-8">Transaction Date</TableHead>
                        <TableHead className="font-black text-xs uppercase text-slate-400 py-5">Receipt ID</TableHead>
                        <TableHead className="font-black text-xs uppercase text-slate-400 py-5">Payment For</TableHead>
                        <TableHead className="text-right font-black text-xs uppercase text-slate-400 py-5 pr-8">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeHistory.length > 0 ? incomeHistory.map(inc => (
                        <TableRow key={inc.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <TableCell className="py-6 pl-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{format(inc.date, 'PPP')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <code className="text-[10px] bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md font-mono text-slate-500 font-bold border border-slate-100 dark:border-slate-700">
                                {inc.receiptId || inc.id.substring(0, 8)}
                            </code>
                          </TableCell>
                          <TableCell className="py-6">
                            <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-lg px-2.5">
                                {inc.forMonth || format(inc.date, 'MMM yyyy')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-6 pr-8">
                            <span className="text-xl font-black text-emerald-600">+{inc.amount.toLocaleString()} <span className="text-[10px] opacity-50">PKR</span></span>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center py-10">
                             <div className="flex flex-col items-center gap-3 text-slate-300">
                                <Wallet className="h-12 w-12 opacity-30" />
                                <p className="text-lg font-bold">No payment history found</p>
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
      
      {/* Soft Footer */}
      <footer className="mt-20 pt-12 border-t bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 pb-12">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-auto">
                        <Logo noText />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white tracking-tight text-xl uppercase">{settings.name}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed font-medium">Providing excellence in education and personalized learning experiences for every student since our inception.</p>
            </div>
            <div className="space-y-4 md:text-right">
                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-sm">Contact Administration</p>
                <div className="text-slate-500 dark:text-slate-400 text-sm space-y-1 font-medium">
                    <p>{settings.address}</p>
                    <p>Hotline: {settings.phone}</p>
                </div>
            </div>
        </div>
        <div className="border-t py-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <p>&copy; {new Date().getFullYear()} {settings.name}</p>
                <p className="opacity-50">Powered by SchoolUP Platform</p>
            </div>
        </div>
      </footer>
    </main>
  );
}
