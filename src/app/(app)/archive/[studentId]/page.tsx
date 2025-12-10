
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getStudent, getTeachers, getIncome } from '@/lib/firebase/firestore';
import { Student, Teacher, Income } from '@/lib/data';
import { BookOpenCheck, ArrowLeft, Wallet } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';

export default function ArchivedStudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [incomeRecords, setIncomeRecords] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    async function fetchData() {
        setLoading(true);
        const [studentData, teachersData, incomeData] = await Promise.all([
            getStudent(studentId),
            getTeachers(),
            getIncome()
        ]);
        
        if (studentData && studentData.status === 'archived') {
            setStudent(studentData);
            setTeachers(teachersData);
            setIncomeRecords(incomeData.filter(i => i.studentId === studentId));
        }
        
        setLoading(false);
    }
    fetchData();
  }, [studentId]);

  const totalPaid = useMemo(() => {
    return incomeRecords.reduce((sum, record) => sum + record.amount, 0);
  }, [incomeRecords]);

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
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                <CardContent><Skeleton className="h-24 w-full" /></CardContent>
            </Card>
             <Card>
                <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                <CardContent><Skeleton className="h-24 w-full" /></CardContent>
            </Card>
        </div>
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
      
    <div className="grid md:grid-cols-2 gap-6">
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
       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet />
              Financial Summary
            </CardTitle>
            <CardDescription>Fee status at the time of archival.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-md">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Total Paid</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{totalPaid.toLocaleString()} PKR</p>
            </div>
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-md">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Outstanding Dues</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{student.totalFee.toLocaleString()} PKR</p>
            </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
