
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { ArrowLeft, Wallet, GraduationCap, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function StudentPortalDashboard() {
  const { studentId } = useParams();
  const router = useRouter();
  const { settings, isSettingsLoading } = useSettings();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [incomeHistory, setIncomeHistory] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    async function loadStudentData() {
      setLoading(true);
      try {
        const studentData = await getStudent(studentId as string);
        if (studentData && studentData.status === 'active') {
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
  }, [studentId]);

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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6 text-center">{error || 'Could not find student data.'}</p>
        <Button onClick={() => router.push('/portal')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Try Different ID
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 pb-12">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-12 px-4 shadow-lg relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="bg-white p-2 rounded-full shadow-xl">
                <Logo noText />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight">{student.name}</h1>
              <p className="text-primary-foreground/80 text-xl font-medium">Roll No: {student.id} | Class: {student.class}</p>
              <p className="text-primary-foreground/60">{settings.name}</p>
            </div>
          </div>
          <Button variant="secondary" size="lg" onClick={() => router.push('/portal')} className="rounded-full shadow-md font-bold">
            <ArrowLeft className="mr-2" /> Log Out
          </Button>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </header>

      <div className="max-w-5xl mx-auto -mt-8 px-4 grid gap-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Total Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-green-600">{totalPaid.toLocaleString()} PKR</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Current Dues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn("text-3xl font-black", student.totalFee > 0 ? "text-red-600" : "text-green-600")}>
                {student.totalFee.toLocaleString()} PKR
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="text-lg px-4 py-1" variant={student.feeStatus === 'Paid' ? 'secondary' : 'destructive'}>
                {student.feeStatus}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-card rounded-xl shadow-inner border">
            <TabsTrigger value="results" className="text-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <GraduationCap className="mr-2" /> Academic Results
            </TabsTrigger>
            <TabsTrigger value="ledger" className="text-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <Wallet className="mr-2" /> Financial Ledger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="mt-6">
            <Card className="shadow-lg border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <GraduationCap className="text-primary" /> Exam Progress
                </CardTitle>
                <CardDescription>Your performance in all recent examinations.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-bold">Exam Name</TableHead>
                        <TableHead className="font-bold">Subject(s)</TableHead>
                        <TableHead className="text-center font-bold">Obtained</TableHead>
                        <TableHead className="text-center font-bold">Total</TableHead>
                        <TableHead className="text-right font-bold">Percentage</TableHead>
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
                          <TableRow key={exam.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-bold">{exam.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {exam.subjects.map(s => <Badge key={s} variant="outline" className="font-normal">{s}</Badge>)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-bold text-lg">{obtained}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{total}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={percentage >= 50 ? 'outline' : 'destructive'} className="font-bold">
                                {percentage.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic text-lg">
                            No exam results recorded yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ledger" className="mt-6">
            <Card className="shadow-lg border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Wallet className="text-primary" /> Payment History
                </CardTitle>
                <CardDescription>A record of all your fee payments.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-bold">Date</TableHead>
                        <TableHead className="font-bold">Description</TableHead>
                        <TableHead className="font-bold">Month</TableHead>
                        <TableHead className="text-right font-bold">Amount Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeHistory.length > 0 ? incomeHistory.map(inc => (
                        <TableRow key={inc.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(inc.date, 'PPP')}
                          </TableCell>
                          <TableCell className="font-medium">Fee Payment</TableCell>
                          <TableCell>
                            <Badge variant="outline">{inc.forMonth || format(inc.date, 'MMM yyyy')}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {inc.amount.toLocaleString()} PKR
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic text-lg">
                            No payment history found.
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
      
      {/* Footer Info */}
      <footer className="mt-12 text-center text-muted-foreground text-sm space-y-2">
        <p className="font-bold text-primary">{settings.name}</p>
        <p>{settings.address} | {settings.phone}</p>
        <p className="pt-4 opacity-50">Developed by SchoolUP</p>
      </footer>
    </main>
  );
}
