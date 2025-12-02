

'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Student, type Teacher, type TeacherPayout, type Report, Income } from '@/lib/data';
import { getTeacherPayouts, payoutTeacher } from '@/lib/firebase/firestore';
import { Loader2, Phone, Wallet, Printer, Mail, Home, User } from 'lucide-react';
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

type StudentEarning = {
  student: Student;
  earnedShare: number;
  subjectName: string;
  incomeId: string;
  incomeDate: Date;
};

type MonthlyEarnings = {
  month: string; // e.g., "July 2024"
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
  
  const { teachers, students, income, loading: isAppLoading, refreshData } = useAppContext();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings[]>([]);
  const [payouts, setPayouts] = useState<(TeacherPayout & { report?: Report, academyShare?: number })[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [payingMonth, setPayingMonth] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (isAppLoading || !teacherId) return;

    setLoading(true);
    const teacherData = teachers.find(t => t.id === teacherId);

    if (!teacherData) {
        setLoading(false);
        return;
    }
    
    setTeacher(teacherData);

    const unpaidIncome = income.filter(i => !i.isPaidOut);
    const earningsByMonth: { [key: string]: Omit<MonthlyEarnings, 'month' | 'year' | 'monthIndex'> & { year: number, monthIndex: number } } = {};

    unpaidIncome.forEach(inc => {
        const student = students.find(s => s.id === inc.studentId);
        if (student) {
            const relevantSubjects = student.subjects.filter(sub => sub.teacher_id === teacherData.id);
            if (relevantSubjects.length > 0) {
              const totalFeeShare = student.subjects.reduce((acc, s) => acc + s.fee_share, 0);
              if (totalFeeShare > 0) {
                 relevantSubjects.forEach(subject => {
                    const proportion = subject.fee_share / totalFeeShare;
                    const earnedShare = inc.amount * proportion;
                    
                    const monthKey = format(inc.date, 'yyyy-MM');
                    if (!earningsByMonth[monthKey]) {
                        earningsByMonth[monthKey] = {
                            totalGross: 0,
                            teacherShare: 0,
                            academyShare: 0,
                            studentEarnings: [],
                            year: getYear(inc.date),
                            monthIndex: getMonth(inc.date),
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
                 });
              }
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

    setLoading(false);
  }, [teacherId, teachers, students, income, isAppLoading]);

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
      
      const reportData = getReportData(monthData);

      const result = await payoutTeacher(teacher.id, teacher.name, monthData.teacherShare, relevantIncomeIds, reportData);

      if (result.success) {
          toast({ title: 'Payout Successful', description: `Paid ${monthData.teacherShare.toLocaleString()} for ${monthData.month}.` });
          refreshData(); 
          fetchData();
      } else {
          toast({ variant: 'destructive', title: 'Payout Failed', description: result.message });
      }
      setPayingMonth(null);
  };


  const getReportData = useCallback((monthData: MonthlyEarnings) => {
    if (!teacher) return null;

    const breakdown = monthData.studentEarnings.map(earning => ({
      studentId: earning.student.id,
      studentName: earning.student.name,
      studentClass: earning.student.class,
      subjectName: earning.subjectName,
      feeShare: earning.earnedShare,
    }));

    return {
      grossEarnings: monthData.totalGross,
      teacherShare: monthData.teacherShare,
      academyShare: monthData.academyShare,
      studentBreakdown: breakdown,
    };
  }, [teacher]);

  const generatePrintHtml = (reportData: any, teacherName: string, reportDate: Date, title: string) => {
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
          <title>${title} - ${teacherName}</title>
          <style>
            @media print {
              @page { size: A4; margin: 0.75in; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { 
              font-family: 'Helvetica', 'Arial', sans-serif;
              margin: 0; 
              padding: 0; 
              background-color: #fff;
              color: #000;
              font-size: 10pt;
            }
            .report-container { max-width: 800px; margin: auto; }
            .academy-details { text-align: center; margin-bottom: 2rem; }
            .academy-details img { height: 60px; margin-bottom: 0.5rem; object-fit: contain; }
            .academy-details h1 { font-size: 1.5em; font-weight: bold; margin: 0; }
            .academy-details p { font-size: 0.9em; margin: 0.2rem 0; color: #555; }
            .report-title { text-align: center; margin: 2rem 0; }
            .report-title h2 { font-size: 2em; font-weight: bold; margin: 0 0 0.5rem 0; }
            .report-title p { font-size: 1em; color: #555; margin: 0; }
            .stats-grid { display: flex; justify-content: space-between; gap: 1.5rem; margin-bottom: 2rem; }
            .stat-card { border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; text-align: center; width: 30%; box-sizing: border-box; }
            .stat-card p { margin: 0; color: #6b7280; font-size: 0.9em; }
            .stat-card .amount { font-size: 1.5em; font-weight: bold; margin-top: 0.5rem; }
            .teacher-share { color: #16a34a; }
            .academy-share { color: #3b82f6; }
            .breakdown-title { font-size: 1.5em; font-weight: bold; margin-bottom: 1rem; border-bottom: 2px solid #f3f4f6; padding-bottom: 0.5rem; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9em; }
            th, td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
            th { font-weight: bold; color: #6b7280; }
            .footer { text-align: right; margin-top: 2rem; font-size: 0.8rem; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="academy-details">
              ${logo ? `<img src="${logo}" alt="Academy Logo" />` : ''}
              <h1>${name}</h1>
              <p>${address}</p>
              <p>Phone: ${phone}</p>
            </div>
            <div class="report-title">
              <h2>${title}</h2>
              <p>For: ${teacherName} | Date: ${formattedReportDate}</p>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <p>Total Gross Earnings</p>
                    <p class="amount">${grossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</p>
                </div>
                <div class="stat-card">
                    <p>Teacher's Share (70%)</p>
                    <p class="amount teacher-share">${teacherShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</p>
                </div>
                <div class="stat-card">
                    <p>Academy's Share (30%)</p>
                    <p class="amount academy-share">${academyShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</p>
                </div>
            </div>
            <h3 class="breakdown-title">Student Breakdown</h3>
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Class</th>
                        <th>Subject</th>
                        <th style="text-align: right;">Fee Share</th>
                    </tr>
                </thead>
                <tbody>${studentRows}</tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintHistory = (payout: TeacherPayout & { report?: Report }) => {
    if (isSettingsLoading) {
      toast({ title: 'Please wait', description: 'Settings are loading.' });
      return;
    }
    if (!payout.report) {
      toast({ variant: 'destructive', title: 'Cannot Print', description: 'No detailed report found for this payout.' });
      return;
    }

    const printHtml = generatePrintHtml(payout.report, payout.teacherName, payout.payoutDate, `Payout Report - ${format(payout.payoutDate, 'MMMM yyyy')}`);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      toast({ variant: 'destructive', title: 'Popup Blocked', description: 'Please allow popups to print the report.' });
    }
  };


  if (loading || isAppLoading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Teacher not found</h2>
        <p className="text-muted-foreground">The teacher with ID "{teacherId}" could not be found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TeacherEarningsClient 
        teacherId={teacher.id} 
        teacherName={teacher.name}
        getReportData={() => null} // This client component is now only for the header
      />
      
      <div id="print-area">
        <Card>
            <CardHeader className='flex-row items-center gap-4 space-y-0 pb-4'>
                <Avatar className="h-20 w-20">
                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='grid gap-1'>
                    <CardTitle className="text-2xl">{teacher.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> {teacher.phone}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {teacher.subjects && teacher.subjects.map(subject => (
                            <Badge key={subject} variant="secondary">{subject}</Badge>
                        ))}
                    </div>
                </div>
            </CardHeader>
        </Card>
        
        <Tabs defaultValue="earnings" className="mt-4">
            <TabsList className="print:hidden grid w-full grid-cols-3">
                <TabsTrigger value="earnings">Current Earnings</TabsTrigger>
                <TabsTrigger value="payouts">Payout History</TabsTrigger>
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
            </TabsList>
            <TabsContent value="earnings" className="mt-4">
               <Card>
                <CardHeader>
                    <CardTitle>Unpaid Earnings by Month</CardTitle>
                    <CardDescription>Earnings from collected student fees, grouped by the month the fee was for.</CardDescription>
                </CardHeader>
                <CardContent>
                    {monthlyEarnings.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {monthlyEarnings.map(monthData => (
                                <AccordionItem value={monthData.month} key={monthData.month}>
                                    <AccordionTrigger>
                                        <div className="flex justify-between w-full pr-4">
                                            <span className="text-lg font-semibold">{monthData.month}</span>
                                            <span className="text-lg font-bold text-green-600">{monthData.teacherShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="p-4 bg-muted/50 rounded-md">
                                            <div className="grid grid-cols-3 gap-4 text-center mb-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Gross Earnings</p>
                                                    <p className="font-bold text-lg">{monthData.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Teacher's Share (70%)</p>
                                                    <p className="font-bold text-lg text-green-600">{monthData.teacherShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Academy's Share (30%)</p>
                                                    <p className="font-bold text-lg text-blue-600">{monthData.academyShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                            </div>
                                             <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Student</TableHead>
                                                        <TableHead>Fee Date</TableHead>
                                                        <TableHead>Subject</TableHead>
                                                        <TableHead className="text-right">Share from Fee</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {monthData.studentEarnings.map(({ student, earnedShare, subjectName, incomeId, incomeDate }, index) => (
                                                        <TableRow key={`${incomeId}-${index}`}>
                                                            <TableCell>
                                                                <div className="font-medium">{student.name}</div>
                                                                <div className="text-xs text-muted-foreground">{student.id}</div>
                                                            </TableCell>
                                                            <TableCell>{format(incomeDate, 'PPP')}</TableCell>
                                                            <TableCell>{subjectName}</TableCell>
                                                            <TableCell className="text-right">{earnedShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            <div className="mt-4 flex justify-end">
                                                 <Button onClick={() => handlePayout(monthData)} disabled={payingMonth === monthData.month || monthData.teacherShare <= 0}>
                                                    {payingMonth === monthData.month ? <Loader2 className="mr-2 animate-spin" /> : <Wallet className="mr-2" />}
                                                    {payingMonth === monthData.month ? 'Processing...' : `Pay ${monthData.month}`}
                                                </Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                         <div className="text-center text-muted-foreground h-24 flex items-center justify-center">
                            No unpaid earnings for this teacher.
                        </div>
                    )}
                </CardContent>
               </Card>
            </TabsContent>
            <TabsContent value="payouts">
                 <Card>
                    <CardHeader>
                        <CardTitle>Teacher Payout History</CardTitle>
                        <CardDescription>A record of all payments made to {teacher.name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payout Date</TableHead>
                                    <TableHead>Amount Paid</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payouts.length > 0 ? (
                                    payouts.map((payout) => (
                                        <TableRow key={payout.id}>
                                            <TableCell>{format(payout.payoutDate, 'PPP')}</TableCell>
                                            <TableCell className="font-medium">{payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handlePrintHistory(payout)} disabled={!payout.report || isSettingsLoading}>
                                                    <Printer className="mr-2 h-4 w-4" />
                                                    Print
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            No payout history for this teacher.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="profile">
                <Card>
                    <CardHeader>
                        <CardTitle>Teacher Information</CardTitle>
                        <CardDescription>Personal and contact details for {teacher.name}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 rounded-md border p-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Father's Name</p>
                                    <p className="font-medium">{teacher.fatherName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-md border p-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{teacher.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-md border p-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{teacher.email || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-md border p-3">
                                <Home className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="font-medium">{teacher.address}</p>
                                </div>
                            </div>
                        </div>
                         <div>
                            <p className="text-sm font-medium mb-2">Subjects Taught</p>
                            <div className="flex flex-wrap gap-2">
                                {teacher.subjects && teacher.subjects.map(subject => (
                                    <Badge key={subject} variant="secondary">{subject}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
