
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getTeacherAttendanceForMonth } from '@/lib/firebase/firestore';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';

type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
type AttendanceRecord = {
    date: Date;
    status: AttendanceStatus;
};

export function MonthlyTeacherAttendance() {
    const { teacher, loading: authLoading } = useTeacherAuth();
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (teacher) {
            const now = new Date();
            const month = now.getMonth();
            const year = now.getFullYear();
            setIsLoading(true);
            getTeacherAttendanceForMonth(teacher.id, month, year).then(data => {
                setAttendanceData(data);
                setIsLoading(false);
            });
        }
    }, [teacher]);

    const summary = useMemo(() => {
        return attendanceData.reduce((acc, record) => {
            acc[record.status] = (acc[record.status] || 0) + 1;
            return acc;
        }, {} as { [key in AttendanceStatus]?: number });
    }, [attendanceData]);
    
    if (authLoading || isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ClipboardCheck /> My Attendance This Month</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        <Skeleton className="h-4 w-48" />
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-center">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck />
                    My Attendance
                </CardTitle>
                <CardDescription>
                    Summary for {format(new Date(), 'MMMM yyyy')}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-md">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Present</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{summary.Present || 0}</p>
                </div>
                <div className="p-4 bg-red-100 dark:bg-red-900 rounded-md">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Absent</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300">{summary.Absent || 0}</p>
                </div>
                <div className="p-4 bg-yellow-100 dark:bg-yellow-800 rounded-md">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Leave</p>
                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{summary.Leave || 0}</p>
                </div>
            </CardContent>
        </Card>
    )
}
