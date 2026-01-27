
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/hooks/use-app-context';
import { getAllTeacherAttendanceForMonth } from '@/lib/firebase/firestore';
import { ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type TeacherAttendanceSummary = {
  teacherId: string;
  teacherName: string;
  todayStatus: 'Present' | 'Absent' | 'Leave' | 'Not Marked';
  presentMonth: number;
  absentMonth: number;
};

export function TodaysTeacherAttendance() {
    const { teachers, loading: appLoading } = useAppContext();
    const [attendanceData, setAttendanceData] = useState<TeacherAttendanceSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!appLoading && teachers.length > 0) {
            async function fetchAllTeacherAttendance() {
                setIsLoading(true);
                const now = new Date();
                const month = now.getMonth();
                const year = now.getFullYear();

                const allAttendanceForMonth = await getAllTeacherAttendanceForMonth(month, year);

                const summaryData = teachers.map(teacher => {
                    const teacherRecords = allAttendanceForMonth.filter(rec => rec.teacherId === teacher.id);
                    
                    const todayStr = now.toISOString().split('T')[0];
                    const todayRecord = teacherRecords.find(d => d.date.toISOString().split('T')[0] === todayStr);

                    const presentCount = teacherRecords.filter(d => d.status === 'Present').length;
                    const absentOrLeaveCount = teacherRecords.filter(d => d.status === 'Absent' || d.status === 'Leave').length;

                    return {
                        teacherId: teacher.id,
                        teacherName: teacher.name,
                        todayStatus: todayRecord?.status || 'Not Marked',
                        presentMonth: presentCount,
                        absentMonth: absentOrLeaveCount,
                    }
                });

                setAttendanceData(summaryData);
                setIsLoading(false);
            }
            fetchAllTeacherAttendance();
        } else if (!appLoading) {
            setIsLoading(false);
        }
    }, [appLoading, teachers]);
    
    const getStatusBadgeVariant = (status: TeacherAttendanceSummary['todayStatus']) => {
        switch(status) {
            case 'Present': return 'secondary';
            case 'Absent': return 'destructive';
            case 'Leave': return 'outline';
            default: return 'outline';
        }
    }

    if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                  <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                  </div>
              </CardContent>
          </Card>
      )
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
                            <TableHead className="text-center">Absent/Leave (Month)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceData.map((item, index) => (
                            <TableRow key={`${item.teacherId}-${index}`}>
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
                         {attendanceData.length === 0 && !isLoading && (
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
