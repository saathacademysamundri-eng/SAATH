
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { BookCopy, DollarSign, Users, Search, ClipboardCheck, Loader2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { Student, Income } from '@/lib/data';
import { MonthlyTeacherAttendance } from './monthly-attendance';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStudentsByTeacher, getRecentIncome } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeacherDashboardPage() {
  const { teacher } = useTeacherAuth();
  const { classes } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!teacher) return;

    async function loadDashboardData() {
      setDataLoading(true);
      try {
        // Optimization: Fetch only students taught by this teacher
        // and only the last few months of income records
        const [sData, iData] = await Promise.all([
            getStudentsByTeacher(teacher!.id),
            getRecentIncome(1000) // Fetches enough recent income for current summaries
        ]);
        setStudents(sData);
        setIncome(iData);
      } catch (e) {
        console.error("Failed to load dashboard data for teacher:", e);
      } finally {
        setDataLoading(false);
      }
    }
    loadDashboardData();
  }, [teacher]);
  
  const totalUnpaidEarnings = useMemo(() => {
    if (!teacher || students.length === 0 || income.length === 0) return 0;

    // Filter for income that has NOT been paid out to THIS teacher
    const unpaidIncome = income.filter(i => !i.paidOutTo || !i.paidOutTo[teacher.id]);

    let grossEarnings = 0;

    unpaidIncome.forEach(inc => {
        const student = students.find(s => s.id === inc.studentId);
        if (student && student.subjects) {
            const relevantSubjects = student.subjects.filter(sub => sub.teacher_id === teacher.id);
            relevantSubjects.forEach(subject => {
                const feeShareForSubject = subject.fee_share || 0;
                if (student.monthlyFee > 0) {
                    const proportion = feeShareForSubject / student.monthlyFee;
                    const earnedShare = inc.amount * proportion;
                    grossEarnings += earnedShare;
                }
            });
        }
    });

    return grossEarnings * 0.7; // Teacher's share is 70%
  }, [teacher, students, income]);
  
  const stats = [
    { title: 'My Students', value: students.length, icon: Users },
    { title: "Current Net Earnings (70%)", value: dataLoading ? 'Calculating...' : `${totalUnpaidEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR`, icon: DollarSign },
    { title: 'Subjects Taught', value: teacher?.subjects?.length || 0, icon: BookCopy },
  ];

  return (
    <div className="flex flex-col gap-6">
       <Card className="bg-gradient-to-r from-primary/10 to-background border-primary/20">
        <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={teacher?.imageUrl} alt={teacher?.name} />
                <AvatarFallback className="text-3xl">{teacher?.name?.charAt(0)}</AvatarFallback>
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
              {dataLoading && stat.title.includes('Earnings') ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
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
