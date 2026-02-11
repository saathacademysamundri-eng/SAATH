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
import { MoreHorizontal, Printer, Search, PlusCircle, Edit, Trash, QrCode } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { AddTeacherDialog } from './add-teacher-dialog';
import { Badge } from '@/components/ui/badge';
import { EditTeacherDialog } from './edit-teacher-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { QrCodeDialog } from './qr-code-dialog';
import { startOfMonth } from 'date-fns';

export default function TeachersPage() {
  const [search, setSearch] = useState('');
  const { teachers, students: allStudents, income, allPayouts, loading, refreshData } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const [dialogState, setDialogState] = useState<{
    isAddOpen: boolean;
    isEditOpen: boolean;
    isQrOpen: boolean;
    selectedTeacher: Teacher | null;
  }>({
    isAddOpen: false,
    isEditOpen: false,
    isQrOpen: false,
    selectedTeacher: null,
  });

  const teacherStats = useMemo(() => {
    const stats = new Map<string, { studentCount: number; netEarnings: number }>();

    teachers.forEach(teacher => {
        const taughtStudents = allStudents.filter(student => 
            student.subjects.some(sub => sub.teacher_id === teacher.id)
        );
        
        const teacherPayouts = allPayouts.filter(p => p.teacherId === teacher.id);
        const isNewTeacher = teacherPayouts.length === 0;
        
        let unpaidIncome = income.filter(i => !i.paidOutTo || !i.paidOutTo[teacher.id]);
        
        // Strictly prevent new teachers from earning from past months
        if (isNewTeacher) {
            const startOfCurrentMonth = startOfMonth(new Date());
            unpaidIncome = unpaidIncome.filter(i => i.date >= startOfCurrentMonth);
        }

        let grossEarnings = 0;

        unpaidIncome.forEach(inc => {
            const student = allStudents.find(s => s.id === inc.studentId);
            if (student) {
                const relevantSubjects = student.subjects.filter(sub => sub.teacher_id === teacher.id);
                
                relevantSubjects.forEach(subject => {
                    const feeShareForSubject = subject.fee_share || 0;
                    if (student.monthlyFee > 0) {
                      const proportion = feeShareForSubject / student.monthlyFee;
                      
                      let earnableAmount = inc.amount;
                      
                      // Rule: A new teacher should not earn from historical student debt
                      if (isNewTeacher) {
                          const balanceBeforeThisPayment = student.totalFee + inc.amount;
                          const oldDebt = balanceBeforeThisPayment - student.monthlyFee;

                          if (oldDebt > 0) {
                              earnableAmount = Math.max(0, inc.amount - oldDebt);
                          }
                      }

                      const earnedShare = earnableAmount * proportion;
                      grossEarnings += earnedShare;
                    }
                 });
            }
        });
        
        stats.set(teacher.id, {
            studentCount: taughtStudents.length,
            netEarnings: grossEarnings * 0.7,
        });
    });

    return stats;
  }, [teachers, allStudents, income, allPayouts]);

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name && teacher.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditClick = (teacher: Teacher) => {
    setDialogState({ ...dialogState, isEditOpen: true, selectedTeacher: teacher });
  };
  
  const handleQrClick = (teacher: Teacher) => {
    setDialogState({ ...dialogState, isQrOpen: true, selectedTeacher: teacher });
  }

  const closeDialogs = () => {
    setDialogState({ isAddOpen: false, isEditOpen: false, isQrOpen: false, selectedTeacher: null });
  };

  const onActionComplete = () => {
    refreshData();
    closeDialogs();
  };

  const handleConfirmDelete = async (teacher: Teacher) => {
    const result = await deleteTeacher(teacher.id);
    if(result.success) {
      toast({ title: "Teacher Deleted", description: `Record for ${teacher.name} has been removed.`});
      refreshData();
    } else {
      toast({ variant: "destructive", title: "Deletion Failed", description: result.message });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">
            Manage teacher profiles and their earnings.
          </p>
        </div>
         <div className="flex items-center gap-2">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search teachers..." 
                  className="pl-8 w-64" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
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
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? null : (
            filteredTeachers.map((teacher) => {
              const stats = teacherStats.get(teacher.id) || { studentCount: 0, netEarnings: 0 };
              return (
                 <AlertDialog key={teacher.id}>
                    <Card className="flex flex-col">
                        <CardHeader className="flex-row gap-4 items-start">
                            <Avatar className="w-12 h-12 border-2 border-primary">
                              <AvatarImage src={teacher.imageUrl} alt={teacher.name} />
                              <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{teacher.name}</h3>
                                <p className="text-sm text-muted-foreground">{teacher.phone}</p>
                            </div>
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
                                  <DropdownMenuItem onClick={() => handleQrClick(teacher)}>
                                      <QrCode className="mr-2 h-4 w-4" />
                                      QR Code
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
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1">
                           <div className="flex flex-wrap gap-1">
                            {(teacher.subjects || []).map(s => <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>)}
                          </div>
                           <div>
                                <p className="text-xs text-muted-foreground">Current Net Earnings (70%)</p>
                                <p className="text-2xl font-bold text-green-600">{stats.netEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</p>
                           </div>
                           <div>
                                <p className="text-xs text-muted-foreground">Students Taught</p>
                                <p className="text-2xl font-bold">{stats.studentCount}</p>
                           </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                           <Button className="w-full" variant="outline" size="sm" onClick={() => router.push(`/teachers/${teacher.id}`)}>
                                View Profile
                            </Button>
                        </CardFooter>
                    </Card>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the teacher record for <span className="font-bold">{teacher.name}</span>. This will NOT affect past payouts.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleConfirmDelete(teacher)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
              )
            })
          )}
           {!loading && filteredTeachers.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No teachers found.</p>
            </div>
          )}
       </div>
        {dialogState.selectedTeacher && (
          <Dialog open={dialogState.isEditOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isEditOpen: isOpen, selectedTeacher: isOpen ? dialogState.selectedTeacher : null })}>
              <EditTeacherDialog 
                  teacher={dialogState.selectedTeacher}
                  onTeacherUpdated={onActionComplete}
              />
          </Dialog>
        )}
        {dialogState.selectedTeacher && (
            <Dialog open={dialogState.isQrOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isQrOpen: isOpen, selectedTeacher: isOpen ? dialogState.selectedTeacher : null })}>
                <QrCodeDialog teacher={dialogState.selectedTeacher} />
            </Dialog>
        )}
    </div>
  );
}
