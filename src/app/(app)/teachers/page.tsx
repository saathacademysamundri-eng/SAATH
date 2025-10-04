
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
import { MoreHorizontal, Printer, Search, PlusCircle, Edit, Trash } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { AddTeacherDialog } from './add-teacher-dialog';
import { Badge } from '@/components/ui/badge';
import { EditTeacherDialog } from './edit-teacher-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppContext } from '@/hooks/use-app-context';
import { Teacher } from '@/lib/data';
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
import { deleteTeacher } from '@/lib/firebase/firestore';

export default function TeachersPage() {
  const [search, setSearch] = useState('');
  const { teachers, students: allStudents, income, loading, refreshData } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const [dialogState, setDialogState] = useState<{
    isAddOpen: boolean;
    isEditOpen: boolean;
    isDeleteOpen: boolean;
    selectedTeacher: Teacher | null;
  }>({
    isAddOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    selectedTeacher: null,
  });

  const teacherStats = useMemo(() => {
    const stats = new Map<string, { gross: number; net: number }>();

    teachers.forEach(teacher => {
        stats.set(teacher.id, { gross: 0, net: 0 });
    });

    const unpaidIncome = income.filter(i => !i.isPaidOut);

    unpaidIncome.forEach(inc => {
        const student = allStudents.find(s => s.id === inc.studentId);
        if (student && student.subjects.length > 0) {
            const studentTeachers = [...new Set(student.subjects.map(s => s.teacher_id))];
            if (studentTeachers.length > 0) {
                const sharePerTeacher = inc.amount / studentTeachers.length;

                studentTeachers.forEach(teacherId => {
                    if (stats.has(teacherId)) {
                        const currentStats = stats.get(teacherId)!;
                        currentStats.gross += sharePerTeacher;
                    }
                });
            }
        }
    });

    stats.forEach(stat => {
        stat.net = stat.gross * 0.7;
    });

    return stats;
  }, [teachers, allStudents, income]);

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditClick = (teacher: Teacher) => {
    setDialogState({ ...dialogState, isEditOpen: true, selectedTeacher: teacher });
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setDialogState({ ...dialogState, isDeleteOpen: true, selectedTeacher: teacher });
  };

  const closeDialogs = () => {
    setDialogState({ isAddOpen: false, isEditOpen: false, isDeleteOpen: false, selectedTeacher: null });
  };

  const onActionComplete = () => {
    refreshData();
    closeDialogs();
  };

  const handleConfirmDelete = async () => {
    if (!dialogState.selectedTeacher) return;
    const result = await deleteTeacher(dialogState.selectedTeacher.id);
    if(result.success) {
      toast({ title: "Teacher Deleted", description: `Record for ${dialogState.selectedTeacher.name} has been removed.`});
      onActionComplete();
    } else {
      toast({ variant: "destructive", title: "Deletion Failed", description: result.message });
      closeDialogs();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">
            View teacher profiles and their earnings.
          </p>
        </div>
        <Dialog open={dialogState.isAddOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isAddOpen: isOpen })}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2"/>
              Add Teacher
            </Button>
          </DialogTrigger>
          <AddTeacherDialog onTeacherAdded={onActionComplete} />
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Teacher List</CardTitle>
          <CardDescription>
            A list of all teachers in the academy. Earnings are calculated from paid student fees that have not yet been paid out.
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search teachers..." 
              className="pl-8" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject(s)</TableHead>
                <TableHead>Current Net Earnings (70%)</TableHead>
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
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredTeachers.map((teacher) => {
                  const stats = teacherStats.get(teacher.id) || { gross: 0, net: 0 };
                  return (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{teacher.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(teacher.subjects || []).map(s => <Badge key={s} variant="outline" className="font-normal">{s}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {stats.net.toLocaleString()} PKR
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
                              <DropdownMenuItem onClick={() => router.push(`/teachers/${teacher.id}`)}>
                                View Profile & Pay
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(teacher)}>
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
                                This action cannot be undone. This will permanently delete the teacher record for <span className="font-bold">{teacher.name}</span>. This will NOT affect past payouts.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={closeDialogs}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                )})
              )}
               {!loading && filteredTeachers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No teachers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        {dialogState.selectedTeacher && (
          <Dialog open={dialogState.isEditOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isEditOpen: isOpen })}>
              <EditTeacherDialog 
                  teacher={dialogState.selectedTeacher}
                  onTeacherUpdated={onActionComplete}
              />
          </Dialog>
        )}
    </div>
  );
}
