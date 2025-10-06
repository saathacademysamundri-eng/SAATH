
'use client';

import { useSettings } from '@/hooks/use-settings';
import { students } from '@/lib/data';
import { notFound, useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { format } from 'date-fns';

export default function FeeReceiptPage({ params }: { params: { studentId: string } }) {
  const { studentId } = params;
  const searchParams = useSearchParams();
  const router = useRouter();

  const { settings, isSettingsLoading } = useSettings();
  const student = useMemo(() => students.find(s => s.id === studentId), [studentId]);
  
  const paidAmount = Number(searchParams.get('amount') || '0');
  const balance = Number(searchParams.get('balance') || '0');
  const totalFee = Number(searchParams.get('total') || '0');
  
  const receiptDate = useMemo(() => format(new Date(), 'dd/MM/yyyy, hh:mm a'), []);
  const receiptId = useMemo(() => `RCPT-${Date.now()}`.substring(0, 15), []);

  useEffect(() => {
    if (!isSettingsLoading && student) {
        const receiptHtml = `
            <html>
                <head>
                    <title>Fee Receipt - ${student.name}</title>
                    <style>
                        @media print {
                            @page { size: 80mm; margin: 0; }
                            body { margin: 0; -webkit-print-color-adjust: exact; }
                            main { padding: 2mm; margin: 0; }
                            main > div { width: 100% !important; margin: 0 !important; }
                        }
                        body { font-family: 'PT Sans', sans-serif; background-color: white; color: black; }
                        .receipt-container { width: 80mm; margin: auto; padding: 2mm; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .font-bold { font-weight: bold; }
                        .text-lg { font-size: 1.125rem; }
                        .text-xs { font-size: 0.75rem; }
                        .space-y-1 > * + * { margin-top: 0.25rem; }
                        .flex { display: flex; }
                        .justify-center { justify-content: center; }
                        .justify-between { justify-content: space-between; }
                        .h-16 { height: 4rem; }
                        .w-16 { width: 4rem; }
                        .object-contain { object-fit: contain; }
                        .border-t { border-top: 1px dashed black; }
                        .border-b { border-bottom: 1px dashed black; }
                        .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
                        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                        .mb-2 { margin-bottom: 0.5rem; }
                        .w-full { width: 100%; }
                        .font-semibold { font-weight: 600; }
                        .text-left { text-align: left; }
                        .mt-2 { margin-top: 0.5rem; }
                        .w-1\\/2 { width: 50%; }
                        .ml-auto { margin-left: auto; }
                        .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
                        .font-medium { font-weight: 500; }
                        .mt-4 { margin-top: 1rem; }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <div class="text-center space-y-1">
                            <div class="flex justify-center">
                                <div class="h-16 w-16">
                                    <img src="${settings.logo}" alt="Academy Logo" class="h-full w-full object-contain" />
                                </div>
                            </div>
                            <div>
                                <h1 class='text-lg font-bold'>${settings.name}</h1>
                                <p class='text-xs'>${settings.address}</p>
                                <p class='text-xs'>Phone: ${settings.phone}</p>
                            </div>
                        </div>
                        
                        <div class="border-t border-b my-2 py-1 text-xs">
                            <div class='flex justify-between'>
                                <span>Receipt #: ${receiptId}</span>
                                <span>Date: ${receiptDate}</span>
                            </div>
                        </div>

                        <div class='text-xs mb-2'>
                            <p><strong>Student:</strong> ${student.name} (${student.id})</p>
                            <p><strong>Class:</strong> ${student.class}</p>
                        </div>

                        <table class="w-full text-xs">
                            <thead>
                                <tr class='border-t border-b'>
                                    <th class="py-1 text-left font-semibold">Description</th>
                                    <th class="py-1 text-right font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class='border-b'>
                                    <td class="py-1">Tuition Fee</td>
                                    <td class="py-1 text-right">${totalFee.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div class='flex justify-end mt-2'>
                            <table class="w-1/2 ml-auto text-xs">
                                <tbody>
                                    <tr>
                                        <td class="py-0.5">Total Due:</td>
                                        <td class="py-0.5 text-right font-medium">${totalFee.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td class="py-0.5">Amount Paid:</td>
                                        <td class="py-0.5 text-right font-medium">${paidAmount.toLocaleString()}</td>
                                    </tr>
                                    <tr class="font-bold border-t">
                                        <td class="py-1">Balance:</td>
                                        <td class="py-1 text-right">${balance.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class='text-center text-xs mt-4 space-y-1'>
                            <p>*** Thank you for your payment! ***</p>
                            <p>&copy; ${new Date().getFullYear()} ${settings.name}.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(receiptHtml);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
                // Optionally navigate back or to a different page
                router.push('/fee-collection');
            }, 250);
        }
    }
  }, [isSettingsLoading, student, settings, paidAmount, balance, totalFee, receiptDate, receiptId, router]);
  
  if (isSettingsLoading || !student) {
      return <div className="flex items-center justify-center h-screen">Loading receipt...</div>;
  }

  // This will be replaced by the print content, but acts as a fallback.
  return <main className="font-sans bg-white text-black p-2">Generating receipt...</main>;
}
