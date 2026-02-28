'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { BookCopy, DollarSign, Users, ArrowRight } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Student, Income, ADMIN_UID } from '@/lib/data';
import { MonthlyTeacherAttendance } from './monthly-attendance';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStudentsByTeacher, getIncome, getAllStudents } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TeacherDashboardPage() {
  const { teacher } = useTeacherAuth();
  const { classes } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const isAdminView = teacher?.id === ADMIN_UID;

  useEffect(() => {
    if (!teacher) return;

    async function loadDashboardData() {
      setDataLoading(true);
      try {
        // Fetch active students assigned to teacher for the "My Students" count
        const sData = await getStudentsByTeacher(teacher!.id);
        setStudents(sData);
        
        // Fetch full income and ALL students (including archived/graduated) for disclosure accuracy
        const [iData, allSData] = await Promise.all([
            getIncome(),
            getAllStudents()
        ]);
        setIncome(iData);
        setAllStudents(allSData);
      } catch (e) {
        console.error("Failed to load dashboard data for teacher:", e);
      } finally {
        setDataLoading(false);
      }
    }
    loadDashboardData();
  }, [teacher]);
  
  const totalUnpaidEarnings = useMemo(() => {
    if (!teacher || allStudents.length === 0 || income.length === 0) return 0;

    const unpaidIncome = income.filter(i => !i.paidOutTo || !i.paidOutTo[teacher.id]);
    let grossEarnings = 0;

    unpaidIncome.forEach(inc => {
        // Find student in full list (active, archived, graduated) to ensure full disclosure
        const student = allStudents.find(s => s.id === inc.studentId);
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

    return grossEarnings * 0.7; 
  }, [teacher, allStudents, income]);
  
  const stats = [
    { 
        title: 'My Students', 
        value: students.length, 
        icon: Users,
        link: '/teacher/students'
    },
    { 
        title: "Unpaid Net Earnings", 
        value: dataLoading ? 'Calculating...' : `${totalUnpaidEarnings.toLocaleString('en-US', { maximumFractionDigits: 0 })} PKR`, 
        icon: DollarSign,
        link: '/teacher/earnings'
    },
    { 
        title: 'Subjects Taught', 
        value: teacher?.subjects?.length || 0, 
        icon: BookCopy,
        link: null
    },
  ];

  return (
    <div className="flex flex-col gap-6">
       <Card className="bg-gradient-to-r from-primary/10 to-background border-primary/20">
        <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={teacher?.imageUrl} alt={teacher?.name} />
                <AvatarFallback className="text-3xl">{teacher?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
                <CardTitle className="text-3xl font-bold">Welcome, {teacher?.name}!</CardTitle>
                <CardDescription className="mt-1 text-lg">Here is your academy overview for today.</CardDescription>
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
              {dataLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
              {stat.link && (
                  <Button variant="link" className="px-0 h-auto mt-2 text-xs" asChild>
                      <Link href={stat.link}>
                          View Details <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                  </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="grid grid-cols-1 gap-6">
          {!isAdminView && <MonthlyTeacherAttendance />}
       </div>
    </div>
  );
}
