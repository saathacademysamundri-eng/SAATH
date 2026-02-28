'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Student, type Teacher, type TeacherPayout, type Report, type Income } from '@/lib/data';
import { getTeacherPayouts, getIncome, getAllStudents } from '@/lib/firebase/firestore';
import { Loader2, Wallet, Printer, DollarSign } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { Button } from '@/components/ui/button';
import { format, getMonth, getYear } from 'date-fns';
import { useSettings } from '@/hooks/use-settings';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

export default function MyEarningsPage() {
  const { teacher, loading: authLoading } = useTeacherAuth();
  const { settings, isSettingsLoading } = useSettings();
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings[]>([]);
  const [payouts, setPayouts] = useState<(TeacherPayout & { report?: Report, academyShare?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!teacher) return;

    setLoading(true);
    try {
        const [allIncome, allStudentsData] = await Promise.all([
            getIncome(),
            getAllStudents()
        ]);

        // CASH BASIS: Group unpaid income by the assigned 'forMonth'. 
        const unpaidIncome = allIncome.filter(i => !i.paidOutTo || !i.paidOutTo[teacher.id]);
        const earningsByMonth: { [key: string]: Omit<MonthlyEarnings, 'month' | 'year' | 'monthIndex'> & { year: number, monthIndex: number } } = {};

        unpaidIncome.forEach(inc => {
            const student = allStudentsData.find(s => s.id === inc.studentId);
            if (student && student.subjects) {
                const relevantSubjects = student.subjects.filter(sub => sub.teacher_id === teacher.id);
                if (relevantSubjects.length > 0) {
                     relevantSubjects.forEach(subject => {
                        const incomeMonthKey = inc.forMonth || format(inc.date, 'yyyy-MM');

                        // UNIVERSAL CASH LOGIC: Calculate share based on ACTUAL cash collected (proportion of monthly fee)
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

        const payoutData = await getTeacherPayouts(teacher.id);
        setPayouts(payoutData);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  }, [teacher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
            .report-title { text-align: center; margin: 2rem 0; }
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

  if (loading || authLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  if (!teacher) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Earnings</h1>
        <p className="text-muted-foreground">View your unpaid earnings and payout history.</p>
      </div>

      <Tabs defaultValue="unpaid">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="unpaid">Unpaid Earnings</TabsTrigger>
              <TabsTrigger value="history">Payout History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="unpaid" className="mt-4">
             <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <DollarSign className="text-green-600" />
                      Current Unpaid Share
                  </CardTitle>
                  <CardDescription>Earnings from collected fees that haven't been disbursed yet.</CardDescription>
              </CardHeader>
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
                                                      <TableHead className="text-right">Share (70%)</TableHead>
                                                  </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                  {monthData.studentEarnings.map((e, i) => (
                                                      <TableRow key={i}>
                                                          <TableCell>{e.student.name} ({e.student.id})</TableCell>
                                                          <TableCell>{e.subjectName}</TableCell>
                                                          <TableCell className="text-right">{(e.earnedShare * 0.7).toLocaleString(undefined, { maximumFractionDigits: 0 })} PKR</TableCell>
                                                      </TableRow>
                                                  ))}
                                              </TableBody>
                                          </Table>
                                      </div>
                                  </AccordionContent>
                              </AccordionItem>
                          ))}
                      </Accordion>
                  ) : <p className="text-center py-12 text-muted-foreground">No unpaid earnings discovered. All collected shares have been paid.</p>}
              </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
               <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <Wallet className="text-blue-600" />
                          Transaction History
                      </CardTitle>
                      <CardDescription>A complete log of all payouts received from the academy.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Payout Date</TableHead>
                                  <TableHead>Amount Received</TableHead>
                                  <TableHead className="text-right">Report</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {payouts.map(p => (
                                  <TableRow key={p.id}>
                                      <TableCell>{format(p.payoutDate, 'PPP')}</TableCell>
                                      <TableCell className="font-bold text-blue-600">{p.amount.toLocaleString()} PKR</TableCell>
                                      <TableCell className="text-right">
                                          <Button variant="outline" size="sm" onClick={() => handlePrintHistory(p)} disabled={!p.report}>
                                              <Printer className="h-4 w-4 mr-2" />
                                              Print Statement
                                          </Button>
                                      </TableCell>
                                  </TableRow>
                              ))}
                              {payouts.length === 0 && (
                                  <TableRow>
                                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                          No payout records found.
                                      </TableCell>
                                  </TableRow>
                              )}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}
