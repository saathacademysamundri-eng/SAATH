
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TakeTeacherAttendance } from './take-teacher-attendance';
import { TeacherAttendanceReport } from './teacher-attendance-report';
import { TeacherMonthlySheet } from './teacher-monthly-sheet';

export default function TeacherAttendancePage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Teacher Attendance</h1>
                <p className="text-muted-foreground">Mark and review teacher attendance records.</p>
            </div>
            <Tabs defaultValue="take-attendance" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-2xl">
                    <TabsTrigger value="take-attendance">Take Daily Attendance</TabsTrigger>
                    <TabsTrigger value="teacher-report">Teacher Report</TabsTrigger>
                    <TabsTrigger value="monthly-sheet">Monthly Sheet</TabsTrigger>
                </TabsList>
                <TabsContent value="take-attendance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Take Teacher Attendance</CardTitle>
                            <CardDescription>Mark the attendance for all teachers for today's date.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TakeTeacherAttendance />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="teacher-report">
                    <Card>
                        <CardHeader>
                            <CardTitle>Teacher Attendance Report</CardTitle>
                            <CardDescription>Select a teacher and month to view their attendance history.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeacherAttendanceReport />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="monthly-sheet">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Attendance Sheet</CardTitle>
                            <CardDescription>View the complete monthly attendance sheet for all teachers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeacherMonthlySheet />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
