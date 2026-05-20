'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getStudent } from '@/lib/firebase/firestore';
import { type Student } from '@/lib/data';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentFeeDetailsPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const router = useRouter();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [paidAmount, setPaidAmount] = useState(0);
  
  useEffect(() => {
    async function loadData() {
        if (!studentId) return;
        setLoading(true);
        const data = await getStudent(studentId);
        setStudent(data);
        setLoading(false);
    }
    loadData();
  }, [studentId]);

  if (loading) {
      return (
          <div className="flex flex-col gap-6">
              <Skeleton className="h-10 w-48" />
              <Card className="max-w-2xl mx-auto w-full">
                  <CardHeader><Skeleton className="h-24 w-full" /></CardHeader>
                  <CardContent><Skeleton className="h-48 w-full" /></CardContent>
              </Card>
          </div>
      )
  }

  if (!student) {
    notFound();
  }

  const handleCollectFee = () => {
    router.push('/fee-collection');
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
                        value={paidAmount || ''}
                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                    />
                </div>
                <Button onClick={handleCollectFee}>Go to Fee Collection</Button>
            </CardContent>
        </Card>
    </div>
  )
}
