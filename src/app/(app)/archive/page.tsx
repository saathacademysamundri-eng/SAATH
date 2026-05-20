
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getArchivedStudents, updateStudentStatus, deleteStudentPermanently, reactivateStudentsBulk, deleteStudentsPermanentlyBulk } from '@/lib/firebase/firestore';
import { Student } from '@/lib/data';
import { Search, UserCheck, Trash2, User as UserIcon, X, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/hooks/use-app-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export default function ArchivePage() {
  const [archivedStudents, setArchivedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const { toast } = useToast();
  const { refreshData } = useAppContext();
  const router = useRouter();

  const fetchArchived = async () => {
    setLoading(true);
    const data = await getArchivedStudents();
    setArchivedStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleReactivate = async (student: Student) => {
    const result = await updateStudentStatus(student.id, 'active');
    if (result.success) {
      toast({
        title: 'Student Reactivated',
        description: `${student.name} is now an active student again.`,
      });
      fetchArchived(); 
      refreshData(); 
    } else {
      toast({
        variant: 'destructive',
        title: 'Reactivation Failed',
        description: result.message,
      });
    }
  };
  
  const handlePermanentDelete = async (student: Student) => {
    const result = await deleteStudentPermanently(student.id);
    if (result.success) {
      toast({
        title: 'Student Deleted',
        description: `${student.name} has been permanently removed.`,
      });
      fetchArchived();
    } else {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: result.message,
      });
    }
  };

  const handleBulkReactivate = async () => {
    if (selectedStudents.length === 0) return;
    const ids = selectedStudents.map(s => s.id);
    const result = await reactivateStudentsBulk(ids);
    if (result.success) {
      toast({ title: 'Bulk Reactivation Complete', description: result.message });
      fetchArchived();
      refreshData();
      setSelectedStudents([]);
    } else {
      toast({ variant: 'destructive', title: 'Action Failed', description: result.message });
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedStudents.length === 0) return;
    const ids = selectedStudents.map(s => s.id);
    const result = await deleteStudentsPermanentlyBulk(ids);
    if (result.success) {
      toast({ title: 'Bulk Deletion Complete', description: result.message });
      fetchArchived();
      setSelectedStudents([]);
    } else {
      toast({ variant: 'destructive', title: 'Action Failed', description: result.message });
    }
  };

  const filteredStudents = archivedStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.id.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Archived Students</h1>
        <p className="text-muted-foreground">A temporary holding area for students before permanent deletion.</p>
      </div>

      {selectedStudents.length > 0 && (
        <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/20 p-2 rounded-lg mb-2 animate-in fade-in slide-in-from-top-2">
            <Badge variant="destructive" className="px-3 py-1 text-sm font-bold ml-2">
                {selectedStudents.length} Students Selected
            </Badge>
            <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkReactivate}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Reactivate Selected
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Permanently
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Permanently delete {selectedStudents.length} students?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action is irreversible. All student records and associated financial data for the selected students will be wiped from the system.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleBulkPermanentDelete} className="bg-destructive hover:bg-destructive/90">
                                Confirm Bulk Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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
          <CardTitle>Archive</CardTitle>
          <CardDescription>
            From here, you can either reactivate a student or delete their record permanently.
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search archive..."
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
                <TableHead className="w-12">
                    <Checkbox
                        checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                        onCheckedChange={handleSelectAll}
                    />
                </TableHead>
                <TableHead>Roll #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Archived Date</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Checkbox disabled /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                        <Checkbox
                            checked={selectedStudents.some(s => s.id === student.id)}
                            onCheckedChange={(checked) => handleSelectStudent(student, !!checked)}
                        />
                    </TableCell>
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.archivedAt ? format(student.archivedAt, 'PPP') : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {student.subjects.map((sub) => (
                          <Badge key={sub.subject_name} variant="outline" className={cn('font-normal')}>
                            {sub.subject_name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="outline" size="sm" onClick={() => router.push(`/archive/${student.id}`)}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReactivate(student)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Reactivate
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the record for <span className="font-bold">{student.name}</span> and all their associated financial data.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handlePermanentDelete(student)}>
                                      Confirm Delete
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
                    The archive is empty.
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
