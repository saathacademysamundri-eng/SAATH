
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { MoreHorizontal, PlusCircle, Search, Trash, Edit, Archive, GraduationCap, ChevronRight, Printer, ChevronsRight, ChevronLeft, X } from 'lucide-react';
import { AddStudentForm } from './add-student-form';
import { Dialog, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppContext } from '@/hooks/use-app-context';
import { useRouter } from 'next/navigation';
import { Student } from '@/lib/data';
import { EditStudentForm } from './edit-student-form';
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
import { updateStudentStatus, getStudentsPaged } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkPromoteDialog } from './bulk-promote-dialog';
import { BulkGraduateDialog } from './bulk-graduate-dialog';
import { useSettings } from '@/hooks/use-settings';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

export default function StudentsPage() {
  const { classes, loading: contextLoading } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const router = useRouter();
  const { toast } = useToast();
  const { settings } = useSettings();

  const [lastDocs, setLastDocs] = useState<(QueryDocumentSnapshot | null)[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [isBulkPromoteOpen, setIsBulkPromoteOpen] = useState(false);
  const [isBulkGraduateOpen, setIsBulkGraduateOpen] = useState(false);

  const [dialogState, setDialogState] = useState<{
    isAddOpen: boolean;
    isEditOpen: boolean;
    isArchiveOpen: boolean;
    isGraduateOpen: boolean;
    isPromoteOpen: boolean;
    selectedStudent: Student | null;
  }>({
    isAddOpen: false,
    isEditOpen: false,
    isArchiveOpen: false,
    isGraduateOpen: false,
    isPromoteOpen: false,
    selectedStudent: null,
  });

  const fetchPage = useCallback(async (pageIndex: number, isInitial = false) => {
    setLoading(true);
    try {
      const lastDoc = pageIndex > 0 ? lastDocs[pageIndex - 1] : undefined;
      const result = await getStudentsPaged(20, lastDoc, classFilter, search);
      
      setStudents(result.students);
      setHasMore(classFilter === 'all' && result.students.length === 20 && !search); 
      
      if (isInitial) {
        setLastDocs([result.lastDoc]);
        setCurrentPage(0);
      } else if (pageIndex >= lastDocs.length) {
        setLastDocs(prev => [...prev, result.lastDoc]);
      }
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load students.' });
    } finally {
      setLoading(false);
    }
  }, [classFilter, search, lastDocs, toast]);

  useEffect(() => {
    fetchPage(0, true);
    setSelectedStudents([]); 
  }, [classFilter, search]);

  const handleNextPage = () => {
    if (hasMore) {
      const nextPageIndex = currentPage + 1;
      fetchPage(nextPageIndex);
      setCurrentPage(nextPageIndex);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevPageIndex = currentPage - 1;
      fetchPage(prevPageIndex);
      setCurrentPage(prevPageIndex);
    }
  };

  const handleEditClick = (student: Student) => {
    setDialogState({ ...dialogState, isEditOpen: true, selectedStudent: student });
  };
  
  const handleConfirmAction = async (student: Student | null, status: 'archived' | 'graduated') => {
    if (!student) return;
    const result = await updateStudentStatus(student.id, status);
    if(result.success) {
      toast({ title: `Student ${status}`, description: `${student.name} has been moved.`});
      fetchPage(currentPage);
    } else {
      toast({ variant: "destructive", title: "Action Failed", description: result.message });
    }
    setDialogState({ ...dialogState, isArchiveOpen: false, isGraduateOpen: false, selectedStudent: null });
    setSelectedStudents([]);
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (student: Student, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, student]);
    } else {
      setSelectedStudents(prev => prev.filter(s => s.id !== student.id));
    }
  };

  const handlePrintSelected = () => {
    if (selectedStudents.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        toast({ variant: 'destructive', title: 'Popup Blocked', description: 'Please allow popups to print.' });
        return;
    }

    const tableRows = selectedStudents.map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.fatherName}</td>
            <td>${s.phone}</td>
            <td>${s.class}</td>
            <td style="text-align: center;">${s.feeStatus}</td>
        </tr>
    `).join('');

    const printHtml = `
        <html>
            <head>
                <title>Student Information Report</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 24px; color: #1a1a1a; }
                    .header p { margin: 5px 0 0; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #e2e8f0; padding: 12px 15px; text-align: left; font-size: 14px; }
                    th { background-color: #f8fafc; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
                    tr:nth-child(even) { background-color: #fcfcfc; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Student Information Report</h1>
                    <p>Generated on ${format(new Date(), 'PPP')}</p>
                    <p>Total Records: ${selectedStudents.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Roll #</th>
                            <th>Name</th>
                            <th>Father's Name</th>
                            <th>Phone</th>
                            <th>Class</th>
                            <th style="text-align: center;">Fee Status</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <div class="footer">
                    Copyright &copy; ${new Date().getFullYear()} ${settings.name}. Developed by SchoolUP.
                </div>
            </body>
        </html>
    `;
    printWindow.document.write(printHtml);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
  };

  const onStudentUpdated = () => {
    fetchPage(currentPage);
    setDialogState({ ...dialogState, isEditOpen: false, selectedStudent: null });
    setSelectedStudents([]);
    setIsBulkPromoteOpen(false);
    setIsBulkGraduateOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student profiles, fees, and results.
          </p>
        </div>
        <Dialog open={dialogState.isAddOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isAddOpen: isOpen })}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <AddStudentForm onStudentAdded={() => { fetchPage(0, true); setDialogState({ ...dialogState, isAddOpen: false }); }} />
        </Dialog>
      </div>

      {selectedStudents.length > 0 && classFilter !== 'all' && (
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 p-2 rounded-lg mb-2 animate-in fade-in slide-in-from-top-2">
            <Badge variant="secondary" className="px-3 py-1 text-sm font-bold ml-2">
                {selectedStudents.length} Students Selected
            </Badge>
            <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrintSelected}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Info
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsBulkPromoteOpen(true)}>
                    <ChevronsRight className="h-4 w-4 mr-2" />
                    Promote
                </Button>
                <Button size="sm" onClick={() => setIsBulkGraduateOpen(true)}>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Graduate
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant="ghost" size="sm" onClick={() => setSelectedStudents([])}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                </Button>
            </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            {classFilter !== 'all' ? `Viewing students in ${classes.find(c => c.id === classFilter)?.name}. Use selection for bulk graduation.` : `Search and filter to manage academy students.`}
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-4 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by student name or roll number..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {classFilter !== 'all' && (
                  <TableHead className="w-12">
                      <Checkbox
                          checked={students.length > 0 && selectedStudents.length === students.length}
                          onCheckedChange={handleSelectAll}
                      />
                  </TableHead>
                )}
                <TableHead>Student</TableHead>
                <TableHead>Father's Name</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead className="hidden sm:table-cell">Class</TableHead>
                <TableHead className="hidden md:table-cell">Subjects</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {classFilter !== 'all' && <TableCell><Checkbox disabled /></TableCell>}
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    {classFilter !== 'all' && (
                      <TableCell>
                          <Checkbox
                              checked={selectedStudents.some(s => s.id === student.id)}
                              onCheckedChange={(checked) => handleSelectStudent(student, !!checked)}
                          />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.imageUrl} alt={student.name} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.id}</div>
                          </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.fatherName}</TableCell>
                    <TableCell>
                        <Badge variant={student.feeStatus === 'Paid' ? 'secondary' : student.feeStatus === 'Overdue' ? 'destructive' : 'outline'}>
                            {student.feeStatus}
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{student.class}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                          {student.subjects.map(sub => (
                              <Badge key={sub.subject_name} variant="outline" className="font-normal">{sub.subject_name}</Badge>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                         <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/students/${student.id}`)}>View Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(student)}>Edit</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleConfirmAction(student, 'graduated')}>
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Graduate to Alumni
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                           <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Archive Student?</AlertDialogTitle>
                                <AlertDialogDescription>Move {student.name} to the archive.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleConfirmAction(student, 'archived')} className="bg-destructive">Archive</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No students found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {classFilter === 'all' && !search && (
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 0 || loading}>
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                <div className="text-sm font-medium">Page {currentPage + 1}</div>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!hasMore || loading}>
                Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {dialogState.selectedStudent && (
          <Dialog open={dialogState.isEditOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isEditOpen: isOpen, selectedStudent: isOpen ? dialogState.selectedStudent : null })}>
              <EditStudentForm student={dialogState.selectedStudent} onStudentUpdated={onStudentUpdated} />
          </Dialog>
      )}

      <Dialog open={isBulkPromoteOpen} onOpenChange={setIsBulkPromoteOpen}>
          <BulkPromoteDialog 
              students={selectedStudents} 
              onStudentsPromoted={onStudentUpdated} 
          />
      </Dialog>

      <Dialog open={isBulkGraduateOpen} onOpenChange={setIsBulkGraduateOpen}>
          <BulkGraduateDialog 
              students={selectedStudents} 
              onStudentsGraduated={onStudentUpdated} 
          />
      </Dialog>
    </div>
  );
}
