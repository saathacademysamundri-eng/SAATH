

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
import { MoreHorizontal, PlusCircle, Search, Trash, Edit } from 'lucide-react';
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
import { deleteStudent } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function StudentsPage() {
  const { students: studentList, loading, refreshData } = useAppContext();
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const [dialogState, setDialogState] = useState<{
    isAddOpen: boolean;
    isEditOpen: boolean;
    isDeleteOpen: boolean;
    selectedStudent: Student | null;
  }>({
    isAddOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    selectedStudent: null,
  });

  const filteredStudents = studentList.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) || student.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditClick = (student: Student) => {
    setDialogState({ ...dialogState, isEditOpen: true, selectedStudent: student });
  };

  const closeDialogs = () => {
    setDialogState({ isAddOpen: false, isEditOpen: false, isDeleteOpen: false, selectedStudent: null });
  };

  const onStudentAdded = () => {
    refreshData();
    setDialogState({ ...dialogState, isAddOpen: false });
  };

  const onStudentUpdated = () => {
    refreshData();
    closeDialogs();
  };
  
  const handleConfirmDelete = async (student: Student | null) => {
    if (!student) return;
    const result = await deleteStudent(student.id);
    if(result.success) {
      toast({ title: "Student Deleted", description: `Record for ${student.name} has been removed.`});
      refreshData();
    } else {
      toast({ variant: "destructive", title: "Deletion Failed", description: result.message });
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
                <TableHead>Roll #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead className="hidden md:table-cell">Class</TableHead>
                <TableHead className="hidden lg:table-cell">Subjects</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </TableCell>
                     <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{student.name}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={
                            student.feeStatus === 'Paid' ? 'secondary' : 
                            student.feeStatus === 'Overdue' ? 'destructive' :
                            'outline'
                        }>{student.feeStatus}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{student.class}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                          {student.subjects.map(sub => (
                              <Badge key={sub.subject_name} variant="outline" className={cn('font-normal')}>{sub.subject_name}</Badge>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>
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
                                This action cannot be undone. This will permanently delete the student record for <span className="font-bold">{student.name}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleConfirmDelete(student)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
