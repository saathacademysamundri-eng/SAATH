'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { students } from '@/lib/data';
import { notFound } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function StudentFeeDetailsPage({ params }: { params: { studentId: string } }) {
  const { studentId } = params;
  const student = useMemo(() => students.find(s => s.id === studentId), [studentId]);
  
  const [paidAmount, setPaidAmount] = useState(0);
  
  if (!student) {
    notFound();
  }

  const balance = student.totalFee - paidAmount;

  return (
    <div className="flex flex-col gap-6">
       <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Payment</h1>
          <p className="text-muted-foreground">
            Process fee payment for {student.name}.
          </p>
        </div>
        <Card className="max-w-2xl mx-auto w-full">
            <CardHeader>
                <div className='grid gap-1'>
                    <CardTitle>{student.name}</CardTitle>
                    <CardDescription>
                        Roll #: {student.id} | Class: {student.class}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className='grid gap-6'>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className='p-4 bg-secondary rounded-lg'>
                        <p className='text-sm text-muted-foreground'>Total Fee</p>
                        <p className='text-2xl font-bold'>{student.totalFee.toLocaleString()} PKR</p>
                    </div>
                     <div className='p-4 bg-secondary rounded-lg'>
                        <p className='text-sm text-muted-foreground'>Balance</p>
                        <p className='text-2xl font-bold'>{balance.toLocaleString()} PKR</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="paidAmount">Amount Paid (PKR)</Label>
                    <Input 
                        id="paidAmount" 
                        type="number"
                        placeholder="Enter amount being paid" 
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                    />
                </div>
                <Button>Record Payment</Button>
            </CardContent>
        </Card>
    </div>
  )
}
