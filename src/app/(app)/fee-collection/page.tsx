'use client';

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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { students as initialStudents, type Student } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Printer, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

type StudentWithPayment = Student & {
  paidAmount: number;
  balance: number;
};

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

export default function FeeCollectionPage() {
  const [studentList, setStudentList] = useState<StudentWithPayment[]>(() => 
    initialStudents.map(s => ({ ...s, paidAmount: 0, balance: s.totalFee }))
  );
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleAmountChange = (studentId: string, amount: number) => {
    setStudentList(studentList.map(student => {
      if (student.id === studentId) {
        const paidAmount = Math.max(0, Math.min(amount, student.totalFee));
        return {
          ...student,
          paidAmount: paidAmount,
          balance: student.totalFee - paidAmount,
        };
      }
      return student;
    }));
  };

  const handleUpdatePayment = (studentId: string) => {
    setStudentList(studentList.map(student => {
      if (student.id === studentId) {
        const { paidAmount, totalFee } = student;
        let newStatus: Student['feeStatus'] = 'Pending';
        if (paidAmount === totalFee) {
          newStatus = 'Paid';
        } else if (paidAmount > 0) {
          newStatus = 'Partial';
        }
        toast({
          title: 'Payment Updated',
          description: `Fee status for ${student.name} updated to ${newStatus}.`,
        });
        return { ...student, feeStatus: newStatus };
      }
      return student;
    }));
  };

  const handlePrintReceipt = (studentId: string) => {
    const student = studentList.find(s => s.id === studentId);
    if (student) {
      if (student.paidAmount <= 0) {
        toast({
          variant: 'destructive',
          title: 'Cannot Print Receipt',
          description: 'No payment has been recorded for this student.',
        });
        return;
      }
      
      const url = `/fee-collection/${studentId}/receipt?amount=${student.paidAmount}&balance=${student.balance}&total=${student.totalFee}`;
      window.open(url, '_blank');
    }
  };

  const filteredStudents = useMemo(() => 
    studentList.filter(student =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.id.toLowerCase().includes(search.toLowerCase())
    ), [studentList, search]);


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fee Collection</h1>
        <p className="text-muted-foreground">
          Track and manage student fee payments.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student Fee Status</CardTitle>
          <CardDescription>
            Enter paid amounts and update fee status for each student.
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or roll number..." 
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
                <TableHead>Total Fee</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="person face" />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">Roll #: {student.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.totalFee.toLocaleString()} PKR</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      className="w-32"
                      placeholder="0"
                      value={student.paidAmount || ''}
                      onChange={(e) => handleAmountChange(student.id, Number(e.target.value))}
                    />
                  </TableCell>
                   <TableCell>{student.balance.toLocaleString()} PKR</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('font-normal', getFeeStatusBadge(student.feeStatus))}>
                        {student.feeStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" onClick={() => handleUpdatePayment(student.id)}>Update</Button>
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handlePrintReceipt(student.id)}>
                        <Printer className="h-4 w-4" />
                        <span className="sr-only">Print Receipt</span>
                      </Button>
                    </div>
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
