
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getInactiveStudents, reactivateStudent, deleteStudentPermanently } from '@/lib/firebase/firestore';
import { Student } from '@/lib/data';
import { Search, UserCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/hooks/use-app-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const { refreshData } = useAppContext();

  const fetchAlumni = async () => {
    setLoading(true);
    const alumniData = await getInactiveStudents();
    setAlumni(alumniData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const handleReactivate = async (student: Student) => {
    const result = await reactivateStudent(student.id);
    if (result.success) {
      toast({
        title: 'Student Reactivated',
        description: `${student.name} is now an active student again.`,
      });
      fetchAlumni(); // Refresh the alumni list
      refreshData(); // Refresh the main app context
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
      fetchAlumni(); // Refresh the alumni list
      refreshData();
    } else {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: result.message,
      });
    }
  };

  const filteredAlumni = alumni.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alumni Students</h1>
        <p className="text-muted-foreground">A record of students who have left the academy.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Alumni List</CardTitle>
          <CardDescription>
            Search for past students. You can reactivate them or delete their records permanently.
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alumni..."
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
                <TableHead>Class</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredAlumni.length > 0 ? (
                filteredAlumni.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
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
                                      This action cannot be undone. This will permanently delete the record for <span className="font-bold">{student.name}</span>.
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
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No alumni students found.
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
