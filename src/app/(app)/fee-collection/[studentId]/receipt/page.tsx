'use client';

import { Logo } from '@/components/logo';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { students } from '@/lib/data';
import { notFound, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export default function FeeReceiptPage({ params }: { params: { studentId: string } }) {
  const { studentId } = params;
  const searchParams = useSearchParams();
  const student = useMemo(() => students.find(s => s.id === studentId), [studentId]);
  
  const paidAmount = Number(searchParams.get('amount') || '0');
  const balance = Number(searchParams.get('balance') || '0');
  const totalFee = Number(searchParams.get('total') || '0');
  
  const receiptDate = useMemo(() => format(new Date(), 'dd/MM/yyyy'), []);
  const receiptId = useMemo(() => `INV-${Date.now()}`.substring(0, 15), []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimeout(() => window.print(), 500);
    }
  }, []);

  if (!student) {
    notFound();
  }

  return (
    <main className="flex min-h-svh w-full items-start justify-center bg-gray-100 px-4 py-12 print:bg-white print:p-8">
        <div className="w-full max-w-lg print:max-w-none print:w-auto font-sans">
            <Card className="shadow-none print:shadow-none print:border-0 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[120px] font-bold text-red-100/80 dark:text-red-900/20 transform -rotate-12 select-none pointer-events-none">
                        PAID
                    </div>
                </div>
                <CardHeader className="text-center space-y-2 border-b pb-4">
                    <div className="flex w-full justify-center">
                        <div className="h-16 w-16">
                            <img src="/logo.png" alt="Academy Logo" className="h-full w-full object-contain" />
                        </div>
                    </div>
                    <div>
                        <h1 className='text-2xl font-bold'>The Spirit School Samundri</h1>
                        <p className='text-sm text-muted-foreground'>Housing Colony 2, Samundri Faisalabad</p>
                        <p className='text-sm text-muted-foreground'>Phone: 0333 9114333</p>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 text-sm pt-6">
                    <div className='flex justify-between items-center'>
                        <h2 className='text-lg font-semibold'>Fee Receipt</h2>
                        <div className="text-right">
                           <p><strong>Receipt #:</strong> {receiptId}</p>
                           <p><strong>Date:</strong> {receiptDate}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold mb-1">Billed To:</h3>
                            <p>{student.name} (ID: {student.id})</p>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-1">Payment Details:</h3>
                            <p>Method: By Hand</p>
                            <p>Status: {balance > 0 ? 'Partially Paid' : 'Paid'}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Fee Description</h3>
                        <div className='border-t border-b'>
                             <div className="flex justify-between items-center py-2">
                                <span>September 2025</span>
                                <span className='font-medium'>{totalFee.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className='flex justify-end'>
                        <table className="w-1/2">
                            <tbody>
                                <tr>
                                    <td className="py-1 text-muted-foreground">Previous Balance:</td>
                                    <td className="py-1 text-right font-medium">PKR {totalFee.toLocaleString()}</td>
                                </tr>
                                 <tr>
                                    <td className="py-1 text-muted-foreground">Paid Amount:</td>
                                    <td className="py-1 text-right font-medium">- PKR {paidAmount.toLocaleString()}</td>
                                </tr>
                                <tr className="font-bold text-base border-t">
                                    <td className="py-2">New Balance Due:</td>
                                    <td className="py-2 text-right">PKR {balance.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </CardContent>
                <CardFooter className='flex-col items-center justify-center text-xs text-muted-foreground gap-1 pt-6 border-t'>
                    <p>Thank you for your payment!</p>
                    <p>© {new Date().getFullYear()} The Spirit School Samundri. All rights reserved.</p>
                </CardFooter>
            </Card>
        </div>
    </main>
  );
}
