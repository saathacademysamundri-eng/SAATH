
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/hooks/use-app-context';
import { getTeacherAttendanceForMonth } from '@/lib/firebase/firestore';
import { ClipboardList } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

type TeacherAttendanceSummary = {
  teacherId: string;
  teacherName: string;
  todayStatus: 'Present' | 'Absent' | 'Leave' | 'Not Marked';
  presentMonth: number;
  absentMonth: number;
};

export function TodaysTeacherAttendance() {
    const { teachers, loading } = useAppContext();
    const [attendanceData, setAttendanceData] = useState<TeacherAttendanceSummary[]>([]);
    
    useEffect(() => {
        if (!loading) {
            async function fetchAllTeacherAttendance() {
                const summaryPromises = teachers.map(teacher => 
                    getTeacherAttendanceForMonth(teacher.id, new Date().getMonth(), new Date().getFullYear())
                );
                const results = await Promise.all(summaryPromises);

                const summaryData = teachers.map((teacher, index) => {
                    const monthData = results[index];
                    const todayStr = new Date().toISOString().split('T')[0];
                    const todayRecord = monthData.find(d => d.date.toISOString().split('T')[0] === todayStr);

                    return {
                        teacherId: teacher.id,
                        teacherName: teacher.name,
                        todayStatus: todayRecord?.status || 'Not Marked',
                        presentMonth: monthData.filter(d => d.status === 'Present').length,
                        absentMonth: monthData.filter(d => d.status === 'Absent').length,
                    }
                });

                setAttendanceData(summaryData);
            }
            fetchAllTeacherAttendance();
        }
    }, [loading, teachers]);
    
    const getStatusBadgeVariant = (status: TeacherAttendanceSummary['todayStatus']) => {
        switch(status) {
            case 'Present': return 'secondary';
            case 'Absent': return 'destructive';
            case 'Leave': return 'outline';
            default: return 'outline';
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardList />
                    Today's Teacher Attendance
                </CardTitle>
                <CardDescription>A summary of teacher attendance for today and the current month.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead className="text-center">Today's Status</TableHead>
                            <TableHead className="text-center">Present (Month)</TableHead>
                            <TableHead className="text-center">Absent (Month)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceData.map(item => (
                            <TableRow key={item.teacherId}>
                                <TableCell className="font-medium">{item.teacherName}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={getStatusBadgeVariant(item.todayStatus)}>{item.todayStatus}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs">
                                        {item.presentMonth}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-800 font-bold text-xs">
                                        {item.absentMonth}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                         {attendanceData.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No teacher attendance data for today.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
