
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MyStudentsPage() {
  const { teacher } = useTeacherAuth();
  const { students, classes } = useAppContext();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const router = useRouter();

  const teacherClasses = useMemo(() => {
    if (!teacher) return [];
    const teacherSubjectNames = new Set(teacher.subjects);
    return classes.filter(c => 
        c.subjects.some(s => teacherSubjectNames.has(s.name))
    );
  }, [teacher, classes]);

  const teacherStudents = useMemo(() => {
    if (!teacher) return [];
    return students.filter(student => 
      student.subjects.some(sub => sub.teacher_id === teacher.id)
    );
  }, [teacher, students]);
  
  const filteredStudents = useMemo(() => {
    const classToFilter = teacherClasses.find(c => c.id === classFilter)?.name;
    
    return teacherStudents.filter(student => {
        const searchMatch = student.name.toLowerCase().includes(search.toLowerCase()) || 
          student.id.toLowerCase().includes(search.toLowerCase());
        
        const classMatch = classFilter === 'all' || student.class === classToFilter;

        return searchMatch && classMatch;
    });
  }, [teacherStudents, search, classFilter, teacherClasses]);

  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> My Students</CardTitle>
            <CardDescription>A list of all students assigned to you.</CardDescription>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search your students by name or roll number..." 
                      className="pl-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All My Classes</SelectItem>
                        {teacherClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden sm:table-cell">Class</TableHead>
                  <TableHead className="hidden md:table-cell">My Subjects</TableHead>
                  <TableHead>Fee Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? filteredStudents.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={student.imageUrl} alt={student.name} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-xs text-muted-foreground">{student.id}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{student.class}</TableCell>
                    <TableCell className="hidden md:table-cell">
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
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                            No students found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
