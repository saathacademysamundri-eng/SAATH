
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Student, type Teacher } from '@/lib/data';
import { getTeacher, getStudents } from '@/lib/firebase/firestore';
import { Phone } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { TeacherEarningsClient } from './teacher-earnings-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

type StudentEarning = {
  student: Student;
  feeShare: number;
  subjectName: string;
};

export default function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [studentEarnings, setStudentEarnings] = useState<StudentEarning[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    
    async function fetchData() {
      setLoading(true);
      const [teacherData, allStudentsData] = await Promise.all([
        getTeacher(teacherId),
        getStudents()
      ]);

      if (!teacherData) {
        setLoading(false);
        return;
      }
      
      setTeacher(teacherData);

      const currentStudentEarnings: StudentEarning[] = [];
      let currentTotalEarnings = 0;

      allStudentsData.forEach(student => {
        student.subjects.forEach(subject => {
            if (subject.teacher_id === teacherData.id && student.feeStatus === 'Paid') {
              currentStudentEarnings.push({
                student,
                feeShare: subject.fee_share,
                subjectName: subject.subject_name
              });
              currentTotalEarnings += subject.fee_share;
            }
        });
      });
      
      setStudentEarnings(currentStudentEarnings);
      setTotalEarnings(currentTotalEarnings);
      setLoading(false);
    }

    fetchData();
  }, [teacherId]);

  if (loading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Teacher not found</h2>
        <p className="text-muted-foreground">The teacher with ID "{teacherId}" could not be found.</p>
      </div>
    );
  }

  const teacherShare = totalEarnings * 0.7;
  const academyShare = totalEarnings * 0.3;

  return (
    <div className="flex flex-col gap-6">
      <TeacherEarningsClient 
        teacherId={teacher.id} 
        teacherName={teacher.name}
      />
      
      <div id="print-area">
        <Card>
            <CardHeader className='flex-row items-center gap-4 space-y-0 pb-4'>
                <Avatar className="h-20 w-20">
                    <AvatarImage src={teacher.avatar} alt={teacher.name} data-ai-hint="person face" />
                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='grid gap-1'>
                    <CardTitle className="text-2xl">{teacher.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> {teacher.phone}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {teacher.subjects.map(subject => (
                            <Badge key={subject} variant="secondary">{subject}</Badge>
                        ))}
                    </div>
                </div>
            </CardHeader>
        </Card>
        
        <Tabs defaultValue="earnings" className="mt-4">
            <TabsList className="print:hidden">
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
            </TabsList>
            <TabsContent value="earnings" className="mt-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gross Earnings (from Paid Fees)</CardTitle>
                                <CardDescription>This is the total amount collected from students taught by {teacher.name}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p data-stat="gross-earnings" className="text-3xl font-bold">{totalEarnings.toLocaleString()} PKR</p>
                            </CardContent>
                        </Card>
                        <Card className="border-green-500/50">
                            <CardHeader>
                                <CardTitle>Teacher's Share (70%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p data-stat="teacher-share" className="text-3xl font-bold text-green-600">{teacherShare.toLocaleString()} PKR</p>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-500/50">
                            <CardHeader>
                                <CardTitle>Academy's Share (30%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p data-stat="academy-share" className="text-3xl font-bold text-blue-600">{academyShare.toLocaleString()} PKR</p>
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
            </TabsContent>
            <TabsContent value="profile">
                <Card>
                    <CardHeader>
                        <CardTitle>Teacher Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>More profile details and settings can be added here.</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
