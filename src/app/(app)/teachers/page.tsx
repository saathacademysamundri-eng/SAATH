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
import { teachers, students as allStudents } from '@/lib/data';
import { MoreHorizontal, Printer, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function TeachersPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const teacherStats = useMemo(() => {
    const stats = new Map<string, { gross: number; net: number; subjects: Set<string> }>();
    
    teachers.forEach(teacher => {
        stats.set(teacher.id, { gross: 0, net: 0, subjects: new Set() });
    });

    allStudents.forEach(student => {
      student.subjects.forEach(subject => {
        if (stats.has(subject.teacher_id)) {
            const currentStats = stats.get(subject.teacher_id)!;
            currentStats.gross += subject.fee_share;
            currentStats.subjects.add(subject.subject_name);
        }
      });
    });

    stats.forEach(stat => {
        stat.net = stat.gross * 0.7;
    });

    return stats;
  }, [allStudents]);


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
                <TableHead>Gross Earnings</TableHead>
                <TableHead>Net Earnings (70%)</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => {
                const stats = teacherStats.get(teacher.id) || { gross: 0, net: 0, subjects: new Set() };
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
                    {stats.subjects.size > 0 ? Array.from(stats.subjects).join(', ') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {stats.gross.toLocaleString()} PKR
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
                          View Earnings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/teachers/${teacher.id}`)}>
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
              )})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
