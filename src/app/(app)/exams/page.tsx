
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Exam } from '@/lib/data';
import { deleteExam, getExams } from '@/lib/firebase/firestore';
import { ClipboardPenLine, MoreHorizontal, PlusCircle, Trash, Edit, Calendar as CalendarIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { CreateExamDialog } from './create-exam-dialog';
import { format, addDays } from 'date-fns';
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { EditExamDialog } from './edit-exam-dialog';
import { useAppContext } from '@/hooks/use-app-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { classes, loading: appLoading } = useAppContext();

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter state
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

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
    fetchExams();
    router.push(`/exams/${examId}`);
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

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
        const classMatch = !selectedClass || exam.className === selectedClass;
        
        let dateMatch = true;
        if (dateRange?.from) {
            const fromDate = dateRange.from;
            const toDate = dateRange.to ? addDays(dateRange.to, 1) : addDays(fromDate, 1);
            dateMatch = exam.date >= fromDate && exam.date < toDate;
        }

        return classMatch && dateMatch;
    });
  }, [exams, selectedClass, dateRange]);

  const clearFilters = () => {
    setSelectedClass(null);
    setDateRange(undefined);
  }

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
          <CardDescription>A list of all created exams. Use the filters below to narrow down the results.</CardDescription>
           <div className="flex flex-wrap items-center gap-4 pt-4">
            <Select onValueChange={(v) => setSelectedClass(v === 'all' ? null : v)} value={selectedClass || 'all'}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by class..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Filter by date...</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            {(selectedClass || dateRange) && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" /> Clear Filters
              </Button>
            )}
        </div>
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
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredExams.length > 0 ? (
                filteredExams.map(exam => (
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
                       <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/exams/${exam.id}`)}>
                                <ClipboardPenLine className="mr-2 h-4 w-4" />
                                Enter Marks
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenEditDialog(exam)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive">
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
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No exams found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
