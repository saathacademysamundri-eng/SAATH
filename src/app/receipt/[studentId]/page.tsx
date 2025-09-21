'use client';

import { useSettings } from '@/hooks/use-settings';
import { students } from '@/lib/data';
import { notFound, useSearchParams } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { format } from 'date-fns';

export default function FeeReceiptPage({ params }: { params: { studentId: string } }) {
  const { studentId } = params;
  const searchParams = useSearchParams();
  const { settings, isSettingsLoading } = useSettings();
  const student = useMemo(() => students.find(s => s.id === studentId), [studentId]);
  
  const paidAmount = Number(searchParams.get('amount') || '0');
  const balance = Number(searchParams.get('balance') || '0');
  const totalFee = Number(searchParams.get('total') || '0');
  
  const receiptDate = useMemo(() => format(new Date(), 'dd/MM/yyyy, hh:mm a'), []);
  const receiptId = useMemo(() => `RCPT-${Date.now()}`.substring(0, 15), []);
  
  if (isSettingsLoading) {
      return <div className="flex items-center justify-center h-screen">Loading receipt...</div>;
  }

  if (!student) {
    notFound();
  }

  return (
    <main className="font-sans bg-white text-black p-2">
        <div className="w-[80mm] mx-auto">
            <div className="text-center space-y-1">
                <div className="flex w-full justify-center">
                    <div className="h-16 w-16">
                        <img src={settings.logo} alt="Academy Logo" className="h-full w-full object-contain" />
                    </div>
                </div>
                <div>
                    <h1 className='text-lg font-bold'>{settings.name}</h1>
                    <p className='text-xs'>{settings.address}</p>
                    <p className='text-xs'>Phone: {settings.phone}</p>
                </div>
            </div>
            
            <div className="border-t border-b border-dashed border-black my-2 py-1 text-xs">
                <div className='flex justify-between'>
                    <span>Receipt #: {receiptId}</span>
                    <span>Date: {receiptDate}</span>
                </div>
            </div>

            <div className='text-xs mb-2'>
                <p><strong>Student:</strong> {student.name} ({student.id})</p>
                <p><strong>Class:</strong> {student.class}</p>
            </div>

            <table className="w-full text-xs">
                <thead>
                    <tr className='border-t border-b border-dashed border-black'>
                        <th className="py-1 text-left font-semibold">Description</th>
                        <th className="py-1 text-right font-semibold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='border-b border-dashed border-black'>
                        <td className="py-1">Tuition Fee</td>
                        <td className="py-1 text-right">{totalFee.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
            
            <div className='flex justify-end mt-2'>
                <table className="w-1/2 ml-auto text-xs">
                    <tbody>
                         <tr>
                            <td className="py-0.5">Total Due:</td>
                            <td className="py-0.5 text-right font-medium">{totalFee.toLocaleString()}</td>
                        </tr>
                         <tr>
                            <td className="py-0.5">Amount Paid:</td>
                            <td className="py-0.5 text-right font-medium">{paidAmount.toLocaleString()}</td>
                        </tr>
                        <tr className="font-bold border-t border-black">
                            <td className="py-1">Balance:</td>
                            <td className="py-1 text-right">{balance.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className='text-center text-xs mt-4 space-y-1'>
                 <p>*** Thank you for your payment! ***</p>
                 <p>&copy; {new Date().getFullYear()} {settings.name}.</p>
            </div>
            
        </div>
    </main>
  );
}
