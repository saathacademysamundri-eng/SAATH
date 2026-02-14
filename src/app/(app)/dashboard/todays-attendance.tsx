
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/hooks/use-app-context';
import { getTodaysAttendanceSummary } from '@/lib/firebase/firestore';
import { useEffect, useState } from 'react';

type ClassAttendance = {
    id: string;
    name: string;
    totalStudents: number;
    present: number;
    absent: number;
};

export function TodaysAttendance() {
    const { classes, loading } = useAppContext();
    const [attendanceData, setAttendanceData] = useState<ClassAttendance[]>([]);
    
    useEffect(() => {
        if (!loading) {
            getTodaysAttendanceSummary().then(summary => {
                const classData = classes.map(c => {
                    const classSummary = summary.classes[c.id] || { present: 0, absent: 0 };
                    return {
                        id: c.id,
                        name: c.name,
                        totalStudents: classSummary.present + classSummary.absent, // Approximate based on marked attendance
                        present: classSummary.present,
                        absent: classSummary.absent,
                    };
                });
                setAttendanceData(classData);
            });
        }
    }, [loading, classes]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Today's Attendance by Class</CardTitle>
                <CardDescription>A summary of student attendance for today.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Class</TableHead>
                            <TableHead className="text-center">Present</TableHead>
                            <TableHead className="text-center">Absent</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-center">
                                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs">
                                        {item.present}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-800 font-bold text-xs">
                                        {item.absent}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                         {attendanceData.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No attendance data for today.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
