
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { BookCopy, DollarSign, Users, Search } from 'lucide-react';
import { useMemo } from 'react';
import { Input } from '@/components/ui/input';


export default function TeacherDashboardPage() {
  const { teacher } = useTeacherAuth();
  const { students, income } = useAppContext();

  const teacherStudents = useMemo(() => {
    if (!teacher) return [];
    return students.filter(student => 
      student.subjects.some(sub => sub.teacher_id === teacher.id)
    );
  }, [teacher, students]);

  const totalEarnings = useMemo(() => {
    if (!teacher) return 0;
    // This is a simplified calculation. A more detailed one would be on the earnings page.
    return income
      .filter(i => i.paidOutTo && i.paidOutTo[teacher.id])
      .reduce((acc, curr) => {
          const student = students.find(s => s.id === curr.studentId);
          if (!student) return acc;
          const relevantSubject = student.subjects.find(s => s.teacher_id === teacher.id);
          if (!relevantSubject) return acc;

          // Simplified share calculation
          const share = curr.amount / student.subjects.length;
          return acc + (share * 0.7); // 70% share
      }, 0);
  }, [teacher, income, students]);

  const stats = [
    { title: 'Total Students', value: teacherStudents.length, icon: Users },
    { title: 'Total Earnings', value: `${totalEarnings.toLocaleString()} PKR`, icon: DollarSign },
    { title: 'Subjects Taught', value: teacher?.subjects.length || 0, icon: BookCopy },
  ];

  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader>
            <CardTitle>Student Search</CardTitle>
            <CardDescription>Search for your students by name or roll number.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search students..." 
                className="pl-8"
              />
            </div>
        </CardContent>
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
       <Card>
        <CardHeader>
          <CardTitle>Welcome, {teacher?.name}!</CardTitle>
          <CardDescription>This is your personal dashboard. Here you can get a quick overview of your classes and earnings.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>You can view your assigned students and manage exams from the sidebar.</p>
        </CardContent>
      </Card>
    </div>
  );
}
