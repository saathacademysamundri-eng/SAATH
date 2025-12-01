
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { MoreHorizontal, PlusCircle, Search, Trash, Edit, Archive, GraduationCap, ChevronRight, Printer, ChevronsRight } from 'lucide-react';
import { AddStudentForm } from './add-student-form';
import { Dialog, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useState, useMemo, useEffect } from 'react';
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
import { updateStudentStatus } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromoteStudentDialog } from './promote-student-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkPromoteDialog } from './bulk-promote-dialog';
import { useSettings } from '@/hooks/use-settings';

export default function StudentsPage() {
  const { students: studentList, classes, loading, refreshData } = useAppContext();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const router = useRouter();
  const { toast } = useToast();
  const { settings, isSettingsLoading } = useSettings();

  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [isBulkPromoteOpen, setIsBulkPromoteOpen] = useState(false);

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

  const filteredStudents = useMemo(() => {
    return studentList.filter(student => {
        const searchMatch = student.name.toLowerCase().includes(search.toLowerCase()) || 
          student.id.toLowerCase().includes(search.toLowerCase()) ||
          student.fatherName.toLowerCase().includes(search.toLowerCase());
        
        const classMatch = classFilter === 'all' || student.class === classes.find(c => c.id === classFilter)?.name;

        return searchMatch && classMatch;
    });
  }, [studentList, search, classFilter, classes]);
  
  useEffect(() => {
    // When filters change, clear selection if a selected student is no longer visible
    const visibleStudentIds = new Set(filteredStudents.map(s => s.id));
    setSelectedStudents(prev => prev.filter(s => visibleStudentIds.has(s.id)));
  }, [filteredStudents]);


  const handleEditClick = (student: Student) => {
    setDialogState({ ...dialogState, isEditOpen: true, selectedStudent: student });
  };
  
  const handleArchiveAction = (student: Student, open: boolean) => {
    setDialogState({ ...dialogState, isArchiveOpen: open, selectedStudent: student });
  }
  
  const handleGraduateAction = (student: Student, open: boolean) => {
     setDialogState({ ...dialogState, isGraduateOpen: open, selectedStudent: student });
  }

  const handlePromoteClick = (student: Student) => {
    setDialogState({ ...dialogState, isPromoteOpen: true, selectedStudent: student });
  }

  const closeDialogs = () => {
    setDialogState({ isAddOpen: false, isEditOpen: false, isArchiveOpen: false, isGraduateOpen: false, isPromoteOpen: false, selectedStudent: null });
  };

  const onStudentAdded = () => {
    refreshData();
    setDialogState({ ...dialogState, isAddOpen: false });
  };

  const onStudentUpdated = () => {
    refreshData();
    closeDialogs();
    setSelectedStudents([]);
    setIsBulkPromoteOpen(false);
  };
  
  const handleConfirmAction = async (student: Student | null, status: 'archived' | 'graduated') => {
    if (!student) return;
    const result = await updateStudentStatus(student.id, status);
    if(result.success) {
      toast({ title: `Student ${status}`, description: `${student.name} has been moved.`});
      refreshData();
    } else {
      toast({ variant: "destructive", title: "Action Failed", description: result.message });
    }
    closeDialogs();
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents);
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
    if (selectedStudents.length === 0) {
      toast({ variant: 'destructive', title: 'No Students Selected', description: 'Please select students to print.' });
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const tableRows = selectedStudents.map(s => `
        <tr>
          <td>${s.id}</td>
          <td>${s.name}</td>
          <td>${s.fatherName}</td>
          <td>${s.phone}</td>
        </tr>
      `).join('');

    const printHtml = `
      <html>
        <head>
          <title>Selected Students List</title>
          <style>
            @media print { @page { size: A4; margin: 0.75in; } }
            body { font-family: 'Segoe UI', sans-serif; }
            .report-container { max-width: 800px; margin: auto; }
            .academy-details { text-align: center; margin-bottom: 1rem; }
            h1 { font-size: 1.5rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="report-container">
             <div class="academy-details">
                ${settings.logo ? `<img src="${settings.logo}" alt="Logo" style="height: 50px; margin: auto;">` : ''}
                <h1>${settings.name}</h1>
                <p>${settings.phone}</p>
            </div>
            <h2>Selected Students List</h2>
            <table>
              <thead><tr><th>Roll #</th><th>Name</th><th>Father's Name</th><th>Phone</th></tr></thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }


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
              <PlusCircle />
              Add Student
            </Button>
          </DialogTrigger>
          <AddStudentForm onStudentAdded={onStudentAdded} />
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            {classFilter === 'all' && search === '' ? (
              <>
                A list of all{' '}
                <span className="text-xl font-bold text-primary">{filteredStudents.length}</span> students in the academy.
              </>
            ) : (
              <>
                Found <span className="text-xl font-bold text-primary">{filteredStudents.length}</span> students matching your criteria.
              </>
            )}
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-4 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by student name, father's name, or roll number..." 
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
          {selectedStudents.length > 0 && (
            <div className="flex items-center gap-4 border-t pt-4 mt-4">
                <p className="text-sm text-muted-foreground">{selectedStudents.length} student(s) selected</p>
                <Button size="sm" onClick={() => setIsBulkPromoteOpen(true)}>
                    <ChevronsRight className="mr-2 h-4 w-4" />
                    Promote Selected
                </Button>
                <Button size="sm" variant="outline" onClick={handlePrintSelected}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Selected
                </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead className="w-12">
                    <Checkbox
                        checked={selectedStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                    />
                 </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Father's Name</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead className="hidden sm:table-cell">Class</TableHead>
                <TableHead className="hidden md:table-cell">Subjects</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Checkbox disabled /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      </div>
                    </TableCell>
                     <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                     <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} data-state={selectedStudents.some(s => s.id === student.id) && "selected"}>
                    <TableCell>
                        <Checkbox
                            checked={selectedStudents.some(s => s.id === student.id)}
                            onCheckedChange={(checked) => handleSelectStudent(student, !!checked)}
                            aria-label={`Select ${student.name}`}
                        />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.imageUrl} alt={student.name} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.id} {student.section && `(${student.section})`}</div>
                          </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.fatherName}</TableCell>
                    <TableCell>
                        <Badge variant={
                            student.feeStatus === 'Paid' ? 'secondary' : 
                            student.feeStatus === 'Overdue' ? 'destructive' :
                            'outline'
                        }>{student.feeStatus}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{student.class}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                          {student.subjects.map(sub => (
                              <Badge key={sub.subject_name} variant="outline" className={cn('font-normal')}>{sub.subject_name}</Badge>
                          ))}
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
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => router.push(`/students/${student.id}`)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(student)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePromoteClick(student)}>
                                <ChevronRight className="mr-2 h-4 w-4" />
                                Promote Student
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                               <DropdownMenuItem onSelect={() => handleGraduateAction(student, true)}>
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Mark as Graduated
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                           <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will move <span className="font-bold">{student.name}</span> to the Archive. You can permanently delete them from there.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => handleArchiveAction(student, false)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleConfirmAction(student, 'archived')} className="bg-destructive hover:bg-destructive/90">Archive</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <AlertDialog open={dialogState.isArchiveOpen} onOpenChange={(open) => setDialogState(prev => ({...prev, isArchiveOpen: open, selectedStudent: open ? prev.selectedStudent : null}))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will move <span className="font-bold">{dialogState.selectedStudent?.name}</span> to the Archive. You can permanently delete them from there.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleConfirmAction(dialogState.selectedStudent, 'archived')} className="bg-destructive hover:bg-destructive/90">Archive</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={dialogState.isGraduateOpen} onOpenChange={(open) => setDialogState(prev => ({...prev, isGraduateOpen: open, selectedStudent: open ? prev.selectedStudent : null}))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as Graduated?</AlertDialogTitle>
              <AlertDialogDescription>
                This will move <span className="font-bold">{dialogState.selectedStudent?.name}</span> to the Alumni list to preserve their record as a passed-out student.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleConfirmAction(dialogState.selectedStudent, 'graduated')}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      {dialogState.selectedStudent && (
          <Dialog open={dialogState.isEditOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isEditOpen: isOpen, selectedStudent: isOpen ? dialogState.selectedStudent : null })}>
              <EditStudentForm 
                  student={dialogState.selectedStudent}
                  onStudentUpdated={onStudentUpdated}
              />
          </Dialog>
      )}
       {dialogState.selectedStudent && (
          <Dialog open={dialogState.isPromoteOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isPromoteOpen: isOpen, selectedStudent: isOpen ? dialogState.selectedStudent : null })}>
              <PromoteStudentDialog 
                  student={dialogState.selectedStudent}
                  onStudentPromoted={onStudentUpdated}
              />
          </Dialog>
      )}
      {selectedStudents.length > 0 && (
          <Dialog open={isBulkPromoteOpen} onOpenChange={setIsBulkPromoteOpen}>
              <BulkPromoteDialog
                  students={selectedStudents}
                  onStudentsPromoted={onStudentUpdated}
              />
          </Dialog>
      )}
    </div>
  );
}
