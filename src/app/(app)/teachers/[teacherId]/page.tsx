import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { teachers, students as allStudents, Student } from '@/lib/data';
import { notFound } from 'next/navigation';
import { TeacherEarningsClient } from './teacher-earnings-client';

type StudentEarning = {
  student: Student;
  feeShare: number;
  subjectName: string;
};

export default function TeacherEarningsPage({ params }: { params: { teacherId: string } }) {
  const { teacherId } = params;

  const teacher = teachers.find(t => t.id === teacherId);

  if (!teacher) {
    return notFound();
  }

  const studentEarnings: StudentEarning[] = [];
  let totalEarnings = 0;

  allStudents.forEach(student => {
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
  });
  
  const teacherShare = totalEarnings * 0.7;
  const academyShare = totalEarnings * 0.3;

  return (
    <div className="flex flex-col gap-6" id="print-area">
      <TeacherEarningsClient teacherName={teacher.name} />
      
      <div className="text-center hidden print:block mb-6">
        <h1 className="text-2xl font-bold">{teacher.name} - Earnings Report</h1>
        <p className="text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
            <Card className="print:shadow-none print:border-none">
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
            <Card className="print:shadow-none print:border">
                <CardHeader>
                    <CardTitle>Gross Earnings</CardTitle>
                    <CardDescription>This is the total amount collected from students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{totalEarnings.toLocaleString()} PKR</p>
                </CardContent>
            </Card>
             <Card className="border-green-500/50 print:border-green-500/50">
                <CardHeader>
                    <CardTitle>Teacher's Share (70%)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-green-600">{teacherShare.toLocaleString()} PKR</p>
                </CardContent>
            </Card>
             <Card className="border-blue-500/50 print:border-blue-500/50">
                <CardHeader>
                    <CardTitle>Academy's Share (30%)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{academyShare.toLocaleString()} PKR</p>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="print:shadow-none print:border-none">
                <CardHeader>
                    <CardTitle>Student Breakdown</CardTitle>
                    <CardDescription>List of students contributing to the earnings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
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
                                                <Avatar className="h-8 w-8 print:hidden">
                                                    <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="person face" />
                                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{student.name}</div>
                                                    <div className="text-xs text-muted-foreground">{student.id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{subjectName}</TableCell>
                                        <TableCell className="text-right">{feeShare.toLocaleString()} PKR</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No students assigned to this teacher yet.
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
