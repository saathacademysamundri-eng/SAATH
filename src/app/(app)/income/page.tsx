
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { type Income } from '@/lib/data';
import { getIncome } from '@/lib/firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';

export default function IncomePage() {
    const [income, setIncome] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchIncome() {
            const incomeData = await getIncome();
            setIncome(incomeData);
            setLoading(false);
        }
        fetchIncome();
    }, []);

    const totalIncome = useMemo(() => {
        return income.reduce((sum, item) => sum + item.amount, 0);
    }, [income]);

  return (
    <div className="flex flex-col gap-6">
       <div>
          <h1 className="text-2xl font-bold tracking-tight">Income</h1>
          <p className="text-muted-foreground">
            A record of all fee collections.
          </p>
        </div>
      <Card>
        <CardHeader>
            <CardTitle>Income Statement</CardTitle>
            <CardDescription>
                List of all income generated from student fee payments. Total income is
                <span className="font-bold text-green-600"> {totalIncome.toLocaleString()} PKR</span>.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead className="text-right">Amount (PKR)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                        </TableRow>
                        ))
                    ) : (
                        income.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{format(item.date, 'PPP')}</TableCell>
                                <TableCell className="font-medium">{item.studentName}</TableCell>
                                <TableCell>{item.studentId}</TableCell>
                                <TableCell className="text-right font-medium">{item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                        ))
                    )}
                     {!loading && income.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No income records found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
