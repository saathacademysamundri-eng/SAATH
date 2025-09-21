import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

function getFeeStatusBadge(status: string) {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700';
        case 'pending':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-700';
        case 'partial':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700';
        case 'overdue':
            return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700';
        default:
            return 'bg-secondary text-secondary-foreground';
    }
}


export default function StudentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student profiles, fees, and results.
          </p>
        </div>
        <AddStudentForm />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            A list of all students in the academy.
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Class</TableHead>
                <TableHead className="hidden lg:table-cell">Subjects</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
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
                  <TableCell className="hidden lg:table-cell">{student.subjects}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('font-normal', getFeeStatusBadge(student.feeStatus))}>
                        {student.feeStatus}
                    </Badge>
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
