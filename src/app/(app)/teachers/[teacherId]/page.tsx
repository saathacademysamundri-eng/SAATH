'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Student, type Teacher, type TeacherPayout, type Report, type Income } from '@/lib/data';
import { getTeacherPayouts, payoutTeacher, deletePayout, getIncome, getStudents } from '@/lib/firebase/firestore';
import { Loader2, Phone, Wallet, Printer, Mail, Home, User, Trash2 } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { TeacherEarningsClient } from './teacher-earnings-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { useAppContext } from '@/hooks/use-app-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format, getMonth, getYear } from 'date-fns';
import { useSettings } from '@/hooks/use-settings';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type StudentEarning = {
  student: Student;
  earnedShare: number;
  subjectName: string;
  incomeId: string;
  incomeDate: Date;
};

type MonthlyEarnings = {
  month: string;
  year: number;
  monthIndex: number;
  totalGross: number;
  teacherShare: number;
  academyShare: number;
  studentEarnings: StudentEarning[];
};

export default function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const { toast } = useToast();
  const { settings, isSettingsLoading } = useSettings();
  
  const { teachers, loading: contextLoading, refreshData } = useAppContext();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings[]>([]);
  const [payouts, setPayouts] = useState<(TeacherPayout & { report?: Report, academyShare?: number })[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [payingMonth, setPayingMonth] = useState<string | null>(null);
  const [deletingPayoutId, setDeletingPayoutId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!teacherId) return;

    setLoading(true);
    try {
        const [teacherData, allIncome, allStudents] = await Promise.all([
            teachers.find(t => t.id === teacherId) || null,
            getIncome(),
            getStudents()
        ]);

        if (!teacherData) {
            setLoading(false);
            return;
        }
        
        setTeacher(teacherData);
        
        const unpaidIncome = allIncome.filter(i => !i.paidOutTo || !i.paidOutTo[teacherId]);
        const earningsByMonth: { [key: string]: Omit<MonthlyEarnings, 'month' | 'year' | 'monthIndex'> & { year: number, monthIndex: number } } = {};

        unpaidIncome.forEach(inc => {
            const student = allStudents.find(s => s.id === inc.studentId);
            if (student) {
                const relevantSubjects = student.subjects.filter(sub => sub.teacher_id === teacherData.id);
                if (relevantSubjects.length > 0) {
                     relevantSubjects.forEach(subject => {
                        const assignedAt = subject.assignedAt ? (subject.assignedAt.toDate ? subject.assignedAt.toDate() : new Date(subject.assignedAt)) : new Date(0);
                        const assignedMonthKey = format(assignedAt, 'yyyy-MM');
                        const incomeMonthKey = inc.forMonth || format(inc.date, 'yyyy-MM');

                        if (assignedMonthKey > incomeMonthKey) return;

                        const feeShareForSubject = subject.fee_share || 0;
                        if (student.monthlyFee > 0) {
                          const proportion = feeShareForSubject / student.monthlyFee;
                          const earnedShare = inc.amount * proportion;
                          
                          const monthKey = incomeMonthKey;
                          const monthDate = new Date(monthKey + '-01');

                          if (!earningsByMonth[monthKey]) {
                              earningsByMonth[monthKey] = {
                                  totalGross: 0,
                                  teacherShare: 0,
                                  academyShare: 0,
                                  studentEarnings: [],
                                  year: getYear(monthDate),
                                  monthIndex: getMonth(monthDate),
                              };
                          }

                          earningsByMonth[monthKey].totalGross += earnedShare;
                          earningsByMonth[monthKey].studentEarnings.push({
                              student: student,
                              earnedShare: earnedShare,
                              subjectName: subject.subject_name,
                              incomeId: inc.id,
                              incomeDate: inc.date,
                          });
                        }
                     });
                }
            }
        });

        const finalMonthlyEarnings: MonthlyEarnings[] = Object.keys(earningsByMonth).map(key => {
          const data = earningsByMonth[key];
          return {
            ...data,
            month: format(new Date(data.year, data.monthIndex), 'MMMM yyyy'),
            teacherShare: data.totalGross * 0.7,
            academyShare: data.totalGross * 0.3,
          };
        }).sort((a,b) => b.year - a.year || b.monthIndex - a.monthIndex);
        
        setMonthlyEarnings(finalMonthlyEarnings);

        const payoutData = await getTeacherPayouts(teacherId);
        setPayouts(payoutData);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  }, [teacherId, teachers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePayout = async (monthData: MonthlyEarnings) => {
      if (!teacher || monthData.totalGross === 0) {
          toast({ variant: 'destructive', title: 'Payout Error', description: 'No earnings to pay out for this month.' });
          return;
      }

      setPayingMonth(monthData.month);
      const relevantIncomeIds = [...new Set(monthData.studentEarnings.map(e => e.incomeId))];
      const reportData = {
          grossEarnings: monthData.totalGross,
          teacherShare: monthData.teacherShare,
          academyShare: monthData.academyShare,
          studentBreakdown: monthData.studentEarnings.map(e => ({
              studentId: e.student.id,
              studentName: e.student.name,
              studentClass: e.student.class,
              subjectName: e.subjectName,
              feeShare: e.earnedShare
          }))
      };

      const earningsDate = new Date(monthData.year, monthData.monthIndex, 1);
      const result = await payoutTeacher(teacher.id, teacher.name, monthData.teacherShare, relevantIncomeIds, reportData, earningsDate);

      if (result.success) {
          toast({ title: 'Payout Successful', description: `Paid ${monthData.teacherShare.toLocaleString()} PKR for ${monthData.month}.` });
          fetchData();
      } else {
          toast({ variant: 'destructive', title: 'Payout Failed', description: result.message });
      }
      setPayingMonth(null);
  };

  const handleDeletePayout = async (payout: TeacherPayout) => {
    setDeletingPayoutId(payout.id);
    const result = await deletePayout(payout.id);
     if (result.success) {
        toast({ title: 'Payout Reversed', description: 'The payout has been successfully reversed.' });
        fetchData();
    } else {
        toast({ variant: 'destructive', title: 'Reversal Failed', description: result.message });
    }
    setDeletingPayoutId(null);
  };

  const generatePrintHtml = (reportData: any, tName: string, reportDate: Date, title: string) => {
    const { grossEarnings, teacherShare, academyShare, studentBreakdown } = reportData;
    const { logo, name, address, phone } = settings;
    const formattedReportDate = format(reportDate, 'PPP');

    const studentRows = studentBreakdown.map((item: any) => `
      <tr>
        <td>${item.studentName} (${item.studentId})</td>
        <td>${item.studentClass}</td>
        <td>${item.subjectName}</td>
        <td style="text-align: right;">${item.feeShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <title>${title} - ${tName}</title>
          <style>
            @media print { @page { size: A4; margin: 0.75in; } }
            body { font-family: sans-serif; margin: 0; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 2rem; }
            .header img { height: 60px; margin-bottom: 10px; }
            .report-title { text-align: center; margin-bottom: 2rem; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 2rem; }
            .stat-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; width: 30%; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
            .footer { text-align: center; font-size: 0.8rem; color: #888; margin-top: 3rem; }
          </style>
        </head>
        <body>
          <div class="header">
            ${logo ? `<img src="${logo}" alt="Academy Logo" />` : ''}
            <h1>${name}</h1>
            <p>${address}</p>
          </div>
          <div class="report-title">
            <h2>${title}</h2>
            <p>Teacher: ${tName} | Date: ${formattedReportDate}</p>
          </div>
          <div class="stats">
            <div class="stat-box"><p>Gross</p><strong>${grossEarnings.toLocaleString()} PKR</strong></div>
            <div class="stat-box"><p>Teacher (70%)</p><strong style="color: green;">${teacherShare.toLocaleString()} PKR</strong></div>
            <div class="stat-box"><p>Academy (30%)</p><strong style="color: blue;">${academyShare.toLocaleString()} PKR</strong></div>
          </div>
          <table>
            <thead><tr><th>Student</th><th>Class</th><th>Subject</th><th style="text-align: right;">Fee Share</th></tr></thead>
            <tbody>${studentRows}</tbody>
          </table>
          <div class="footer">Developed by SchoolUP</div>
        </body>
      </html>
    `;
  };

  const handlePrintHistory = (payout: TeacherPayout & { report?: Report }) => {
    if (!payout.report) return;
    const printHtml = generatePrintHtml(payout.report, payout.teacherName, payout.payoutDate, `Payout Report - ${format(payout.payoutDate, 'MMMM yyyy')}`);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  if (loading || contextLoading) {
    return <div className="p-8"><Skeleton className="h-20 w-full mb-4" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!teacher) return <div className="p-8 text-center text-destructive font-bold">Teacher not found.</div>;

  return (
    <div className="flex flex-col gap-6">
      <Card>
          <CardHeader className='flex-row items-center gap-4 space-y-0'>
              <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">{teacher.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                  <CardTitle className="text-2xl">{teacher.name}</CardTitle>
                  <CardDescription>{teacher.phone}</CardDescription>
                  <div className="flex flex-wrap gap-2 pt-2">
                      {teacher.subjects.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                  </div>
              </div>
          </CardHeader>
      </Card>
      
      <Tabs defaultValue="earnings">
          <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="earnings">Unpaid Earnings</TabsTrigger>
              <TabsTrigger value="payouts">Payout History</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="earnings" className="mt-4">
             <Card>
              <CardHeader><CardTitle>Unpaid Monthly Earnings</CardTitle></CardHeader>
              <CardContent>
                  {monthlyEarnings.length > 0 ? (
                      <Accordion type="single" collapsible>
                          {monthlyEarnings.map(monthData => (
                              <AccordionItem value={monthData.month} key={monthData.month}>
                                  <AccordionTrigger>
                                      <div className="flex justify-between w-full pr-4">
                                          <span>{monthData.month}</span>
                                          <span className="text-green-600 font-bold">{monthData.teacherShare.toLocaleString()} PKR</span>
                                      </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                      <div className="p-4 bg-muted/30 rounded-md">
                                          <Table>
                                              <TableHeader>
                                                  <TableRow>
                                                      <TableHead>Student</TableHead>
                                                      <TableHead>Subject</TableHead>
                                                      <TableHead className="text-right">Share</TableHead>
                                                  </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                  {monthData.studentEarnings.map((e, i) => (
                                                      <TableRow key={i}>
                                                          <TableCell>{e.student.name} ({e.student.id})</TableCell>
                                                          <TableCell>{e.subjectName}</TableCell>
                                                          <TableCell className="text-right">{e.earnedShare.toLocaleString()} PKR</TableCell>
                                                      </TableRow>
                                                  ))}
                                              </TableBody>
                                          </Table>
                                          <div className="mt-4 flex justify-end">
                                               <Button onClick={() => handlePayout(monthData)} disabled={!!payingMonth}>
                                                  {payingMonth === monthData.month ? <Loader2 className="animate-spin mr-2" /> : <Wallet className="mr-2" />}
                                                  Pay Teacher
                                              </Button>
                                          </div>
                                      </div>
                                  </AccordionContent>
                              </AccordionItem>
                          ))}
                      </Accordion>
                  ) : <p className="text-center py-8 text-muted-foreground">No unpaid earnings.</p>}
              </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="payouts" className="mt-4">
               <Card>
                  <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {payouts.map(p => (
                                  <TableRow key={p.id}>
                                      <TableCell>{format(p.payoutDate, 'PPP')}</TableCell>
                                      <TableCell className="font-bold">{p.amount.toLocaleString()} PKR</TableCell>
                                      <TableCell className="text-right space-x-2">
                                          <Button variant="outline" size="sm" onClick={() => handlePrintHistory(p)} disabled={!p.report}>
                                              <Printer className="h-4 w-4" />
                                          </Button>
                                          <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                  <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                  <AlertDialogHeader>
                                                      <AlertDialogTitle>Reverse Payout?</AlertDialogTitle>
                                                      <AlertDialogDescription>This will mark the associated income as unpaid again.</AlertDialogDescription>
                                                  </AlertDialogHeader>
                                                  <AlertDialogFooter>
                                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                      <AlertDialogAction onClick={() => handleDeletePayout(p)} className="bg-destructive">Confirm</AlertDialogAction>
                                                  </AlertDialogFooter>
                                              </AlertDialogContent>
                                          </AlertDialog>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="profile" className="mt-4">
              <Card>
                  <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 border rounded-md"><Phone className="h-4 w-4" /> <div><p className="text-xs text-muted-foreground">Phone</p><p>{teacher.phone}</p></div></div>
                      <div className="flex items-center gap-2 p-3 border rounded-md"><Mail className="h-4 w-4" /> <div><p className="text-xs text-muted-foreground">Email</p><p>{teacher.email || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-2 p-3 border rounded-md"><User className="h-4 w-4" /> <div><p className="text-xs text-muted-foreground">Father's Name</p><p>{teacher.fatherName}</p></div></div>
                      <div className="flex items-center gap-2 p-3 border rounded-md"><Home className="h-4 w-4" /> <div><p className="text-xs text-muted-foreground">Address</p><p>{teacher.address}</p></div></div>
                  </CardContent>
              </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}
