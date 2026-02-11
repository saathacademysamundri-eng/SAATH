'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { BookCopy, DollarSign, Users, Search, ClipboardCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { format, getMonth, getYear, startOfMonth } from 'date-fns';
import { Student, Income } from '@/lib/data';
import { MonthlyTeacherAttendance } from './monthly-attendance';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function TeacherDashboardPage() {
  const { teacher } = useTeacherAuth();
  const { students, income, allPayouts } = useAppContext();
  
  const teacherStudents = useMemo(() => {
    if (!teacher) return [];
    return students.filter(student => 
      student.subjects.some(sub => sub.teacher_id === teacher.id)
    );
  }, [teacher, students]);

  const totalUnpaidEarnings = useMemo(() => {
    if (!teacher) return 0;

    const teacherPayouts = allPayouts.filter(p => p.teacherId === teacher.id);
    const isNewTeacher = teacherPayouts.length === 0;

    let unpaidIncome = income.filter(i => !i.paidOutTo || !i.paidOutTo[teacher.id]);

    // Strictly prevent new teachers from earning from past months
    if (isNewTeacher) {
        const startOfCurrentMonth = startOfMonth(new Date());
        unpaidIncome = unpaidIncome.filter(i => i.date >= startOfCurrentMonth);
    }

    let grossEarnings = 0;

    unpaidIncome.forEach(inc => {
        const student = students.find(s => s.id === inc.studentId);
        if (student) {
            const relevantSubjects = student.subjects.filter(sub => sub.teacher_id === teacher.id);
            relevantSubjects.forEach(subject => {
                const feeShareForSubject = subject.fee_share || 0;
                if (student.monthlyFee > 0) {
                    const proportion = feeShareForSubject / student.monthlyFee;
                    
                    let earnableAmount = inc.amount;
                    
                    // Rule: A new teacher should not earn from historical student debt
                    if (isNewTeacher) {
                        const balanceBeforeThisPayment = student.totalFee + inc.amount;
                        const oldDebt = balanceBeforeThisPayment - student.monthlyFee;

                        if (oldDebt > 0) {
                            earnableAmount = Math.max(0, inc.amount - oldDebt);
                        }
                    }

                    const earnedShare = earnableAmount * proportion;
                    grossEarnings += earnedShare;
                }
            });
        }
    });

    return grossEarnings * 0.7; // Teacher's share is 70%
  }, [teacher, students, income, allPayouts]);
  
  const stats = [
    { title: 'Total Students', value: teacherStudents.length, icon: Users },
    { title: "Current Net Earnings (70%)", value: `${totalUnpaidEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR`, icon: DollarSign },
    { title: 'Subjects Taught', value: teacher?.subjects.length || 0, icon: BookCopy },
  ];

  return (
    <div className="flex flex-col gap-6">
       <Card className="bg-gradient-to-r from-primary/10 to-background border-primary/20">
        <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={teacher?.imageUrl} alt={teacher?.name} />
                <AvatarFallback className="text-3xl">{teacher?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
                <CardTitle className="text-3xl font-bold">Welcome, {teacher?.name}!</CardTitle>
                <CardDescription className="mt-1 text-lg">Here is an overview of your dashboard.</CardDescription>
            </div>
        </CardHeader>
       </Card>
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
