'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function TeacherEarningsClient({ 
  teacherId, 
  teacherName,
}: { 
  teacherId: string, 
  teacherName: string,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePrint = () => {
    const printUrl = `${pathname}?print=true`;
    const printWindow = window.open(printUrl, '_blank');
    printWindow?.addEventListener('load', () => {
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    });
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
