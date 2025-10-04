
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TakeAttendance } from './take-attendance';
import { AttendanceReport } from './attendance-report';
import { ClassAttendanceReport } from './class-attendance-report';

export default function AttendancePage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
                <p className="text-muted-foreground">Mark and review student attendance.</p>
            </div>
            <Tabs defaultValue="take-attendance" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-2xl">
                    <TabsTrigger value="take-attendance">Take Daily Attendance</TabsTrigger>
                    <TabsTrigger value="student-report">Student Report</TabsTrigger>
                    <TabsTrigger value="class-report">Class Report</TabsTrigger>
                </TabsList>
                <TabsContent value="take-attendance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Take Attendance</CardTitle>
                            <CardDescription>Select a class to view students and mark their attendance for today.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TakeAttendance />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="student-report">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Attendance Report</CardTitle>
                            <CardDescription>Search for a student to view their monthly attendance history.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttendanceReport />
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="class-report">
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Attendance Report</CardTitle>
                            <CardDescription>Select a class and month to view the full attendance sheet.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ClassAttendanceReport />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
