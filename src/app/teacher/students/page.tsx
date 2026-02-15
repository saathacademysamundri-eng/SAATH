
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { Users, Search, Loader2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStudentsByTeacher } from '@/lib/firebase/firestore';
import { Student } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyStudentsPage() {
  const { teacher } = useTeacherAuth();
  const { classes } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  useEffect(() => {
    if (!teacher) return;

    async function loadStudents() {
      setLoading(true);
      try {
        // Optimization: Fetch only students taught by this specific teacher
        const sData = await getStudentsByTeacher(teacher!.id);
        setStudents(sData);
      } catch (e) {
        console.error("Failed to load students for teacher:", e);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [teacher]);

  const teacherClasses = useMemo(() => {
    if (!teacher) return [];
    const teacherSubjectNames = new Set(teacher.subjects);
    return classes.filter(c => 
        c.subjects.some(s => teacherSubjectNames.has(s.name))
    );
  }, [teacher, classes]);
  
  const filteredStudents = useMemo(() => {
    const classToFilter = teacherClasses.find(c => c.id === classFilter)?.name;
    
    return students.filter(student => {
        const searchMatch = student.name.toLowerCase().includes(search.toLowerCase()) || 
          student.id.toLowerCase().includes(search.toLowerCase());
        
        const classMatch = classFilter === 'all' || student.class === classToFilter;

        return searchMatch && classMatch;
    });
  }, [students, search, classFilter, teacherClasses]);

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
                {loading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    </TableRow>
                   ))
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <TableRow key={student.id}>
                      <TableCell>
                          <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                  <AvatarImage src={student.imageUrl} alt={student.name} />
                                  <AvatarFallback>{student.name?.charAt(0)}</AvatarFallback>
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
                          {student.subjects && student.subjects
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
                  ))
                ) : (
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
