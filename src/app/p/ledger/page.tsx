'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudent, getIncomeByStudent } from '@/lib/firebase/firestore';
import { useSettings } from '@/hooks/use-settings';
import { Student, Income } from '@/lib/data';
import { Search, Loader2, Wallet, Receipt, AlertCircle, History, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function PublicLedgerSearchPage() {
  const { settings } = useSettings();
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
        // Manual sorting since we want to avoid extra Firestore indexes for public access
        const sortedHistory = incomeData.sort((a, b) => b.date.getTime() - a.date.getTime());
        setHistory(sortedHistory);
      } else {
        setError('Student not found. Please verify the roll number.');
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = useMemo(() => history.reduce((sum, item) => sum + item.amount, 0), [history]);
  const lastPaymentDate = history.length > 0 ? history[0].date : null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-emerald-50 text-[#059669] mb-4 shadow-sm border border-emerald-100">
            <Receipt className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Fee Ledger Search</h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">Track your payment history and check outstanding dues instantly.</p>
        </header>

        <Card className="mb-12 shadow-xl border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-24 z-40">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Enter Student Roll Number (e.g. S001)" 
                  value={rollNo} 
                  onChange={(e) => setRollNo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-lg h-14 pl-12 border-2 border-slate-100 focus:border-[#059669] focus:ring-[#059669]/20 rounded-xl bg-white shadow-inner"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading} 
                className="h-14 px-8 text-lg font-bold rounded-xl bg-[#059669] hover:bg-[#059669]/90 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                Search Ledger
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {student && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900 text-white shadow-xl rounded-3xl border-0 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Wallet size={80} />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest">Balance Due</CardDescription>
                  <CardTitle className="text-3xl font-black tracking-tight">{student.totalFee.toLocaleString()} PKR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 w-fit">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    Pending Clearance
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-xl rounded-3xl border-slate-100 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-emerald-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp size={80} />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-500 font-bold text-xs uppercase tracking-widest">Life-time Paid</CardDescription>
                  <CardTitle className="text-3xl font-black tracking-tight text-[#059669]">{totalPaid.toLocaleString()} PKR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Last payment: {lastPaymentDate ? format(lastPaymentDate, 'MMM d, yyyy') : 'N/A'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-xl rounded-3xl border-slate-100 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-blue-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
                  <Receipt size={80} />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-500 font-bold text-xs uppercase tracking-widest">Transactions</CardDescription>
                  <CardTitle className="text-3xl font-black tracking-tight text-[#1e40af]">{history.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <History className="h-3.5 w-3.5" />
                    Total records found
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white shadow-2xl rounded-3xl border-slate-100 overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Payment Statement</CardTitle>
                  <CardDescription className="font-medium">Complete record of financial transactions for {student.name}.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => window.print()} className="rounded-full text-slate-400 hover:text-[#1e40af]">
                  <Printer className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                      <TableHead className="py-5 pl-8 text-slate-600 font-bold uppercase tracking-wider text-[11px]">Receipt Date</TableHead>
                      <TableHead className="text-slate-600 font-bold uppercase tracking-wider text-[11px]">Description</TableHead>
                      <TableHead className="text-slate-600 font-bold uppercase tracking-wider text-[11px]">Transaction ID</TableHead>
                      <TableHead className="text-right pr-8 text-slate-600 font-bold uppercase tracking-wider text-[11px]">Amount Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length > 0 ? history.map((income) => (
                      <TableRow key={income.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                        <TableCell className="py-5 pl-8 text-slate-800 font-medium">{format(income.date, 'PPP')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="font-semibold text-slate-900">Fee Payment</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-400 font-bold">{income.receiptId}</TableCell>
                        <TableCell className="text-right pr-8">
                          <span className="text-lg font-black text-[#059669]">{income.amount.toLocaleString()} PKR</span>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                            <History size={48} className="opacity-20" />
                            <p className="font-semibold">No transactions found in system.</p>
                          </div>
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
    </div>
  );
}
