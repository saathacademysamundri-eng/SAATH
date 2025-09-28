
'use client';

import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { ArrowLeft, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TeacherEarningsClient({ 
  teacherId, 
  teacherName,
}: { 
  teacherId: string, 
  teacherName: string,
}) {
  const router = useRouter();
  const { settings, isSettingsLoading } = useSettings();

  const handlePrint = () => {
    if (isSettingsLoading) {
      alert("Please wait for settings to load.");
      return;
    }

    const printContentEl = document.getElementById('print-area');
    if (!printContentEl) return;

    // Extracting data directly from the DOM to ensure it's current
    const grossEarnings = printContentEl.querySelector('[data-stat="gross-earnings"]')?.textContent || '0 PKR';
    const teacherShare = printContentEl.querySelector('[data-stat="teacher-share"]')?.textContent || '0 PKR';
    const academyShare = printContentEl.querySelector('[data-stat="academy-share"]')?.textContent || '0 PKR';
    const studentTable = printContentEl.querySelector('table')?.outerHTML || '<table></table>';

    const academyLogo = settings.logo;
    const academyName = settings.name;
    const academyAddress = settings.address;
    const academyPhone = settings.phone;
    const reportDate = new Date().toLocaleDateString('en-GB');

    const printHtml = `
      <html>
        <head>
          <title>Earnings Report - ${teacherName}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
          <style>
            @media print {
              @page { size: A4; margin: 0; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { 
              font-family: 'PT Sans', sans-serif; 
              margin: 0; 
              padding: 2rem; 
              background-color: #fff;
              color: #000;
            }
            .report-container { max-width: 800px; margin: auto; }
            .header-info { display: flex; justify-content: space-between; align-items: flex-start; font-size: 0.8rem; color: #333; }
            .academy-details { text-align: center; margin-top: -2rem; }
            .academy-details img { height: 60px; margin-bottom: 0.5rem; }
            .academy-details h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
            .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
            .report-title { text-align: center; margin: 3rem 0; }
            .report-title h2 { font-size: 2.25rem; font-weight: bold; margin: 0 0 0.5rem 0; }
            .report-title p { font-size: 1rem; color: #555; margin: 0; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
            .stat-card { border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; text-align: center; }
            .stat-card p { margin: 0; color: #6b7280; }
            .stat-card .amount { font-size: 2rem; font-weight: bold; margin-top: 0.5rem; }
            .teacher-share { color: #16a34a; }
            .academy-share { color: #3b82f6; }
            .breakdown-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; border-bottom: 2px solid #f3f4f6; padding-bottom: 0.5rem; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th, td { padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb; }
            th { font-weight: bold; color: #6b7280; }
            td:last-child, th:last-child { text-align: right; }
            .footer { text-align: right; margin-top: 2rem; font-size: 0.8rem; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header-info">
              <span>${new Date().toLocaleString()}</span>
              <span>Earnings Report - ${teacherName}</span>
            </div>

            <div class="academy-details">
              <img src="${academyLogo}" alt="Academy Logo" />
              <h1>${academyName}</h1>
              <p>${academyAddress}</p>
              <p>Phone: ${academyPhone}</p>
            </div>

            <div class="report-title">
              <h2>Earnings Report</h2>
              <p>For: ${teacherName} | Date: ${reportDate}</p>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <p>Total Gross Earnings</p>
                <p class="amount">${grossEarnings}</p>
              </div>
              <div class="stat-card">
                <p>Teacher's Share (70%)</p>
                <p class="amount teacher-share">${teacherShare}</p>
              </div>
              <div class="stat-card">
                <p>Academy's Share (30%)</p>
                <p class="amount academy-share">${academyShare}</p>
              </div>
            </div>

            <h3 class="breakdown-title">Student Breakdown</h3>
            ${studentTable}

            <div class="footer">
              <p>1 / 1</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500); // Wait for content to render
    }
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
      <Button variant="outline" className="ml-auto" onClick={handlePrint}>
        <Printer className="mr-2" />
        Print Report
      </Button>
    </div>
  );
}
