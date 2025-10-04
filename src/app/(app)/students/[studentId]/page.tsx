
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppContext } from '@/hooks/use-app-context';
import { BookCopy, DollarSign, BookOpenCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  const { students, teachers, loading } = useAppContext();

  const student = useMemo(() => {
    return students.find(s => s.id === studentId);
  }, [students, studentId]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold">Student Not Found</h2>
        <p className="text-muted-foreground">No student found with Roll Number: {studentId}</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const getFeeStatusColor = (status: string) => {
    switch (status) {
        case 'Paid': return 'text-green-500';
        case 'Pending': return 'text-orange-500';
        case 'Partial': return 'text-yellow-500';
        case 'Overdue': return 'text-red-500';
        default: return 'text-muted-foreground';
    }
  }
  
  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || 'N/A';
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center gap-6 space-y-0">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${student.id}`} />
            <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
            <p className="text-muted-foreground">Roll #: {student.id}</p>
            <p className="text-muted-foreground">Class: {student.class}</p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Financials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className='p-4 bg-secondary rounded-lg text-center'>
                    <p className='text-sm text-muted-foreground'>Outstanding Dues</p>
                    <p className='text-3xl font-bold text-destructive'>{student.totalFee.toLocaleString()} PKR</p>
                </div>
                 <div className='p-4 bg-secondary rounded-lg text-center'>
                    <p className='text-sm text-muted-foreground'>Fee Status</p>
                    <p className={`text-3xl font-bold ${getFeeStatusColor(student.feeStatus)}`}>{student.feeStatus}</p>
                </div>
                 <div className='p-4 bg-secondary rounded-lg text-center'>
                    <p className='text-sm text-muted-foreground'>Base Monthly Fee</p>
                    <p className='text-3xl font-bold'>{student.monthlyFee.toLocaleString()} PKR</p>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Perform common tasks for this student.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <Button onClick={() => router.push('/fee-collection')} size="lg" className="justify-start">
                    <DollarSign className="mr-3" />
                    Collect Fee
                </Button>
                <Button onClick={() => router.push(`/student-ledger?search=${student.id}`)} size="lg" variant="outline" className="justify-start">
                    <BookCopy className="mr-3" />
                    View Financial Ledger
                </Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpenCheck />
                  Subjects Enrolled
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
                        {student.subjects.map(subjectInfo => (
                            <TableRow key={subjectInfo.subject_name}>
                                <TableCell className="font-medium">{subjectInfo.subject_name}</TableCell>
                                <TableCell>{getTeacherName(subjectInfo.teacher_id)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
