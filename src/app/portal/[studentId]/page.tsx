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
import { ArrowLeft, Wallet, GraduationCap, Calendar, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
        setError('Missing credentials. Please log in again.');
        setLoading(false);
        return;
    }

    async function loadStudentData() {
      setLoading(true);
      try {
        const studentData = await getStudent(studentId as string);
        
        if (studentData && studentData.status === 'active') {
          // Security Check: Verify phone number
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
          setError('Student not found or record is inactive.');
        }
      } catch (e) {
        console.error(e);
        setError('An error occurred while fetching your data.');
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
    return (
      <div className="min-h-screen p-4 max-w-4xl mx-auto space-y-6 pt-12">
        <div className="flex justify-center mb-8"><Skeleton className="h-16 w-48" /></div>
        <Card><CardHeader><Skeleton className="h-20 w-full" /></CardHeader></Card>
        <div className="grid grid-cols-2 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/10">
        <div className="bg-destructive/10 p-6 rounded-full mb-6">
            <ShieldCheck className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-sm">{error || 'Could not verify student data.'}</p>
        <Button onClick={() => router.push('/portal')} variant="outline" className="rounded-full px-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Login
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 pb-12">
      {/* Beautiful Header */}
      <header className="bg-primary text-primary-foreground py-16 px-4 shadow-2xl relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="bg-white p-2 rounded-full shadow-2xl ring-4 ring-white/20">
                <Logo noText />
            </div>
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{student.name}</h1>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 self-center text-sm px-3">
                    Active Student
                </Badge>
              </div>
              <p className="text-primary-foreground/80 text-xl font-semibold opacity-90">Roll No: {student.id} | Class: {student.class}</p>
              <div className="flex items-center gap-2 justify-center md:justify-start text-primary-foreground/60">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm uppercase tracking-widest font-bold">{settings.name}</span>
              </div>
            </div>
          </div>
          <Button variant="secondary" size="lg" onClick={() => router.push('/portal')} className="rounded-full shadow-xl font-bold px-8 hover:scale-105 transition-transform">
            <ArrowLeft className="mr-2" /> Log Out
          </Button>
        </div>
        
        {/* Background Decor Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
      </header>

      <div className="max-w-5xl mx-auto -mt-10 px-4 grid gap-6">
        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 to-white dark:from-green-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Lifetime Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black text-green-700 dark:text-green-300">{totalPaid.toLocaleString()} <span className="text-sm font-bold opacity-60">PKR</span></p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-xl bg-gradient-to-br from-red-50 to-white dark:from-red-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Pending Dues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn("text-4xl font-black", student.totalFee > 0 ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300")}>
                {student.totalFee.toLocaleString()} <span className="text-sm font-bold opacity-60">PKR</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white dark:bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={cn("text-lg px-6 py-1 font-bold rounded-lg", 
                student.feeStatus === 'Paid' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-orange-100 text-orange-700 hover:bg-orange-100"
              )} variant="secondary">
                {student.feeStatus}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-16 p-1.5 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border">
            <TabsTrigger value="results" className="text-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all">
              <GraduationCap className="mr-2 h-5 w-5" /> Results
            </TabsTrigger>
            <TabsTrigger value="ledger" className="text-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all">
              <Wallet className="mr-2 h-5 w-5" /> Ledger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="shadow-2xl border-none overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <GraduationCap className="text-primary h-7 w-7" /> Examination Reports
                </CardTitle>
                <CardDescription>Comprehensive record of your performance in the current session.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="font-black text-xs uppercase tracking-wider py-5 pl-6">Exam Details</TableHead>
                        <TableHead className="font-black text-xs uppercase tracking-wider py-5">Subjects</TableHead>
                        <TableHead className="text-center font-black text-xs uppercase tracking-wider py-5">Obtained</TableHead>
                        <TableHead className="text-center font-black text-xs uppercase tracking-wider py-5">Total</TableHead>
                        <TableHead className="text-right font-black text-xs uppercase tracking-wider py-5 pr-6">Performance</TableHead>
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
                          <TableRow key={exam.id} className="hover:bg-muted/20 transition-colors group">
                            <TableCell className="py-6 pl-6">
                                <div className="font-black text-lg group-hover:text-primary transition-colors">{exam.name}</div>
                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Session {exam.academicSession}</div>
                            </TableCell>
                            <TableCell className="py-6">
                              <div className="flex flex-wrap gap-1.5">
                                {exam.subjects.map(s => <Badge key={s} variant="outline" className="font-bold bg-background/50 border-primary/20">{s}</Badge>)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-6">
                                <span className="text-xl font-black text-primary">{obtained}</span>
                            </TableCell>
                            <TableCell className="text-center py-6 font-bold text-muted-foreground">{total}</TableCell>
                            <TableCell className="text-right py-6 pr-6">
                              <Badge className={cn("text-sm font-black px-4 py-1", 
                                percentage >= 80 ? "bg-green-100 text-green-700 hover:bg-green-100" : 
                                percentage >= 50 ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : 
                                "bg-red-100 text-red-700 hover:bg-red-100"
                              )}>
                                {percentage.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic text-xl">
                            <div className="flex flex-col items-center gap-2">
                                <AlertCircle className="h-10 w-10 opacity-20" />
                                No exam results recorded yet.
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

          <TabsContent value="ledger" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="shadow-2xl border-none overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <Wallet className="text-primary h-7 w-7" /> Financial History
                </CardTitle>
                <CardDescription>Detailed log of all verified fee payments.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="font-black text-xs uppercase tracking-wider py-5 pl-6">Payment Date</TableHead>
                        <TableHead className="font-black text-xs uppercase tracking-wider py-5">Verification ID</TableHead>
                        <TableHead className="font-black text-xs uppercase tracking-wider py-5">For Month</TableHead>
                        <TableHead className="text-right font-black text-xs uppercase tracking-wider py-5 pr-6">Amount Received</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeHistory.length > 0 ? incomeHistory.map(inc => (
                        <TableRow key={inc.id} className="hover:bg-muted/20 transition-colors group">
                          <TableCell className="py-6 pl-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:scale-110 transition-transform">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <span className="font-bold text-lg">{format(inc.date, 'PPP')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground">{inc.receiptId || inc.id}</code>
                          </TableCell>
                          <TableCell className="py-6">
                            <Badge variant="secondary" className="font-bold uppercase text-[10px] tracking-widest bg-primary/10 text-primary">
                                {inc.forMonth || format(inc.date, 'MMM yyyy')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-6 pr-6">
                            <span className="text-2xl font-black text-green-600">{inc.amount.toLocaleString()} <span className="text-xs font-bold opacity-50">PKR</span></span>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center text-muted-foreground italic text-xl">
                             <div className="flex flex-col items-center gap-2">
                                <Wallet className="h-10 w-10 opacity-20" />
                                No payment history found.
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
      
      {/* Enhanced Footer */}
      <footer className="mt-20 py-12 text-center border-t border-primary/5 bg-white/30 backdrop-blur-sm">
        <div className="max-w-xs mx-auto space-y-4">
            <div className="flex justify-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                <Logo noText />
            </div>
            <p className="font-black text-primary uppercase tracking-widest">{settings.name}</p>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{settings.address} <br/> Contact: {settings.phone}</p>
            <div className="pt-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic">Managed by SchoolUP Platform</p>
            </div>
        </div>
      </footer>
    </main>
  );
}
