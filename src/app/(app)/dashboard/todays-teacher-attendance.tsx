
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/hooks/use-app-context';
import { getAllTeacherAttendanceForMonth } from '@/lib/firebase/firestore';
import { ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type StatusType = 'Present' | 'Absent' | 'Leave' | 'Not Marked';

type TeacherAttendanceSummary = {
  teacherId: string;
  teacherName: string;
  todayStatus: StatusType;
  presentMonth: number;
  absentMonth: number;
};

// FIX: Production-safe status normalization
function normalizeStatus(status: string | undefined): StatusType {
    if (status === "Present" || status === "Absent" || status === "Leave") {
        return status;
    }
    return "Not Marked";
}

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

                const summaryData: TeacherAttendanceSummary[] = teachers.map(teacher => {
                    const teacherRecords = allAttendanceForMonth.filter(rec => rec.teacherId === teacher.id);
                    const todayStr = now.toISOString().split('T')[0];
                    const todayRecord = teacherRecords.find(d => d.date.toISOString().split('T')[0] === todayStr);

                    return {
                        teacherId: teacher.id,
                        teacherName: teacher.name,
                        todayStatus: normalizeStatus(todayRecord?.status),
                        presentMonth: teacherRecords.filter(d => d.status === 'Present').length,
                        absentMonth: teacherRecords.filter(d => d.status !== 'Present').length,
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
    
    const getStatusBadgeVariant = (status: StatusType) => {
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
              <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardHeader>
              <CardContent><div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></CardContent>
          </Card>
      )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 uppercase font-black text-lg">
                    <ClipboardList className="h-5 w-5" /> TEACHER ATTENDANCE
                </CardTitle>
                <CardDescription className="uppercase text-[10px]">TODAY AND MONTHLY OVERVIEW</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="uppercase text-[10px] font-black">TEACHER</TableHead>
                                <TableHead className="text-center uppercase text-[10px] font-black">TODAY</TableHead>
                                <TableHead className="text-center uppercase text-[10px] font-black">P (MTD)</TableHead>
                                <TableHead className="text-center uppercase text-[10px] font-black">A/L (MTD)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendanceData.map((item) => (
                                <TableRow key={item.teacherId}>
                                    <TableCell className="font-bold text-sm uppercase">{item.teacherName}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusBadgeVariant(item.todayStatus)} className="font-bold text-[10px] uppercase">{item.todayStatus}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] shadow-sm">{item.presentMonth}</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-black text-[10px] shadow-sm">{item.absentMonth}</div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
