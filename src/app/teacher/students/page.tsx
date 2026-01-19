
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { Users, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function MyStudentsPage() {
  const { teacher } = useTeacherAuth();
  const { students } = useAppContext();
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

  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> My Students</CardTitle>
            <CardDescription>A list of all students assigned to you.</CardDescription>
             <div className="relative pt-4">
              <Search className="absolute left-2.5 top-6 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search your students by name or roll number..." 
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
                  <TableHead>My Subjects</TableHead>
                  <TableHead>Fee Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? filteredStudents.map(student => (
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
                    <TableCell>
                      <Badge variant={
                          student.feeStatus === 'Paid' ? 'secondary' : 
                          student.feeStatus === 'Overdue' ? 'destructive' :
                          'outline'
                      }>{student.feeStatus}</Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                            No students found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
