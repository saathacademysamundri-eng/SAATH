'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TakeStudentAttendance } from './take-student-attendance';

export default function TeacherStudentAttendancePage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Student Attendance</h1>
                <p className="text-muted-foreground">Mark and review student attendance for your classes.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Take Attendance</CardTitle>
                    <CardDescription>Select a class you teach to view students and mark their attendance for today.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TakeStudentAttendance />
                </CardContent>
            </Card>
        </div>
    );
}
