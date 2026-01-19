'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { BookCopy, DollarSign, Users, Search, ClipboardCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { format, getMonth, getYear } from 'date-fns';
import { Student, Income } from '@/lib/data';
import { MonthlyTeacherAttendance } from './monthly-attendance';

type StudentEarning = {
  student: Student;
  earnedShare: number;
  subjectName: string;
  incomeId: string;
  incomeDate: Date;
};

type MonthlyEarnings = {
  month: string; // e.g., "July 2024"
  year: number;
  monthIndex: number;
  totalGross: number;
  teacherShare: number;
  academyShare: number;
  studentEarnings: StudentEarning[];
};


export default function TeacherDashboardPage() {
  const { teacher } = useTeacherAuth();
  const { students, income, allPayouts } = useAppContext();
  
  const teacherStudents = useMemo(() => {
    if (!teacher) return [];
    return students.filter(student => 
      student.subjects.some(sub => sub.teacher_id === teacher.id)
    );
  }, [teacher, students]);

  const totalPaidToTeacher = useMemo(() => {
    if (!teacher || !allPayouts) return 0;
    return allPayouts
      .filter(payout => payout.teacherId === teacher.id)
      .reduce((sum, payout) => sum + payout.amount, 0);
  }, [teacher, allPayouts]);
  
  const stats = [
    { title: 'Total Students', value: teacherStudents.length, icon: Users },
    { title: "Total Earnings Paid", value: `${totalPaidToTeacher.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR`, icon: DollarSign },
    { title: 'Subjects Taught', value: teacher?.subjects.length || 0, icon: BookCopy },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="grid grid-cols-1 gap-6">
          <MonthlyTeacherAttendance />
       </div>
    </div>
  );
}
