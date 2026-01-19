
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
  const { students, income } = useAppContext();
  
  const teacherStudents = useMemo(() => {
    if (!teacher) return [];
    return students.filter(student => 
      student.subjects.some(sub => sub.teacher_id === teacher.id)
    );
  }, [teacher, students]);
  
  const monthlyEarnings = useMemo(() => {
    if (!teacher) return [];

    const unpaidIncome = income.filter(i => !i.paidOutTo || !i.paidOutTo[teacher.id]);

    const earningsByMonth: { [key: string]: Omit<MonthlyEarnings, 'month' | 'year' | 'monthIndex'> & { year: number, monthIndex: number } } = {};

    unpaidIncome.forEach(inc => {
        const student = students.find(s => s.id === inc.studentId);
        if (student) {
            const relevantSubjects = student.subjects.filter(sub => sub.teacher_id === teacher.id);
            if (relevantSubjects.length > 0) {
                 relevantSubjects.forEach(subject => {
                    const feeShareForSubject = student.subjects.find(s => s.subject_name === subject.subject_name)?.fee_share || 0;
                    if (student.monthlyFee > 0) {
                      const proportion = feeShareForSubject / student.monthlyFee;
                      const earnedShare = inc.amount * proportion;
                      
                      const monthKey = format(inc.date, 'yyyy-MM');
                      if (!earningsByMonth[monthKey]) {
                          earningsByMonth[monthKey] = {
                              totalGross: 0,
                              teacherShare: 0,
                              academyShare: 0,
                              studentEarnings: [],
                              year: getYear(inc.date),
                              monthIndex: getMonth(inc.date),
                          };
                      }

                      earningsByMonth[monthKey].totalGross += earnedShare;
                      earningsByMonth[monthKey].studentEarnings.push({
                          student: student,
                          earnedShare: earnedShare,
                          subjectName: subject.subject_name,
                          incomeId: inc.id,
                          incomeDate: inc.date,
                      });
                    }
                 });
            }
        }
    });

    return Object.keys(earningsByMonth).map(key => {
      const data = earningsByMonth[key];
      return {
        ...data,
        month: format(new Date(data.year, data.monthIndex), 'MMMM yyyy'),
        teacherShare: data.totalGross * 0.7,
        academyShare: data.totalGross * 0.3,
      };
    }).sort((a,b) => b.year - a.year || b.monthIndex - a.monthIndex);
  }, [teacher, students, income]);


  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonthKey = format(now, 'MMMM yyyy');
    return monthlyEarnings.find(m => m.month === currentMonthKey);
  }, [monthlyEarnings]);
  
  const currentMonthEarningsValue = currentMonthData ? currentMonthData.teacherShare : 0;


  const stats = [
    { title: 'Total Students', value: teacherStudents.length, icon: Users },
    { title: "Current Month's Pending Payout", value: `${currentMonthEarningsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR`, icon: DollarSign },
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
