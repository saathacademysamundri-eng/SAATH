

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
import { MoreHorizontal, PlusCircle, Search, Trash, Edit, Archive, GraduationCap } from 'lucide-react';
import { AddStudentForm } from './add-student-form';
import { Dialog, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';
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

export default function StudentsPage() {
  const { students: studentList, loading, refreshData } = useAppContext();
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const [dialogState, setDialogState] = useState<{
    isAddOpen: boolean;
    isEditOpen: boolean;
    isArchiveOpen: boolean;
    isGraduateOpen: boolean;
    selectedStudent: Student | null;
  }>({
    isAddOpen: false,
    isEditOpen: false,
    isArchiveOpen: false,
    isGraduateOpen: false,
    selectedStudent: null,
  });

  const filteredStudents = studentList.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) || student.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditClick = (student: Student) => {
    setDialogState({ ...dialogState, isEditOpen: true, selectedStudent: student });
  };
  
  const handleArchiveAction = (student: Student, open: boolean) => {
    setDialogState({ ...dialogState, isArchiveOpen: open, selectedStudent: student });
  }
  
  const handleGraduateAction = (student: Student, open: boolean) => {
     setDialogState({ ...dialogState, isGraduateOpen: open, selectedStudent: student });
  }

  const closeDialogs = () => {
    setDialogState({ isAddOpen: false, isEditOpen: false, isArchiveOpen: false, isGraduateOpen: false, selectedStudent: null });
  };

  const onStudentAdded = () => {
    refreshData();
    setDialogState({ ...dialogState, isAddOpen: false });
  };

  const onStudentUpdated = () => {
    refreshData();
    closeDialogs();
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
            A list of all students in the academy.
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      </div>
                    </TableCell>
                     <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
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
          <Dialog open={dialogState.isEditOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isEditOpen: isOpen })}>
              <EditStudentForm 
                  student={dialogState.selectedStudent}
                  onStudentUpdated={onStudentUpdated}
              />
          </Dialog>
      )}
    </div>
  );
}
