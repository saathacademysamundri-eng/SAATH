
'use client';

import { addReport } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';


export function TeacherEarningsClient({ 
  teacherId, 
  teacherName,
  getReportData,
}: { 
  teacherId: string, 
  teacherName: string,
  getReportData: () => any;
}) {
  const router = useRouter();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAndPrint = async () => {
    if (isSettingsLoading) {
      toast({ title: "Please wait", description: "Settings are loading."});
      return;
    }
    
    setIsGenerating(true);

    const reportData = getReportData();
    if (!reportData || reportData.grossEarnings === 0) {
      toast({ variant: 'destructive', title: 'No Data to Report', description: "There are no paid fees to generate a report."})
      setIsGenerating(false);
      return;
    }

    try {
      // The report is now saved within the payoutTeacher transaction.
      // This button is now only for printing a preview of the CURRENT earnings cycle.
      toast({ title: 'Printing Preview', description: 'This is a preview of the current cycle. The final report is saved upon payout.' });

      const printHtml = generatePrintHtml(reportData, teacherName, new Date());
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write(printHtml);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500); // Give it a moment to render before printing
      }

    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Report Generation Failed',
        description: (error as Error).message || 'An unknown error occurred.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePrintHtml = (reportData: any, teacherName: string, reportDate: Date) => {
    const { grossEarnings, teacherShare, academyShare, studentBreakdown } = reportData;
    const { logo, name, address, phone } = settings;
    const formattedReportDate = format(reportDate, 'PPP');

    const studentRows = studentBreakdown.map((item: any) => `
      <tr>
        <td>${item.studentName} (${item.studentId})</td>
        <td>${item.studentClass}</td>
        <td>${item.subjectName}</td>
        <td style="text-align: right;">${item.feeShare.toLocaleString()} PKR</td>
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
                    <p class="amount">${grossEarnings.toLocaleString()} PKR</p>
                </div>
                <div class="stat-card">
                    <p>Teacher's Share (70%)</p>
                    <p class="amount teacher-share">${teacherShare.toLocaleString()} PKR</p>
                </div>
                <div class="stat-card">
                    <p>Academy's Share (30%)</p>
                    <p class="amount academy-share">${academyShare.toLocaleString()} PKR</p>
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

  return (
    <div className="flex items-center gap-4 print:hidden">
      <Button variant="outline" size="icon" onClick={() => router.back()}>
        <ArrowLeft />
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Teacher Earnings</h1>
        <p className="text-muted-foreground">
          Earnings details for {teacherName}.
        </p>
      </div>
      <Button variant="outline" className="ml-auto" onClick={handleGenerateAndPrint} disabled={isGenerating || isSettingsLoading}>
        {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Printer className="mr-2" />}
        {isGenerating ? 'Generating...' : 'Print Current Cycle'}
      </Button>
    </div>
  );
}

    