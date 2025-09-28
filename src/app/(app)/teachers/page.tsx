
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { type Teacher, type Student } from '@/lib/data';
import { getTeachers, getStudents } from '@/lib/firebase/firestore';
import { MoreHorizontal, Printer, Search, PlusCircle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { AddTeacherDialog } from './add-teacher-dialog';
import { Badge } from '@/components/ui/badge';

export default function TeachersPage() {
  const [search, setSearch] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const [teachersData, studentsData] = await Promise.all([
      getTeachers(),
      getStudents(),
    ]);
    setTeachers(teachersData);
    setAllStudents(studentsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const teacherStats = useMemo(() => {
    const stats = new Map<string, { gross: number; net: number }>();
    
    teachers.forEach(teacher => {
        stats.set(teacher.id, { gross: 0, net: 0 });
    });

    allStudents.forEach(student => {
      // Only count fees from paid students
      if (student.feeStatus === 'Paid') {
        student.subjects.forEach(subject => {
          if (stats.has(subject.teacher_id)) {
              const currentStats = stats.get(subject.teacher_id)!;
              currentStats.gross += subject.fee_share;
          }
        });
      }
    });

    stats.forEach(stat => {
        stat.net = stat.gross * 0.7;
    });

    return stats;
  }, [teachers, allStudents]);


  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">
            View teacher profiles and their earnings.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2"/>
              Add Teacher
            </Button>
          </DialogTrigger>
          <AddTeacherDialog onTeacherAdded={fetchData} />
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Teacher List</CardTitle>
          <CardDescription>
            A list of all teachers in the academy.
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
                <TableHead>Net Earnings (70%)</TableHead>
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
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
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
                          <AvatarImage src={teacher.avatar} alt={teacher.name} data-ai-hint="person face" />
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
                    <TableCell>
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
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                              const printWindow = window.open(`/teachers/${teacher.id}?print=true`, '_blank');
                              printWindow?.addEventListener('load', () => {
                                setTimeout(() => {
                                  printWindow?.print();
                                  printWindow.close();
                                }, 500);
                              });
                            }}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Report
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
