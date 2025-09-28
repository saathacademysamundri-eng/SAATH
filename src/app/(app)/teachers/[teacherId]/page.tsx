import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { teachers, students as allStudents, Student } from '@/lib/data';
import { notFound } from 'next/navigation';
import { TeacherEarningsClient } from './teacher-earnings-client';
import { useMemo } from 'react';

type StudentEarning = {
  student: Student;
  feeShare: number;
  subjectName: string;
};

export default function TeacherEarningsPage({ params }: { params: { teacherId: string } }) {
  const { teacherId } = params;

  const teacher = useMemo(() => teachers.find(t => t.id === teacherId), [teacherId]);

  const { studentEarnings, totalEarnings, teacherShare, academyShare } = useMemo(() => {
    const studentEarnings: StudentEarning[] = [];
    let totalEarnings = 0;

    if (teacher) {
      allStudents.forEach(student => {
        // Only include earnings from students who have paid
        if (student.feeStatus === 'Paid') {
          student.subjects.forEach(subject => {
            if (subject.teacher_id === teacher.id) {
              studentEarnings.push({
                student,
                feeShare: subject.fee_share,
                subjectName: subject.subject_name
              });
              totalEarnings += subject.fee_share;
            }
          });
        }
      });
    }
    
    const teacherShare = totalEarnings * 0.7;
    const academyShare = totalEarnings * 0.3;

    return { studentEarnings, totalEarnings, teacherShare, academyShare };
  }, [teacherId, teacher]);

  if (!teacher) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-6" id="print-area">
      <TeacherEarningsClient 
        teacherId={teacher.id} 
        teacherName={teacher.name}
        totalEarnings={totalEarnings}
        teacherShare={teacherShare}
        academyShare={academyShare}
        studentEarnings={studentEarnings.map(se => ({ 
          student: { id: se.student.id, name: se.student.name, class: se.student.class }, 
          feeShare: se.feeShare, 
          subjectName: se.subjectName 
        }))}
      />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader className='flex-row items-center gap-4 space-y-0'>
                     <Avatar className="h-16 w-16">
                        <AvatarImage src={teacher.avatar} alt={teacher.name} data-ai-hint="person face" />
                        <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <div className='grid gap-1'>
                        <CardTitle>{teacher.name}</CardTitle>
                        <CardDescription>Teacher ID: {teacher.id}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Gross Earnings</CardTitle>
                    <CardDescription>This is the total amount collected from students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{totalEarnings.toLocaleString()} PKR</p>
                </CardContent>
            </Card>
             <Card className="border-green-500/50">
                <CardHeader>
                    <CardTitle>Teacher's Share (70%)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-green-600">{teacherShare.toLocaleString()} PKR</p>
                </CardContent>
            </Card>
             <Card className="border-blue-500/50">
                <CardHeader>
                    <CardTitle>Academy's Share (30%)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{academyShare.toLocaleString()} PKR</p>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Student Breakdown (Paid Fees Only)</CardTitle>
                    <CardDescription>List of students contributing to the earnings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-right">Fee Share</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentEarnings.length > 0 ? (
                                studentEarnings.map(({ student, feeShare, subjectName }, index) => (
                                    <TableRow key={`${student.id}-${index}`}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="person face" />
                                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{student.name}</div>
                                                    <div className="text-xs text-muted-foreground">{student.id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{student.class}</TableCell>
                                        <TableCell>{subjectName}</TableCell>
                                        <TableCell className="text-right">{feeShare.toLocaleString()} PKR</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No paid fees from assigned students yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
