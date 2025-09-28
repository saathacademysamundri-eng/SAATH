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
import { students } from '@/lib/data';
import { cn } from '@/lib/utils';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { AddStudentForm } from './add-student-form';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function StudentsPage() {
  const [studentList, setStudentList] = useState(students);
  const [search, setSearch] = useState('');

  const handleStudentAdded = () => {
    setStudentList([...students]);
  };

  const filteredStudents = studentList.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student profiles, fees, and results.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle />
              Add Student
            </Button>
          </DialogTrigger>
          <AddStudentForm onStudentAdded={handleStudentAdded} />
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
                <TableHead className="hidden md:table-cell">Class</TableHead>
                <TableHead className="hidden lg:table-cell">Subjects</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="person face" />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{student.name}</div>
                    </div>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
