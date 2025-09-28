'use client';

import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { ArrowLeft, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TeacherEarningsClient({ teacherId, teacherName }: { teacherId: string, teacherName: string }) {
  const router = useRouter();
  const { settings } = useSettings();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const reportContent = document.getElementById('print-area')?.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>Earnings Report - ${teacherName}</title>
            <link rel="stylesheet" href="/globals.css" />
            <style>
                @import url('https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');
                body { 
                    font-family: 'PT Sans', sans-serif;
                    margin: 20px;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 1rem;
                }
                .print-header img {
                    height: 80px;
                    width: 80px;
                    object-fit: contain;
                }
                .print-header h1 {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0;
                }
                .print-header p {
                    font-size: 0.875rem;
                    color: #666;
                    margin: 2px 0;
                }
                .print-hidden { display: none !important; }
                .print-block { display: block !important; }
                .print-shadow-none { box-shadow: none !important; }
                .print-border { border: 1px solid #ddd !important; }
                .print-border-none { border: none !important; }
                .card { 
                    border: 1px solid #e5e7eb; 
                    border-radius: 0.5rem;
                    margin-bottom: 1.5rem;
                }
                .card-header { padding: 1.5rem; }
                .card-title { font-size: 1.25rem; font-weight: 600; }
                .card-description { font-size: 0.875rem; color: #6b7280; }
                .card-content { padding: 1.5rem; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .table th { color: #6b7280; }
                .text-right { text-align: right; }
            </style>
          </head>
          <body>
            <div class="print-header">
                <img src="${settings.logo}" alt="Academy Logo" />
                <h1>${settings.name}</h1>
                <p>${settings.address}</p>
                <p>Phone: ${settings.phone}</p>
            </div>
            ${reportContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
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
