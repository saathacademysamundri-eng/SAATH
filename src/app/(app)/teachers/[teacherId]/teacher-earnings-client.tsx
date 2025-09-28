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
    const printContent = document.getElementById('print-area')?.innerHTML;
    const academyLogo = settings.logo;
    const academyName = settings.name;
    const academyAddress = settings.address;
    const academyPhone = settings.phone;
    
    if (printContent) {
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow?.document.write(`
            <html>
                <head>
                    <title>Teacher Report - ${teacherName}</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.5; }
                        .print-header { text-align: center; margin-bottom: 2rem; }
                        .print-header img { max-height: 80px; }
                        .print-header h1 { font-size: 1.5rem; margin: 0.5rem 0; }
                        .print-header p { margin: 0; font-size: 0.9rem; color: #555; }
                        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .text-right { text-align: right; }
                        .font-bold { font-weight: bold; }
                        .text-2xl { font-size: 1.5rem; }
                        .text-3xl { font-size: 1.875rem; }
                        .card { border: 1px solid #eee; border-radius: 0.5rem; margin-bottom: 1rem; }
                        .card-header { padding: 1rem; border-bottom: 1px solid #eee; }
                        .card-content { padding: 1rem; }
                        .card-title { font-size: 1.25rem; font-weight: 600; }
                        .card-description { font-size: 0.875rem; color: #666; }
                        .grid { display: grid; }
                        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                        .gap-6 { gap: 1.5rem; }
                        .lg\\:col-span-1 { grid-column: span 1 / span 1; }
                        .lg\\:col-span-2 { grid-column: span 2 / span 2; }
                        .space-y-6 > * + * { margin-top: 1.5rem; }
                        .sr-only, .print-hidden { display: none; }
                        .text-green-600 { color: #059669; }
                        .text-blue-600 { color: #2563eb; }
                        .flex { display: flex; }
                        .items-center { align-items: center; }
                        .gap-3 { gap: 0.75rem; }
                        .h-8 { height: 2rem; }
                        .w-8 { width: 2rem; }
                        .rounded-full { border-radius: 9999px; }
                        .font-medium { font-weight: 500; }
                        .text-xs { font-size: 0.75rem; }
                        .text-muted-foreground { color: #64748b; }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                        <img src="${academyLogo}" alt="Academy Logo" />
                        <h1>${academyName}</h1>
                        <p>${academyAddress}</p>
                        <p>Phone: ${academyPhone}</p>
                    </div>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow?.document.close();
        setTimeout(() => {
            printWindow?.print();
            printWindow?.close();
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
