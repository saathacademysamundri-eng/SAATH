'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Exam } from '@/lib/data';
import { getExamsByTeacher, deleteExam } from '@/lib/firebase/firestore';
import { ClipboardPenLine, MoreHorizontal, PlusCircle, Edit, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { CreateExamDialog } from '@/app/(app)/exams/create-exam-dialog';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { EditExamDialog } from '@/app/(app)/exams/edit-exam-dialog';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';

export default function TeacherExamsPage() {
  const { teacher } = useTeacherAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchExams = async () => {
    if (!teacher) return;
    setLoading(true);
    const examsData = await getExamsByTeacher(teacher.id);
    setExams(examsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, [teacher]);

  const handleExamCreated = (examId: string) => {
    fetchExams();
    router.push(`/teacher/exams/${examId}`);
  };
  
  const handleExamUpdated = () => {
    fetchExams();
    setIsEditDialogOpen(false);
  };

  const handleOpenEditDialog = (exam: Exam) => {
    setSelectedExam(exam);
    setIsEditDialogOpen(true);
  };

  const handleDeleteExam = async (examId: string) => {
    const result = await deleteExam(examId);
    if (result.success) {
        toast({ title: 'Exam Deleted', description: 'The exam has been successfully removed.' });
        fetchExams();
    } else {
        toast({ variant: 'destructive', title: 'Deletion Failed', description: result.message });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Exams</h1>
          <p className="text-muted-foreground">Create and manage exams for your classes.</p>
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
          <CardDescription>A list of all exams you have created.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : exams.length > 0 ? (
                  exams.map(exam => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">
                        <div>{exam.name}</div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-1 mt-1">
                          {exam.subjects.map(s => <Badge key={s} variant="outline" className="font-normal">{s}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{format(exam.date, 'PPP')}</TableCell>
                      <TableCell className="hidden md:table-cell">{exam.className}</TableCell>
                      <TableCell>
                          <Badge variant={exam.examType === 'Single Subject' ? 'secondary' : 'default'}>
                              {exam.examType}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/teacher/exams/${exam.id}`)}>
                                  <ClipboardPenLine className="mr-2 h-4 w-4" />
                                  Enter Marks
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenEditDialog(exam)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the exam "{exam.name}" and all of its associated results. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteExam(exam.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      You have not created any exams yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
       {selectedExam && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <EditExamDialog
            exam={selectedExam}
            onExamUpdated={handleExamUpdated}
          />
        </Dialog>
      )}
    </div>
  );
}
