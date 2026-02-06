
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudent, getIncomeByStudent } from '@/lib/firebase/firestore';
import { useSettings } from '@/hooks/use-settings';
import { Student, Income } from '@/lib/data';
import { Search, Loader2, Wallet, Receipt, AlertCircle, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function PublicLedgerSearchPage() {
  const { settings, isSettingsLoading } = useSettings();
  const [rollNo, setRollNo] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [history, setHistory] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!rollNo.trim()) return;
    
    setLoading(true);
    setError(null);
    setStudent(null);
    setHistory([]);

    try {
      const studentData = await getStudent(rollNo.trim().toUpperCase());
      if (studentData) {
        setStudent(studentData);
        const incomeData = await getIncomeByStudent(studentData.id);
        setHistory(incomeData);
      } else {
        setError('Student not found. Please check the roll number.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          {settings.logo && <img src={settings.logo} alt="Logo" className="h-16 mx-auto mb-4" />}
          <h1 className="text-3xl font-bold text-primary">{settings.name}</h1>
          <p className="text-muted-foreground">Student Financial Portal</p>
        </header>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Fee Ledger Search</CardTitle>
            <CardDescription>Enter your Roll Number to see your payment history and outstanding balance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g. S001" 
                value={rollNo} 
                onChange={(e) => setRollNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-lg h-12"
              />
              <Button onClick={handleSearch} disabled={loading} size="lg">
                {loading ? <Loader2 className="animate-spin" /> : <Search className="mr-2" />}
                Search
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {student && (
          <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{student.name}</CardTitle>
                  <CardDescription className="text-primary-foreground/80">Roll #: {student.id} | {student.class}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium opacity-80">Outstanding Balance</p>
                  <p className="text-3xl font-bold">{student.totalFee.toLocaleString()} PKR</p>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length > 0 ? history.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell>{format(income.date, 'PPP')}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">Fee Payment</span>
                            <span className="text-xs text-muted-foreground font-mono">{income.receiptId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {income.amount.toLocaleString()} PKR
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          No payments recorded in the system.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
