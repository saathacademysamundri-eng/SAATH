
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Hourglass, Users } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/hooks/use-app-context';

export default function ReportsPage() {
    const { students, income, loading } = useAppContext();

    const totalStudents = useMemo(() => students.length, [students]);
    const totalFeesCollected = useMemo(() => income.reduce((sum, item) => sum + item.amount, 0), [income]);

    const pendingStudents = useMemo(() => {
        return students.filter(s => s.feeStatus === 'Pending' || s.feeStatus === 'Partial' || s.feeStatus === 'Overdue');
    }, [students]);

    const totalPendingFees = useMemo(() => {
        return pendingStudents.reduce((sum, s) => sum + s.totalFee, 0);
    }, [pendingStudents]);

    function getFeeStatusBadge(status: string) {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-700';
            case 'partial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700';
            case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700';
            default: return 'bg-secondary text-secondary-foreground';
        }
    }

    const summaryStats = [
        { title: 'Total Students', value: totalStudents.toLocaleString(), icon: Users },
        { title: 'Total Fees Collected', value: `${totalFeesCollected.toLocaleString()} PKR`, icon: DollarSign },
        { title: 'Total Pending Fees', value: `${totalPendingFees.toLocaleString()} PKR`, icon: Hourglass },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">General Reports</h1>
                <p className="text-muted-foreground">
                    An overview of key academy metrics.
                </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? Array.from({length: 3}).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <Skeleton className="h-5 w-32" />
                           <Skeleton className="h-5 w-5" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-8 w-24" />
                        </CardContent>
                    </Card>
                )) : summaryStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Students with Pending Fees</CardTitle>
                    <CardDescription>A list of all students with outstanding fee balances.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Roll #</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Fee Status</TableHead>
                                <TableHead className="text-right">Balance (PKR)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            )) : (
                                pendingStudents.length > 0 ? pendingStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.id}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.class}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn("text-xs font-normal", getFeeStatusBadge(student.feeStatus))}>{student.feeStatus}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{student.totalFee.toLocaleString()}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No students with pending fees.
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
