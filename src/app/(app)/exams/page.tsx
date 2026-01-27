

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Exam } from '@/lib/data';
import { deleteExam, getExams, updateExamStatus } from '@/lib/firebase/firestore';
import { ClipboardPenLine, MoreHorizontal, PlusCircle, Trash, Edit, Calendar as CalendarIcon, X, File, Printer, Check, Ban, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { EditExamDialog } from './edit-exam-dialog';
import { useAppContext } from '@/hooks/use-app-context';
import { useSettings } from '@/hooks/use-settings';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlankSheetDialog } from './blank-sheet-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MasterSheetView } from './master-sheet-view';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { classes, loading: appLoading } = useAppContext();
  const { settings } = useSettings();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBlankSheetDialogOpen, setIsBlankSheetDialogOpen] = useState(false);

  // Filter state for Approved Exams
  const [approvedClassFilter, setApprovedClassFilter] = useState<string | null>(null);
  const [approvedDateRange, setApprovedDateRange] = useState<DateRange | undefined>(undefined);
  const [approvedSessionFilter, setApprovedSessionFilter] = useState('');

  // Filter state for Master Sheets
  const [masterSheetClassFilter, setMasterSheetClassFilter] = useState<string | null>(null);
  const [masterSheetDateRange, setMasterSheetDateRange] = useState<DateRange | undefined>(undefined);
  const [masterSheetSessionFilter, setMasterSheetSessionFilter] = useState('');

  useEffect(() => {
    if (settings.academicSession) {
      setApprovedSessionFilter(settings.academicSession);
      setMasterSheetSessionFilter(settings.academicSession);
    }
  }, [settings.academicSession]);

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
    setIsCreateDialogOpen(false);
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
  
  const handlePrintResults = (examId: string) => {
      const printUrl = `/exams/${examId}?print=true`;
      window.open(printUrl, '_blank');
  }

  const handleApprove = async (examId: string) => {
    const result = await updateExamStatus(examId, 'approved');
    if (result.success) {
        toast({ title: 'Exam Approved', description: 'The exam is now active.' });
        fetchExams();
    } else {
        toast({ variant: 'destructive', title: 'Approval Failed', description: result.message });
    }
  };
  
  const handleReject = async (exam: Exam) => {
    const result = await updateExamStatus(exam.id, 'rejected');
    if (result.success) {
        toast({ title: 'Exam Rejected', description: `The exam request from ${exam.teacherName} has been rejected.`});
        fetchExams();
    } else {
        toast({ variant: 'destructive', title: 'Rejection Failed', description: result.message });
    }
  }

  const academicSessions = useMemo(() => {
    const sessions = new Set(exams.map(exam => exam.academicSession).filter(Boolean));
    if (settings.academicSession) {
        sessions.add(settings.academicSession);
    }
    return Array.from(sessions).sort((a, b) => b.localeCompare(a));
  }, [exams, settings.academicSession]);

  const approvedExams = useMemo(() => {
    return exams.filter(exam => {
        const classMatch = !approvedClassFilter || exam.className === approvedClassFilter;
        let dateMatch = true;
        if (approvedDateRange?.from) {
            const fromDate = approvedDateRange.from;
            const toDate = approvedDateRange.to ? addDays(approvedDateRange.to, 1) : addDays(fromDate, 1);
            dateMatch = exam.date >= fromDate && exam.date < toDate;
        }
        const sessionMatch = !approvedSessionFilter || exam.academicSession === approvedSessionFilter;
        return classMatch && dateMatch && sessionMatch && exam.status === 'approved';
    });
  }, [exams, approvedClassFilter, approvedDateRange, approvedSessionFilter]);

  const pendingExams = useMemo(() => {
    return exams.filter(exam => exam.status === 'pending');
  }, [exams]);

  const masterSheetGroups = useMemo(() => {
    const filteredForGrouping = exams.filter(exam => {
        const classMatch = !masterSheetClassFilter || exam.className === masterSheetClassFilter;
        let dateMatch = true;
        if (masterSheetDateRange?.from) {
            const fromDate = masterSheetDateRange.from;
            const toDate = masterSheetDateRange.to ? addDays(masterSheetDateRange.to, 1) : addDays(fromDate, 1);
            dateMatch = exam.date >= fromDate && exam.date < toDate;
        }
        const sessionMatch = !masterSheetSessionFilter || exam.academicSession === masterSheetSessionFilter;
        return classMatch && dateMatch && sessionMatch && exam.status === 'approved';
    });

    const groups: { [key: string]: Exam[] } = {};
    filteredForGrouping.forEach(exam => {
        const groupKey = `${exam.name} - ${exam.className} (${exam.academicSession})`;
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(exam);
    });

    const result: { [key: string]: Exam[] } = {};
    Object.keys(groups).forEach(key => {
        if (groups[key].length > 1) result[key] = groups[key];
    });
    
    return result;
  }, [exams, masterSheetClassFilter, masterSheetDateRange, masterSheetSessionFilter]);

  const clearApprovedFilters = () => {
    setApprovedClassFilter(null);
    setApprovedDateRange(undefined);
    setApprovedSessionFilter(settings.academicSession || '');
  }
  
  const clearMasterSheetFilters = () => {
    setMasterSheetClassFilter(null);
    setMasterSheetDateRange(undefined);
    setMasterSheetSessionFilter(settings.academicSession || '');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Create and manage academic exams and requests.</p>
        </div>
        <div className="flex gap-2">
            <Dialog open={isBlankSheetDialogOpen} onOpenChange={setIsBlankSheetDialogOpen}>
              <DialogTrigger asChild>
                  <Button variant="outline">
                      <File className="mr-2" />
                      Print Blank Sheet
                  </Button>
              </DialogTrigger>
              <BlankSheetDialog />
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2" />
                Create Exam
              </Button>
            </DialogTrigger>
            <CreateExamDialog onExamCreated={handleExamCreated} />
          </Dialog>
        </div>
      </div>

    <Tabs defaultValue={tabFromUrl === 'pending' ? 'pending' : 'approved'}>
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="approved">Exam History</TabsTrigger>
            <TabsTrigger value="master-sheets">Master Sheets</TabsTrigger>
            <TabsTrigger value="pending">
                Pending Approvals
                {pendingExams.length > 0 && <Badge className="ml-2">{pendingExams.length}</Badge>}
            </TabsTrigger>
        </TabsList>
        <TabsContent value="approved">
            <Card>
                <CardHeader>
                <CardTitle>Approved Exams</CardTitle>
                <CardDescription>A list of all active exams. Use the filters below to narrow down the results.</CardDescription>
                <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Select onValueChange={(v) => setApprovedClassFilter(v === 'all' ? null : v)} value={approvedClassFilter || 'all'}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by class..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={setApprovedSessionFilter} value={approvedSessionFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by session..." />
                        </SelectTrigger>
                        <SelectContent>
                            {academicSessions.map(session => <SelectItem key={session} value={session}>{session}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn("w-[300px] justify-start text-left font-normal", !approvedDateRange && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {approvedDateRange?.from ? (approvedDateRange.to ? (<>{format(approvedDateRange.from, "LLL dd, y")} - {format(approvedDateRange.to, "LLL dd, y")}</>) : (format(approvedDateRange.from, "LLL dd, y"))) : (<span>Filter by date...</span>)}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar initialFocus mode="range" defaultMonth={approvedDateRange?.from} selected={approvedDateRange} onSelect={setApprovedDateRange} numberOfMonths={2}/>
                        </PopoverContent>
                    </Popover>
                    {(approvedClassFilter || approvedDateRange || approvedSessionFilter !== settings.academicSession) && (
                    <Button variant="ghost" onClick={clearApprovedFilters}><X className="mr-2 h-4 w-4" /> Clear Filters</Button>
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
                        <TableHead>Teacher</TableHead>
                        <TableHead>Submission Deadline</TableHead>
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
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                        ))
                    ) : approvedExams.length > 0 ? (
                        approvedExams.map(exam => (
                        <TableRow key={exam.id}>
                            <TableCell>{format(exam.date, 'PPP')}</TableCell>
                            <TableCell className="font-medium">
                                <div>{exam.name}</div>
                                <div className="text-xs text-muted-foreground flex flex-wrap gap-1 mt-1">
                                    {exam.subjects.map(s => <Badge key={s} variant="outline" className="font-normal">{s}</Badge>)}
                                </div>
                            </TableCell>
                            <TableCell>{exam.className}</TableCell>
                            <TableCell>{exam.teacherName}</TableCell>
                             <TableCell>
                                {exam.submissionDeadline ? (
                                    <Badge variant={new Date(exam.submissionDeadline) < new Date() ? "destructive" : "outline"} className="font-medium">
                                        {format(exam.submissionDeadline, 'PPP')}
                                    </Badge>
                                ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                            <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => router.push(`/exams/${exam.id}`)}><ClipboardPenLine className="mr-2 h-4 w-4" />Enter Marks</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleOpenEditDialog(exam)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePrintResults(exam.id)}><Printer className="mr-2 h-4 w-4" />Print Results</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><Trash className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete the exam "{exam.name}" and all of its associated results. This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteExam(exam.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No exams found matching your criteria.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="master-sheets">
            <Card>
                <CardHeader>
                    <CardTitle>Master Sheets</CardTitle>
                    <CardDescription>Consolidated reports for exams sharing the same name, class, and session.</CardDescription>
                     <div className="flex flex-wrap items-center gap-4 pt-4">
                        <Select onValueChange={(v) => setMasterSheetClassFilter(v === 'all' ? null : v)} value={masterSheetClassFilter || 'all'}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by class..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classes</SelectItem>
                                {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setMasterSheetSessionFilter} value={masterSheetSessionFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by session..." />
                            </SelectTrigger>
                            <SelectContent>
                                {academicSessions.map(session => <SelectItem key={session} value={session}>{session}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="master-date"
                                    variant={"outline"}
                                    className={cn("w-[300px] justify-start text-left font-normal", !masterSheetDateRange && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {masterSheetDateRange?.from ? (masterSheetDateRange.to ? (<>{format(masterSheetDateRange.from, "LLL dd, y")} - {format(masterSheetDateRange.to, "LLL dd, y")}</>) : (format(masterSheetDateRange.from, "LLL dd, y"))) : (<span>Filter by date...</span>)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar initialFocus mode="range" defaultMonth={masterSheetDateRange?.from} selected={masterSheetDateRange} onSelect={setMasterSheetDateRange} numberOfMonths={2}/>
                            </PopoverContent>
                        </Popover>
                        {(masterSheetClassFilter || masterSheetDateRange || masterSheetSessionFilter !== settings.academicSession) && (
                        <Button variant="ghost" onClick={clearMasterSheetFilters}><X className="mr-2 h-4 w-4" /> Clear Filters</Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {Object.keys(masterSheetGroups).length > 0 ? (
                         <Accordion type="single" collapsible className="w-full">
                            {Object.entries(masterSheetGroups).map(([key, groupExams]) => (
                                <AccordionItem value={key} key={key}>
                                    <AccordionTrigger className="text-lg">
                                        {key}
                                        <Badge variant="secondary" className="ml-4">{groupExams.length} Exams</Badge>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <MasterSheetView exams={groupExams} groupTitle={key} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                         </Accordion>
                    ) : (
                        <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                            No master sheets available for the selected filters.
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="pending">
             <Card>
                <CardHeader>
                    <CardTitle>Pending Exam Approvals</CardTitle>
                    <CardDescription>Review and approve or reject exam requests from teachers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Exam Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Requested By</TableHead>
                                <TableHead>Subjects</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                                </TableRow>
                                ))
                            ) : pendingExams.length > 0 ? (
                                pendingExams.map(exam => (
                                    <TableRow key={exam.id}>
                                        <TableCell>{format(exam.date, 'PPP')}</TableCell>
                                        <TableCell className="font-medium">{exam.name}</TableCell>
                                        <TableCell>{exam.className}</TableCell>
                                        <TableCell>{exam.teacherName}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {exam.subjects.map(s => <Badge key={s} variant="outline" className="font-normal">{s}</Badge>)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="destructive">
                                                        <Ban className="mr-2 h-4 w-4"/>
                                                        Reject
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Reject Exam Request?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will mark the exam request "{exam.name}" as rejected. The teacher will be notified.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleReject(exam)} className="bg-destructive hover:bg-destructive/90">
                                                        Confirm Rejection
                                                    </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <Button size="sm" onClick={() => handleApprove(exam.id)}>
                                                <Check className="mr-2 h-4 w-4"/>
                                                Approve
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No pending exam requests.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
      
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
