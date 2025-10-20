
'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Student, type Teacher, type TeacherPayout, type Report } from '@/lib/data';
import { getTeacherPayouts, payoutTeacher } from '@/lib/firebase/firestore';
import { Loader2, Phone, Wallet, Printer, Mail, Home, User } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { TeacherEarningsClient } from './teacher-earnings-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { useAppContext } from '@/hooks/use-app-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useSettings } from '@/hooks/use-settings';

type StudentEarning = {
  student: Student;
  earnedShare: number;
  subjectName: string;
};

export default function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const { toast } = useToast();
  const { settings, isSettingsLoading } = useSettings();
  
  const { teachers, students, income, loading: isAppLoading, refreshData } = useAppContext();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [studentEarnings, setStudentEarnings] = useState<StudentEarning[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [payouts, setPayouts] = useState<(TeacherPayout & { report?: Report, academyShare?: number })[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  const fetchData = useCallback(async () => {
    if (isAppLoading || !teacherId) return;

    setLoading(true);
    const teacherData = teachers.find(t => t.id === teacherId);

    if (!teacherData) {
        setLoading(false);
        return;
    }
    
    setTeacher(teacherData);

    const currentStudentEarnings: StudentEarning[] = [];
    let currentTotalEarnings = 0;
    
    // Get students assigned to this teacher who have outstanding fees
    const relevantStudents = students.filter(s => 
      s.totalFee > 0 && s.subjects.some(sub => sub.teacher_id === teacherData.id)
    );

    relevantStudents.forEach(student => {
      // Find how many teachers are assigned to this student to split the fee
      const studentTeachers = [...new Set(student.subjects.map(s => s.teacher_id))];
      if (studentTeachers.length > 0) {
        const totalFeeToConsider = student.totalFee; // Use the outstanding fee
        const earnedShare = totalFeeToConsider / studentTeachers.length;

        // Find the subject this teacher teaches this student
        const relevantSubject = student.subjects.find(s => s.teacher_id === teacherData.id);

        currentStudentEarnings.push({
            student,
            earnedShare,
            subjectName: relevantSubject?.subject_name || 'N/A'
        });
        currentTotalEarnings += earnedShare;
      }
    });
    
    setStudentEarnings(currentStudentEarnings);
    setTotalEarnings(currentTotalEarnings);

    const payoutData = await getTeacherPayouts(teacherId);
    setPayouts(payoutData);

    setLoading(false);
  }, [teacherId, teachers, students, isAppLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const teacherShare = totalEarnings * 0.7;
  const academyShare = totalEarnings * 0.3;

  const handlePayout = async () => {
      if (!teacher || totalEarnings === 0) {
          toast({ variant: 'destructive', title: 'Payout Error', description: 'No earnings to pay out.' });
          return;
      }

      setIsPaying(true);
      // We need to create income records for the fees being paid out
      // and then mark them as paid out. This is a complex transaction.
      // For now, let's assume we are paying out based on the logic that's already there
      // which uses income records. The display is now different from the payout logic.
      // We need to get the UNPAID income records related to this teacher's students.
      
      const unpaidIncome = income.filter(i => !i.isPaidOut);
      const relevantIncomeIds = new Set<string>();

      unpaidIncome.forEach(inc => {
        const student = students.find(s => s.id === inc.studentId);
        if (student && student.subjects.some(sub => sub.teacher_id === teacher.id)) {
          relevantIncomeIds.add(inc.id);
        }
      });
      
      const result = await payoutTeacher(teacher.id, teacher.name, teacherShare, Array.from(relevantIncomeIds), getReportData());

      if (result.success) {
          toast({ title: 'Payout Successful', description: result.message });
          refreshData(); 
          fetchData();
      } else {
          toast({ variant: 'destructive', title: 'Payout Failed', description: result.message });
      }
      setIsPaying(false);
  };


  const getReportData = useCallback(() => {
    if (!teacher) return null;

    const breakdown = studentEarnings.map(earning => ({
      studentId: earning.student.id,
      studentName: earning.student.name,
      studentClass: earning.student.class,
      subjectName: earning.subjectName,
      feeShare: earning.earnedShare,
    }));

    return {
      grossEarnings: totalEarnings,
      teacherShare: teacherShare,
      academyShare: academyShare,
      studentBreakdown: breakdown,
    };
  }, [teacher, studentEarnings, totalEarnings, teacherShare, academyShare]);

  const generatePrintHtml = (reportData: any, teacherName: string, reportDate: Date) => {
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
          <title>Earnings Report - ${teacherName}</title>
          <style>
            @media print {
              @page { size: A4; margin: 0; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { 
              font-family: 'Helvetica', 'Arial', sans-serif;
              margin: 0; 
              padding: 2rem; 
              background-color: #fff;
              color: #000;
              font-size: 10px;
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
              <img src="${logo}" alt="Academy Logo" />
              <h1>${name}</h1>
              <p>${address}</p>
              <p>Phone: ${phone}</p>
            </div>
            <div class="report-title">
              <h2>Earnings Report</h2>
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

    const printHtml = generatePrintHtml(payout.report, payout.teacherName, payout.payoutDate);
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
        getReportData={getReportData}
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
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gross Earnings (from Outstanding Fees)</CardTitle>
                                <CardDescription>Total potential earnings from all students' unpaid fees, shared among their teachers.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p data-stat="gross-earnings" className="text-3xl font-bold">{totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</p>
                            </CardContent>
                        </Card>
                        <Card className="border-green-500/50">
                            <CardHeader>
                                <CardTitle>Teacher's Share (70%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p data-stat="teacher-share" className="text-3xl font-bold text-green-600">{teacherShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</p>
                            </CardContent>
                             <CardContent>
                                <Button onClick={handlePayout} disabled={isPaying || teacherShare <= 0}>
                                    {isPaying ? <Loader2 className="mr-2 animate-spin" /> : <Wallet className="mr-2" />}
                                    {isPaying ? 'Processing...' : 'Pay Teacher & Reset'}
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-500/50">
                            <CardHeader>
                                <CardTitle>Academy's Share (30%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p data-stat="academy-share" className="text-3xl font-bold text-blue-600">{academyShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Contribution (from Outstanding Fees)</CardTitle>
                                <CardDescription>List of students contributing to the current potential earnings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead className="text-right">Fee Share</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentEarnings.length > 0 ? (
                                            studentEarnings.map(({ student, earnedShare, subjectName }, index) => (
                                                <TableRow key={`${student.id}-${index}`}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                           <div>
                                                                <div className="font-medium">{student.name}</div>
                                                                <div className="text-xs text-muted-foreground">{student.id}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{student.class}</TableCell>
                                                    <TableCell>{subjectName}</TableCell>
                                                    <TableCell className="text-right">{earnedShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                                    No outstanding fees from students for this teacher.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
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

    