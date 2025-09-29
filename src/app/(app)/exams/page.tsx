
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Exam } from '@/lib/data';
import { getExams } from '@/lib/firebase/firestore';
import { ClipboardPenLine, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CreateExamDialog } from './create-exam-dialog';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchExams = async () => {
    setLoading(true);
    const examsData = await getExams();
    setExams(examsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleExamCreated = (examId: string) => {
    router.push(`/exams/${examId}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Create and manage academic exams.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <CreateExamDialog onExamCreated={handleExamCreated} />
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam History</CardTitle>
          <CardDescription>A list of all created exams.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Exam Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : exams.length > 0 ? (
                exams.map(exam => (
                  <TableRow key={exam.id}>
                    <TableCell>{format(exam.date, 'PPP')}</TableCell>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>{exam.className}</TableCell>
                    <TableCell>
                        <Badge variant={exam.examType === 'Single Subject' ? 'secondary' : 'default'}>
                            {exam.examType}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                            {exam.subjects.map(s => <Badge key={s} variant="outline" className="font-normal">{s}</Badge>)}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/exams/${exam.id}`)}>
                        <ClipboardPenLine className="mr-2 h-4 w-4" />
                        Enter Marks
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No exams have been created yet.
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
