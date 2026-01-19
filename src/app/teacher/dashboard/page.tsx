'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { BookCopy, DollarSign, Users, Search, ClipboardCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { format, getMonth, getYear } from 'date-fns';
import { Student, Income } from '@/lib/data';
import { MonthlyTeacherAttendance } from './monthly-attendance';

export default function TeacherDashboardPage() {
  const { teacher } = useTeacherAuth();
  const { students, income } = useAppContext();
  
  const teacherStudents = useMemo(() => {
    if (!teacher) return [];
    return students.filter(student => 
      student.subjects.some(sub => sub.teacher_id === teacher.id)
    );
  }, [teacher, students]);

  const currentMonthUnpaidEarnings = useMemo(() => {
    if (!teacher) return 0;
    
    const currentMonth = getMonth(new Date());
    const currentYear = getYear(new Date());

    const unpaidIncome = income.filter(i => !i.paidOutTo || !i.paidOutTo[teacher.id]);

    let grossEarningsThisMonth = 0;

    unpaidIncome.forEach(inc => {
        const incDate = new Date(inc.date);
        const incMonth = getMonth(incDate);
        const incYear = getYear(incDate);

        if (incMonth === currentMonth && incYear === currentYear) {
            const student = students.find(s => s.id === inc.studentId);
            if (student) {
                const relevantSubjects = student.subjects.filter(sub => sub.teacher_id === teacher.id);
                if (relevantSubjects.length > 0) {
                     relevantSubjects.forEach(subject => {
                        const feeShareForSubject = student.subjects.find(s => s.subject_name === subject.subject_name)?.fee_share || 0;
                        if (student.monthlyFee > 0) {
                          const proportion = feeShareForSubject / student.monthlyFee;
                          const earnedShare = inc.amount * proportion;
                          grossEarningsThisMonth += earnedShare;
                        }
                     });
                }
            }
        }
    });

    return grossEarningsThisMonth * 0.7; // Teacher's share is 70%

  }, [teacher, students, income]);
  
  const stats = [
    { title: 'Total Students', value: teacherStudents.length, icon: Users },
    { title: "Current Month's Earnings", value: `${currentMonthUnpaidEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR`, icon: DollarSign },
    { title: 'Subjects Taught', value: teacher?.subjects.length || 0, icon: BookCopy },
  ];

  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {teacher?.name}!</h1>
        <p className="text-muted-foreground">
          Here is an overview of your dashboard.
        </p>
      </div>
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
