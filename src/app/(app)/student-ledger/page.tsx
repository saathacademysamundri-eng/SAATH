
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { type Student, type Income } from '@/lib/data';
import { getStudent } from '@/lib/firebase/firestore';
import { Loader2, Search, Printer } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/hooks/use-app-context';
import { useSettings } from '@/hooks/use-settings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSearchParams } from 'next/navigation';

export default function StudentLedgerPage() {
  const searchParams = useSearchParams()
  const prefilledSearch = searchParams.get('search')
  
  const [search, setSearch] = useState(prefilledSearch || '');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [studentIncome, setStudentIncome] = useState<Income[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { income, loading: isAppLoading } = useAppContext();
  const { settings, isSettingsLoading } = useSettings();

  const handleSearch = async (searchId?: string) => {
    const idToSearch = searchId || search.trim();
    if (!idToSearch) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a student roll number to search.',
      });
      setSearchedStudent(null);
      return;
    }
    setIsSearching(true);
    const student = await getStudent(idToSearch);
    if (student) {
      setSearchedStudent(student);
      const relatedIncome = income.filter(i => i.studentId === student.id);
      setStudentIncome(relatedIncome);
    } else {
      toast({
        variant: 'destructive',
        title: 'Not Found',
        description: 'No student found with that roll number.',
      });
      setSearchedStudent(null);
      setStudentIncome([]);
    }
    setIsSearching(false);
  };

  useEffect(() => {
    if (prefilledSearch) {
        handleSearch(prefilledSearch);
    }
  }, [prefilledSearch, income]);
  
  const totalPaid = useMemo(() => {
    return studentIncome.reduce((acc, i) => acc + i.amount, 0);
  }, [studentIncome]);

  const handlePrint = () => {
    if (isSettingsLoading || !searchedStudent) {
      toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please search for a student first.' });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please allow popups for this site.' });
      return;
    }

    const tableRows = studentIncome.map(item => `
      <tr>
        <td>${format(item.date, 'PPP')}</td>
        <td>Fee Payment</td>
        <td style="text-align: right;">${item.amount.toLocaleString()} PKR</td>
      </tr>
    `).join('');

    const printHtml = `
      <html>
        <head>
          <title>Financial Ledger - ${searchedStudent.name}</title>
           <style>
            @media print {
              @page { size: A4 portrait; margin: 0.75in; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fff; color: #000; font-size: 10pt; }
            .report-container { max-width: 1000px; margin: auto; padding: 20px; }
            .academy-details { text-align: center; margin-bottom: 2rem; }
            .academy-details img { height: 60px; margin-bottom: 0.5rem; object-fit: contain; }
            .academy-details h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
            .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
            .report-title { text-align: center; margin: 2rem 0; }
            .report-title h2 { font-size: 1.8rem; font-weight: bold; margin: 0; }
            .student-info { margin-bottom: 2rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
            .student-info h3 { margin: 0 0 1rem 0; font-size: 1.2rem; }
            .student-info p { margin: 0.25rem 0; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
            th, td { padding: 8px 10px; border: 1px solid #ddd; }
            th { font-weight: bold; background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin-top: 1.5rem; float: right; width: 40%; }
            .summary th { text-align: left; }
            .summary td { text-align: right; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="academy-details">
              ${settings.logo ? `<img src="${settings.logo}" alt="Academy Logo" />` : ''}
              <h1>${settings.name}</h1>
              <p>${settings.address}</p>
              <p>Phone: ${settings.phone}</p>
            </div>
            <div class="report-title">
              <h2>Student Financial Ledger</h2>
            </div>
            <div class="student-info">
              <h3>${searchedStudent.name}</h3>
              <p><strong>Roll #:</strong> ${searchedStudent.id}</p>
              <p><strong>Class:</strong> ${searchedStudent.class}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th style="text-align: right;">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows.length > 0 ? tableRows : '<tr><td colspan="3" style="text-align: center;">No payment history found.</td></tr>'}
              </tbody>
            </table>
            <table class="summary">
                <tr><th>Total Paid:</th><td>${totalPaid.toLocaleString()} PKR</td></tr>
                <tr><th>Outstanding Dues:</th><td>${searchedStudent.totalFee.toLocaleString()} PKR</td></tr>
            </table>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Ledger</h1>
        <p className="text-muted-foreground">
          Search for a student to view their detailed financial report.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Search Student</CardTitle>
          <CardDescription>
            Enter a student roll number to generate their financial ledger.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter student roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isSearching}
            />
            <Button onClick={() => handleSearch()} disabled={isSearching}>
              {isSearching ? <Loader2 className="animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
               {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchedStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback>{searchedStudent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{searchedStudent.name}</CardTitle>
                        <CardDescription>
                            Roll #: {searchedStudent.id} | Class: {searchedStudent.class}
                        </CardDescription>
                    </div>
                </div>
              <Button variant="outline" onClick={handlePrint} disabled={isSettingsLoading}>
                <Printer className="mr-2 h-4 w-4" />
                Print Ledger
              </Button>
            </div>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-2 gap-4 text-center mb-6">
                <div className='p-4 bg-secondary rounded-lg'>
                    <p className='text-sm text-muted-foreground'>Total Amount Paid</p>
                    <p className='text-2xl font-bold'>{totalPaid.toLocaleString()} PKR</p>
                </div>
                 <div className='p-4 bg-destructive/10 rounded-lg'>
                    <p className='text-sm text-destructive'>Outstanding Dues</p>
                    <p className='text-2xl font-bold text-destructive'>{searchedStudent.totalFee.toLocaleString()} PKR</p>
                </div>
            </div>
            <CardTitle className="mb-4 text-lg">Payment History</CardTitle>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount (PKR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAppLoading ? (
                  <TableRow><TableCell colSpan={3} className="h-24 text-center">Loading...</TableCell></TableRow>
                ) : studentIncome.length > 0 ? (
                  studentIncome.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{format(item.date, 'PPP')}</TableCell>
                      <TableCell>Fee Payment</TableCell>
                      <TableCell className="text-right font-medium">{item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No payment history found for this student.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


