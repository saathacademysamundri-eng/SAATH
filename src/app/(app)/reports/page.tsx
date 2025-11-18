
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Student } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ClassAttendanceDialog } from './class-attendance-dialog';
import { DailyAttendanceSummaryDialog } from './daily-attendance-summary-dialog';

export default function ReportsPage() {
  const { students, loading: studentsLoading } = useAppContext();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();
  const router = useRouter();

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
      id: 'unpaid-dues',
      title: 'Unpaid Dues Report',
      description: 'A list of all students with pending or overdue fee payments, including balance amounts.',
      icon: BadgeAlert,
      isEnabled: true,
      type: 'print-export',
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
  
  const generatePrintHtml = (title: string, headers: string[], rows: string) => {
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
            .report-container { max-width: 1000px; margin: auto; padding: 20px; }
            .academy-details { text-align: center; margin-bottom: 2rem; }
            .academy-details img { height: 60px; margin-bottom: 0.5rem; object-fit: contain; }
            .academy-details h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
            .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
            .report-title { text-align: center; margin: 2rem 0; }
            .report-title h2 { font-size: 1.8rem; font-weight: bold; margin: 0; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
            th, td { padding: 8px 10px; border: 1px solid #ddd; }
            th { font-weight: bold; background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="academy-details">
              ${settings.logo ? `<img src="${settings.logo}" alt="Academy Logo" />` : ''}
              <h1>${settings.name}</h1>
              <p>${settings.address}</p>
              <p>Phone: ${settings.phone}</p>
            </div>
            <div class="report-title">
              <h2>${title}</h2>
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

    if (reportId === 'all-students') {
        reportTitle = 'All Students Report';
        tableHeaders = ["Roll #", "Student Name", "Father's Name", "Class", "Phone", "Outstanding Fee", "Fee Status"];
        tableRows = students.map(student => `
            <tr>
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
        tableHeaders = ["Roll #", "Student Name", "Class", "Outstanding Dues", "Fee Status"];
        tableRows = students
          .filter(s => s.feeStatus !== 'Paid')
          .map(student => `
            <tr>
              <td>${student.id}</td>
              <td>${student.name}</td>
              <td>${student.class}</td>
              <td>${student.totalFee.toLocaleString()} PKR</td>
              <td>${student.feeStatus}</td>
            </tr>
          `).join('');
    } else {
        toast({ variant: 'destructive', title: 'Not Implemented', description: 'This report type is not yet available for printing.' });
        return;
    }
    
    const printHtml = generatePrintHtml(reportTitle, tableHeaders, tableRows);
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  const handleExport = (reportId: string) => {
    let headers: string[] = [];
    let data: Student[] = [];
    let filename = '';

    if (reportId === 'all-students') {
      headers = ["ID", "Name", "Father's Name", "Class", "Phone", "Total Fee", "Fee Status", "Subjects"];
      data = students;
      filename = 'all-students-report.csv';

      const csvContent = [
        headers.join(','),
        ...data.map((s: Student) => [
          s.id,
          s.name,
          s.fatherName,
          s.class,
          s.phone,
          s.totalFee,
          s.feeStatus,
          `"${s.subjects.map(sub => sub.subject_name).join(', ')}"`
        ].join(','))
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

    } else if (reportId === 'unpaid-dues') {
      headers = ["ID", "Name", "Class", "Outstanding Dues", "Fee Status"];
      data = students.filter(s => s.feeStatus !== 'Paid');
      filename = 'unpaid-dues-report.csv';

      const csvContent = [
        headers.join(','),
        ...data.map((s: Student) => [
          s.id,
          s.name,
          s.class,
          s.totalFee,
          s.feeStatus,
        ].join(','))
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
      
    } else {
      toast({ variant: 'destructive', title: 'Not Implemented', description: 'This report type is not yet available for export.' });
      return;
    }
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
              <CardContent className="mt-auto flex gap-2 pt-4">
                {report.type === 'action' ? (
                    <Button className="w-full" onClick={() => handleAction(report.id)} disabled={!report.isEnabled}>
                        <FileText className="mr-2 h-4 w-4" />
                        Open Report Section
                    </Button>
                ) : (
                    <>
                        <Button variant="outline" className="w-full" onClick={() => handlePrint(report.id)} disabled={!report.isEnabled || studentsLoading || isSettingsLoading}>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => handleExport(report.id)} disabled={!report.isEnabled || studentsLoading}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Export as CSV
                        </Button>
                    </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
