

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/use-settings';
import { Income, Student } from '@/lib/data';
import { getIncomeByReceiptId, getStudent } from '@/lib/firebase/firestore';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function VerificationSkeleton() {
    return (
        <main className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
            <div className="mx-auto max-w-md">
                <Card className="mb-6">
                    <CardContent className="p-6 text-center">
                        <Skeleton className="h-12 w-3/4 mx-auto mb-2" />
                        <Skeleton className="h-5 w-full mx-auto mb-1" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="items-center text-center space-y-4">
                        <Skeleton className="w-20 h-20 rounded-full" />
                        <Skeleton className="h-8 w-1/2 mx-auto" />
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-2/3" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-1/2" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-3/4" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

export default function ReceiptVerificationPage() {
    const params = useParams();
    const receiptId = params.receiptId as string;

    const { settings, isSettingsLoading } = useSettings();
    const [income, setIncome] = useState<Income | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (receiptId) {
            async function fetchData() {
                try {
                    const incomeData = await getIncomeByReceiptId(receiptId);
                    if (incomeData) {
                        setIncome(incomeData);
                        const studentData = await getStudent(incomeData.studentId);
                        setStudent(studentData);
                    } else {
                        setError('No payment record found for this receipt ID.');
                    }
                } catch (e) {
                    setError('An error occurred while fetching the receipt details.');
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            }
            fetchData();
        }
    }, [receiptId]);

    if (loading || isSettingsLoading) {
        return <VerificationSkeleton />;
    }
    
    if (error) {
        return (
            <main className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
                <div className="mx-auto max-w-md text-center">
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-destructive'>Verification Failed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{error}</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    if (!income || !student) {
         return (
            <main className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
                <div className="mx-auto max-w-md text-center">
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-destructive'>Verification Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Could not load receipt details.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
            <div className="mx-auto max-w-md relative">
                <header className="mb-6">
                    <Card>
                        <CardContent className="p-6 text-center">
                            {settings.logo && <img src={settings.logo} alt="Academy Logo" className="h-16 mx-auto mb-4 object-contain" />}
                            <h1 className="text-2xl font-bold text-primary">{settings.name}</h1>
                            <p className="text-muted-foreground">{settings.address}</p>
                        </CardContent>
                    </Card>
                </header>

                <Card className="relative overflow-hidden">
                     <CardHeader className="items-center text-center space-y-4 bg-green-50 dark:bg-green-900/20">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                        <CardTitle className="text-2xl font-bold">Payment Verified</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-2 divide-y">
                        <div className='py-4'>
                            <p className='text-sm text-muted-foreground'>Student Name</p>
                            <p className='text-lg font-semibold'>{student.name}</p>
                        </div>
                         <div className='py-4'>
                            <p className='text-sm text-muted-foreground'>Roll Number</p>
                            <p className='text-lg font-semibold'>{student.id}</p>
                        </div>
                        <div className='py-4'>
                            <p className='text-sm text-muted-foreground'>Class</p>
                            <p className='text-lg font-semibold'>{student.class}</p>
                        </div>
                         <div className='py-4'>
                            <p className='text-sm text-muted-foreground'>Amount Paid</p>
                            <p className='text-2xl font-bold text-green-600'>{income.amount.toLocaleString()} PKR</p>
                        </div>
                         <div className='py-4'>
                            <p className='text-sm text-muted-foreground'>Payment Date</p>
                            <p className='text-lg font-semibold'>{format(income.date, 'PPP')}</p>
                        </div>
                        <div className='py-4'>
                            <p className='text-sm text-muted-foreground'>Receipt ID</p>
                            <p className='text-lg font-mono font-semibold'>{income.receiptId}</p>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </main>
    );
}
