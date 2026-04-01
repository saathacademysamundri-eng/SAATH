
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';
import { useAppContext } from '@/hooks/use-app-context';
import {
  Users,
  FileText,
  DollarSign,
  BadgeAlert,
  ClipboardCheck,
  Printer,
  FileDown,
  BookCopy,
  CalendarCheck2,
  Loader2,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Student, type Income } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ClassAttendanceDialog } from './class-attendance-dialog';
import { DailyAttendanceSummaryDialog } from './daily-attendance-summary-dialog';
import { DiscountReportDialog } from './discount-report-dialog';
import { MonthlyDefaultersDialog } from './monthly-defaulters-dialog';
import { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getStudents, getIncome } from '@/lib/firebase/firestore';

const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(0, i), 'MMMM') }));
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);


export default function ReportsPage() {
  const { loading: contextLoading, classes } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [unpaidDuesClassFilter, setUnpaidDuesClassFilter] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      setDataLoading(true);
      try {
        const [sData, iData] = await Promise.all([getStudents(), getIncome()]);
        setStudents(sData);
        setIncome(iData);
      } catch (e) {
        console.error("Failed to load data for reports:", e);
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, []);


  const reportCards = [
    {
      id: 'daily-summary',
      title: 'Daily Attendance Summary',
      description: 'A printable summary of today\'s student and teacher attendance, highlighting absentees.',
      icon: CalendarCheck2,
      isEnabled: true,
      type: 'dialog',
      dialogComponent: <DailyAttendanceSummaryDialog />,
    },
    {
      id: 'monthly-defaulters',
      title: 'Monthly Defaulters Report',
      description: 'Find students who have not paid their fees for a specific month and class cycle.',
      icon: AlertTriangle,
      isEnabled: true,
      type: 'dialog',
      dialogComponent: <MonthlyDefaultersDialog />,
    },
     {
      id: 'student-ledger',
      title: 'Student Financial Ledger',
      description: 'Search for a student to view their detailed fee payment history and outstanding dues.',
      icon: BookCopy,
      isEnabled: true,
      type: 'action',
    },
    {
      id: 'all-students',
      title: 'All Students Report',
      description: 'Generate a report with a complete list of all students currently enrolled in the academy.',
      icon: Users,
      isEnabled: true,
      type: 'print-export',
    },
     {
      id: 'paid-students',
      title: 'Paid Students Report',
      description: 'Generate a list of all students who have fully paid their fees for the selected month.',
      icon: DollarSign,
      isEnabled: true,
      type: 'print-export',
    },
    {
      id: 'unpaid-dues',
      title: 'Unpaid Dues Report',
      description: 'Generate a class-wise list of all students with pending or overdue fee payments.',
      icon: BadgeAlert,
      isEnabled: true,
      type: 'print-export',
    },
    {
      id: 'discount-audit',
      title: 'Fee Discounts Report',
      description: 'Audit report of all manual discounts granted. View by month, student, and reverse if needed.',
      icon: Tag,
      isEnabled: true,
      type: 'dialog',
      dialogComponent: <DiscountReportDialog />,
    },
    {
      id: 'attendance',
      title: 'Monthly Attendance Report',
      description: 'Generate class-wise monthly attendance sheets, with print and export options.',
      icon: ClipboardCheck,
      isEnabled: true,
      type: 'dialog',
      dialogComponent: <ClassAttendanceDialog />,
    },
  ];
  
  const generatePrintHtml = (title: string, headers: string[], rows: string, footerExtra?: string) => {
    const monthName = months.find(m => m.value === selectedMonth)?.label;
    const dateTitle = `${monthName}, ${selectedYear}`;
    
    let subTitle = '';
    if (title === 'Paid Students Report') {
        subTitle = `<p class="date-subtitle">${dateTitle}</p>`;
    } else if (title === 'Unpaid Dues Report') {
        subTitle = `<p class="date-subtitle">Class: ${unpaidDuesClassFilter === 'all' ? 'All Classes' : unpaidDuesClassFilter}</p>`;
    }

    return `
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 0.75in; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fff; color: #000; font-size: 10pt; }
            .report-container { max-width: 1000px; margin: auto; padding: 20px; display: flex; flex-direction: column; min-height: 95vh; }
            .content-wrap { flex: 1; }
            .academy-details { text-align: center; margin-bottom: 2rem; }
            .academy-details img { height: 60px; margin-bottom: 0.5rem; object-fit: contain; }
            .academy-details h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
            .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
            .report-title { text-align: center; margin: 2rem 0; }
            .report-title h2 { font-size: 1.8rem; font-weight: bold; margin: 0; }
             .report-title .date-subtitle { font-size: 1rem; color: #555; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
            th, td { padding: 8px 10px; border: 1px solid #ddd; }
            th { font-weight: bold; background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer-summary { margin-top: 2rem; padding-top: 1rem; border-top: 2px solid #333; text-align: right; font-size: 1.2rem; }
            .footer { text-align: center; font-size: 0.8rem; color: #888; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="content-wrap">
              <div class="academy-details">
                ${settings.logo ? `<img src="${settings.logo}" alt="Academy Logo" />` : ''}
                <h1>${settings.name}</h1>
                <p>${settings.address}</p>
                <p>${settings.phone}</p>
              </div>
              <div class="report-title">
                <h2>${title}</h2>
                ${subTitle}
              </div>
              <table>
                <thead>
                  <tr>
                    ${headers.map(h => `<th>${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
              ${footerExtra ? `<div class="footer-summary">${footerExtra}</div>` : ''}
            </div>
            <div class="footer">
                Copyright &copy; ${new Date().getFullYear()} ${settings.name}. Developed by SchoolUP.
            </div>
          </div>
        </body>
      </html>
    `;
  };
  
  const handlePrint = (reportId: string) => {
    if (isSettingsLoading) {
      toast({ variant: 'destructive', title: 'Please wait', description: 'Settings are still loading.' });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please allow popups for this site.' });
      return;
    }

    let reportTitle = '';
    let tableHeaders: string[] = [];
    let tableRows = '';
    let footerExtra = '';

    const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth));

    if (reportId === 'all-students') {
        reportTitle = 'All Students Report';
        tableHeaders = ["#", "Roll #", "Student Name", "Father's Name", "Class", "Phone", "Outstanding Fee", "Fee Status"];
        tableRows = students.map((student, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${student.id}</td>
              <td>${student.name}</td>
              <td>${student.fatherName}</td>
              <td>${student.class}</td>
              <td>${student.phone}</td>
              <td>${student.totalFee.toLocaleString()} PKR</td>
              <td>${student.feeStatus}</td>
            </tr>
          `).join('');
    } else if (reportId === 'unpaid-dues') {
        reportTitle = 'Unpaid Dues Report';
        tableHeaders = ["#", "Roll #", "Student Name", "Father's Name", "Phone", "Class", "Outstanding Dues", "Fee Status"];
        
        let totalUnpaid = 0;
        const filteredUnpaid = students.filter(s => s.totalFee > 0 && (unpaidDuesClassFilter === 'all' || s.class === unpaidDuesClassFilter));
        
        tableRows = filteredUnpaid.map((student, index) => {
            totalUnpaid += student.totalFee;
            return `
            <tr>
              <td>${index + 1}</td>
              <td>${student.id}</td>
              <td>${student.name}</td>
              <td>${student.fatherName}</td>
              <td>${student.phone}</td>
              <td>${student.class}</td>
              <td>${student.totalFee.toLocaleString()} PKR</td>
              <td>${student.feeStatus}</td>
            </tr>
          `}).join('');
          
        footerExtra = `<strong>Total Outstanding Amount: ${totalUnpaid.toLocaleString()} PKR</strong>`;
    } else if (reportId === 'paid-students') {
        reportTitle = 'Paid Students Report';
        tableHeaders = ["#", "Roll #", "Student Name", "Father's Name", "Class", "Paid Amount", "Fee Status", "Payment Date"];
        
        const paymentsInMonth = income.filter(i => i.date >= monthStart && i.date <= monthEnd);
        let totalPaidInMonth = 0;

        tableRows = paymentsInMonth.map((item, index) => {
            totalPaidInMonth += item.amount;
            const student = students.find(s => s.id === item.studentId);
            return `
            <tr>
              <td>${index + 1}</td>
              <td>${item.studentId}</td>
              <td>${item.studentName}</td>
              <td>${student?.fatherName || 'N/A'}</td>
              <td>${student?.class || 'N/A'}</td>
              <td>${item.amount.toLocaleString()} PKR</td>
              <td>Paid</td>
              <td>${format(item.date, 'PP')}</td>
            </tr>
          `})
          .join('');
          
        footerExtra = `<strong>Total Collection for Period: ${totalPaidInMonth.toLocaleString()} PKR</strong>`;
    } else {
        toast({ variant: 'destructive', title: 'Not Implemented', description: 'This report type is not yet available for printing.' });
        return;
    }
    
    const printHtml = generatePrintHtml(reportTitle, tableHeaders, tableRows, footerExtra);
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  const handleExport = (reportId: string) => {
    let headers: string[] = [];
    let data: any[] = [];
    let filename = '';
    
    const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth));

    if (reportId === 'all-students') {
      headers = ["#", "ID", "Name", "Father's Name", "Class", "Phone", "Total Fee", "Fee Status", "Subjects"];
      data = students.map((s: Student, index) => [
          index + 1, s.id, s.name, s.fatherName, s.class, s.phone, s.totalFee, s.feeStatus,
          `"${s.subjects.map(sub => sub.subject_name).join(', ')}"`
        ]);
      filename = 'all-students-report.csv';
    } else if (reportId === 'unpaid-dues') {
      headers = ["#", "ID", "Name", "Father's Name", "Phone", "Class", "Outstanding Dues", "Fee Status"];
      data = students
        .filter(s => s.totalFee > 0 && (unpaidDuesClassFilter === 'all' || s.class === unpaidDuesClassFilter))
        .map((s: Student, index) => [
          index + 1, s.id, s.name, s.fatherName, s.phone, s.class, s.totalFee, s.feeStatus,
        ]);
      filename = 'unpaid-dues-report.csv';
    } else if (reportId === 'paid-students') {
        headers = ["#", "ID", "Name", "Father's Name", "Class", "Fee Amount", "Fee Status", "Payment Date"];
        const paymentsInMonth = income.filter(i => i.date >= monthStart && i.date <= monthEnd);

        data = paymentsInMonth.map((item, index) => {
            const student = students.find(s => s.id === item.studentId);
            return [
              index + 1, item.studentId, item.studentName, student?.fatherName || '', student?.class || '', item.amount,
              'Paid', format(item.date, 'yyyy-MM-dd')
            ]
          });
      filename = 'paid-students-report.csv';
    } else {
      toast({ variant: 'destructive', title: 'Not Implemented', description: 'This report type is not yet available for export.' });
      return;
    }

    const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleAction = (reportId: string) => {
    if (reportId === 'student-ledger') {
        router.push('/student-ledger');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate, view, and export various reports for your academy.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((report) => {
          const Icon = report.icon;
          const isPaidStudentsReport = report.id === 'paid-students';
          const isUnpaidDuesReport = report.id === 'unpaid-dues';
          
          if (report.type === 'dialog') {
            return (
              <Dialog key={report.id}>
                <Card className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle>{report.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto flex gap-2 pt-4">
                     <DialogTrigger asChild>
                       <Button className="w-full" disabled={!report.isEnabled}>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Report
                        </Button>
                    </DialogTrigger>
                  </CardContent>
                </Card>
                {report.dialogComponent}
              </Dialog>
            );
          }
          
          return (
            <Card key={report.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-4 pt-4">
                 {isPaidStudentsReport && (
                  <div className="flex flex-wrap gap-2 items-end border-t pt-4">
                      <div className="space-y-1 flex-grow">
                          <Label className="text-xs">Month</Label>
                          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                              <SelectTrigger>
                                  <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                  {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-1">
                          <Label className="text-xs">Year</Label>
                          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                              <SelectTrigger>
                                  <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                  {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                )}
                {isUnpaidDuesReport && (
                  <div className="flex flex-wrap gap-2 items-end border-t pt-4">
                      <div className="space-y-1 flex-grow">
                          <Label className="text-xs">Filter by Class</Label>
                          <Select value={unpaidDuesClassFilter} onValueChange={setUnpaidDuesClassFilter}>
                              <SelectTrigger>
                                  <SelectValue placeholder="All Classes" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">All Classes</SelectItem>
                                  {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                )}
                <div className="flex gap-2">
                    {report.type === 'action' ? (
                        <Button className="w-full" onClick={() => handleAction(report.id)} disabled={!report.isEnabled}>
                            <FileText className="mr-2 h-4 w-4" />
                            Open Report Section
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" className="w-full" onClick={() => handlePrint(report.id)} disabled={!report.isEnabled || dataLoading || isSettingsLoading}>
                              {dataLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Printer className="mr-2 h-4 w-4" />}
                              Print
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => handleExport(report.id)} disabled={!report.isEnabled || dataLoading}>
                              {dataLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <FileDown className="mr-2 h-4 w-4" />}
                              Export
                            </Button>
                        </>
                    )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
