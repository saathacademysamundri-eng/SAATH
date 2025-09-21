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
  
  const receiptDate = useMemo(() => format(new Date(), 'MMMM dd, yyyy'), []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimeout(() => window.print(), 500);
    }
  }, []);

  if (!student) {
    notFound();
  }

  return (
    <main className="flex min-h-svh w-full items-start justify-center bg-gray-100 px-4 py-12 print:bg-white print:py-0">
        <div className="w-full max-w-lg print:max-w-none print:w-auto">
            <Card className="shadow-lg print:shadow-none print:border-0">
                <CardHeader className="text-center space-y-4">
                    <div className="flex w-full justify-center">
                        <Logo />
                    </div>
                    <div className="pt-4">
                        <CardTitle className="text-2xl">Fee Receipt</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 text-base">
                    <div className="flex justify-between">
                        <div>
                            <p className="font-semibold">Receipt No:</p>
                            <p>#{student.id.replace('S', '')}{format(new Date(), 'MMdd')}</p>
                        </div>
                         <div className="text-right">
                            <p className="font-semibold">Date:</p>
                            <p>{receiptDate}</p>
                        </div>
                    </div>
                    
                    <Separator />

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <p className="text-muted-foreground">Roll #:</p><p className="font-medium">{student.id}</p>
                            <p className="text-muted-foreground">Name:</p><p className="font-medium">{student.name}</p>
                            <p className="text-muted-foreground">Class:</p><p className="font-medium">{student.class}</p>
                        </div>
                    </div>

                    <Separator />
                    
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Fee Details</h3>
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 text-muted-foreground">Total Fee</td>
                                    <td className="py-2 text-right font-medium">{totalFee.toLocaleString()} PKR</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 text-muted-foreground">Amount Paid</td>
                                    <td className="py-2 text-right font-medium text-green-600">{paidAmount.toLocaleString()} PKR</td>
                                </tr>
                                <tr className="font-bold text-lg">
                                    <td className="py-3">Balance Due</td>
                                    <td className="py-3 text-right">{balance.toLocaleString()} PKR</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                     <div className="text-center text-xs text-muted-foreground pt-4">
                        <p>This is a computer-generated receipt and does not require a signature.</p>
                        <p>Thank you for your payment!</p>
                    </div>

                </CardContent>
                <CardFooter className='flex justify-center'>
                    <p className='text-sm font-medium'>AcademiaLite Management</p>
                </CardFooter>
            </Card>
        </div>
    </main>
  );
}
