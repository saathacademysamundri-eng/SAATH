'use client';

import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { ArrowLeft, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TeacherEarningsClient({ 
  teacherId, 
  teacherName,
  totalEarnings,
  teacherShare,
  academyShare,
  studentEarnings
}: { 
  teacherId: string, 
  teacherName: string,
  totalEarnings: number,
  teacherShare: number,
  academyShare: number,
  studentEarnings: { student: { id: string; name: string; class: string }; feeShare: number; subjectName: string; }[]
}) {
  const router = useRouter();
  const { settings } = useSettings();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const reportHtml = `
        <html>
          <head>
            <title>Earnings Report - ${teacherName}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                margin: 20px;
                color: #333;
              }
              .report-container {
                max-width: 800px;
                margin: auto;
              }
              .header {
                display: flex;
                align-items: center;
                border-bottom: 2px solid #eee;
                padding-bottom: 15px;
                margin-bottom: 20px;
              }
              .header img {
                height: 60px;
                width: 60px;
                object-fit: contain;
                margin-right: 15px;
              }
              .header .academy-info {
                flex-grow: 1;
              }
              .header h1 {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 600;
              }
              .header p {
                margin: 2px 0;
                font-size: 0.9rem;
                color: #555;
              }
              .report-title {
                text-align: center;
                margin-bottom: 25px;
              }
              .report-title h2 {
                margin: 0;
                font-size: 1.8rem;
                font-weight: bold;
              }
              .report-title p {
                margin: 5px 0 0;
                color: #666;
              }
              .summary-cards {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 20px;
                margin-bottom: 25px;
              }
              .summary-card {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
              }
              .summary-card h3 {
                margin: 0 0 5px;
                font-size: 1rem;
                font-weight: normal;
                color: #555;
              }
              .summary-card .amount {
                font-size: 1.75rem;
                font-weight: bold;
              }
              .summary-card.teacher-share .amount {
                color: #28a745;
              }
              .summary-card.academy-share .amount {
                color: #007bff;
              }
              .student-breakdown {
                border-top: 2px solid #eee;
                padding-top: 15px;
              }
              .student-breakdown h3 {
                font-size: 1.4rem;
                margin-bottom: 15px;
              }
              .student-table {
                width: 100%;
                border-collapse: collapse;
              }
              .student-table th, .student-table td {
                padding: 12px 8px;
                text-align: left;
                border-bottom: 1px solid #eee;
              }
              .student-table th {
                font-weight: 600;
                color: #333;
              }
              .student-table td:last-child {
                text-align: right;
                font-weight: 500;
              }
              @media print {
                body {
                  margin: 0;
                }
                .report-container {
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="report-container">
              <div class="header">
                <img src="${settings.logo}" alt="Academy Logo" />
                <div class="academy-info">
                  <h1>${settings.name}</h1>
                  <p>${settings.address}</p>
                  <p>Phone: ${settings.phone}</p>
                </div>
              </div>

              <div class="report-title">
                <h2>Earnings Report</h2>
                <p>For: <strong>${teacherName}</strong> | Date: ${new Date().toLocaleDateString()}</p>
              </div>

              <div class="summary-cards">
                <div class="summary-card">
                  <h3>Total Gross Earnings</h3>
                  <p class="amount">${totalEarnings.toLocaleString()} PKR</p>
                </div>
                <div class="summary-card teacher-share">
                  <h3>Teacher's Share (70%)</h3>
                  <p class="amount">${teacherShare.toLocaleString()} PKR</p>
                </div>
                <div class="summary-card academy-share">
                  <h3>Academy's Share (30%)</h3>
                  <p class="amount">${academyShare.toLocaleString()} PKR</p>
                </div>
              </div>

              <div class="student-breakdown">
                <h3>Student Breakdown</h3>
                <table class="student-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th>Subject</th>
                      <th style="text-align: right;">Fee Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${studentEarnings.map(item => `
                      <tr>
                        <td>${item.student.name} (${item.student.id})</td>
                        <td>${item.student.class}</td>
                        <td>${item.subjectName}</td>
                        <td>${item.feeShare.toLocaleString()} PKR</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(reportHtml);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <div className="flex items-center gap-4">
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
