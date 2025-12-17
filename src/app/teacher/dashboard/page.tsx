'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { BookCopy, DollarSign, Users, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function TeacherDashboardPage() {
  const { teacher } = useTeacherAuth();
  const { students, income } = useAppContext();
  const [search, setSearch] = useState('');
  const router = useRouter();

  const teacherStudents = useMemo(() => {
    if (!teacher) return [];
    return students.filter(student => 
      student.subjects.some(sub => sub.teacher_id === teacher.id)
    );
  }, [teacher, students]);
  
  const filteredStudents = useMemo(() => {
    return teacherStudents.filter(student =>
      student.name.toLowerCase().includes(search.toLowerCase()) || 
      student.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [teacherStudents, search]);

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
    { title: 'Total Earnings (All Time)', value: `${totalEarnings.toLocaleString()} PKR`, icon: DollarSign },
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

       <Card>
        <CardHeader>
            <CardTitle>My Students</CardTitle>
            <CardDescription>Search for your students by name or roll number.</CardDescription>
             <div className="relative pt-4">
              <Search className="absolute left-2.5 top-6 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search students..." 
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subjects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map(student => (
                  <TableRow key={student.id} className="cursor-pointer" onClick={() => router.push(`/students/${student.id}`)}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {student.subjects
                          .filter(sub => sub.teacher_id === teacher?.id)
                          .map(sub => <Badge key={sub.subject_name} variant="outline">{sub.subject_name}</Badge>)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
