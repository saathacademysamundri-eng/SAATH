
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getStudent, getTeachers } from '@/lib/firebase/firestore';
import { Student, Teacher } from '@/lib/data';
import { BookOpenCheck, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function ArchivedStudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    async function fetchData() {
        setLoading(true);
        const [studentData, teachersData] = await Promise.all([
            getStudent(studentId),
            getTeachers()
        ]);
        
        if (studentData && studentData.status === 'archived') {
            setStudent(studentData);
            setTeachers(teachersData);
        }
        
        setLoading(false);
    }
    fetchData();
  }, [studentId]);

  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || 'N/A';
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-32" />
            </div>
        </div>
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
            <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold">Archived Student Not Found</h2>
        <p className="text-muted-foreground">No archived student found with Roll Number: {studentId}</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Archived Student Profile</h1>
      </div>
      <Card>
        <CardHeader className="flex-row items-center gap-6 space-y-0">
          <Avatar className="h-24 w-24 border-2 border-destructive">
            <AvatarImage src={student.imageUrl} alt={student.name} />
            <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
            <p className="text-muted-foreground">Roll #: {student.id}</p>
            <p className="text-muted-foreground">Father's Name: {student.fatherName}</p>
            <p className="text-muted-foreground">Last Class: {student.class}</p>
             {student.archivedAt && (
              <p className="text-sm text-destructive font-semibold">
                Archived on: {format(student.archivedAt, 'PPP')}
              </p>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck />
              Subjects at Time of Archival
            </CardTitle>
            <CardDescription>List of subjects and assigned teachers for this student.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {student.subjects.length > 0 ? student.subjects.map(subjectInfo => (
                        <TableRow key={subjectInfo.subject_name}>
                            <TableCell className="font-medium">{subjectInfo.subject_name}</TableCell>
                            <TableCell>{getTeacherName(subjectInfo.teacher_id)}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                No subjects were recorded for this student.
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
