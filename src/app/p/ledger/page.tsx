'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudent, getIncomeByStudent } from '@/lib/firebase/firestore';
import { Student, Income } from '@/lib/data';
import { Search, Loader2, Wallet, Receipt, AlertCircle, History, TrendingUp, Printer, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function PublicLedgerSearchPage() {
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
      const searchTerm = rollNo.trim().toUpperCase();
      let searchId = searchTerm;
      
      if (/^\d+$/.test(searchTerm)) {
        searchId = `S${searchTerm.padStart(3, '0')}`;
      }

      let studentData = await getStudent(searchId);
      if (!studentData && searchId !== searchTerm) {
        studentData = await getStudent(searchTerm);
      }

      if (studentData) {
        setStudent(studentData);
        const incomeData = await getIncomeByStudent(studentData.id);
        const sortedHistory = [...incomeData].sort((a, b) => b.date.getTime() - a.date.getTime());
        setHistory(sortedHistory);
      } else {
        setError('No student record found. Please verify your Roll Number.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalPaid = history.reduce((sum, item) => sum + item.amount, 0);
    const lastPayment = history.length > 0 ? history[0] : null;
    return {
      totalPaid,
      transactionCount: history.length,
      lastPaymentDate: lastPayment?.date || null,
      lastPaymentAmount: lastPayment?.amount || 0
    };
  }, [history]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-emerald-50 text-[#059669] mb-6 shadow-sm border border-emerald-100">
          <Receipt className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Financial Statement</h1>
        <p className="text-lg text-slate-600 max-w-md mx-auto">Access your complete payment history and real-time dues statement.</p>
      </header>

      <Card className="mb-12 shadow-xl border-slate-200/60 bg-white overflow-hidden rounded-[2rem]">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Enter Roll Number (e.g. S001)" 
                value={rollNo} 
                onChange={(e) => setRollNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-lg h-16 pl-12 border-2 border-slate-100 focus:border-[#1e40af] focus:ring-[#1e40af]/10 rounded-2xl bg-slate-50/50 font-semibold text-slate-900"
              />
            </div>
            <button 
              onClick={handleSearch} 
              disabled={loading} 
              className="h-16 px-10 text-lg font-bold rounded-2xl bg-[#059669] text-white hover:bg-[#047857] shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <Search className="mr-3 h-6 w-6" />}
              Search Statement
            </button>
          </div>
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {student && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#0f172a] text-white shadow-xl rounded-[2rem] border-0 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Wallet size={90} />
              </div>
              <CardHeader className="pb-2">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Outstanding Balance</p>
                <CardTitle className="text-4xl font-black tracking-tight">{student.totalFee.toLocaleString()} PKR</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={cn("bg-opacity-20 border-0 font-bold py-1 px-3", student.totalFee > 0 ? "bg-amber-500 text-amber-400" : "bg-emerald-500 text-emerald-400")}>
                  <span className={cn("h-2 w-2 rounded-full mr-2", student.totalFee > 0 ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
                  {student.totalFee > 0 ? "Payment Due" : "Fully Cleared"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl rounded-[2rem] border-slate-100 relative group overflow-hidden border-b-4 border-b-[#059669]">
              <div className="absolute top-0 right-0 p-6 text-emerald-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp size={90} />
              </div>
              <CardHeader className="pb-2">
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Lifetime Payments</p>
                <CardTitle className="text-4xl font-black tracking-tight text-[#059669]">{stats.totalPaid.toLocaleString()} PKR</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Last Pay: {stats.lastPaymentDate ? format(stats.lastPaymentDate, 'MMM d, yyyy') : 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl rounded-[2rem] border-slate-100 relative group overflow-hidden border-b-4 border-b-[#1e40af]">
              <div className="absolute top-0 right-0 p-6 text-blue-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
                <History size={90} />
              </div>
              <CardHeader className="pb-2">
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Success Receipts</p>
                <CardTitle className="text-4xl font-black tracking-tight text-[#1e40af]">{stats.transactionCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1e40af]" />
                  Total verified transactions
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-2xl rounded-[2.5rem] border-slate-100 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-[#1e40af] text-white flex items-center justify-center text-2xl font-black shadow-lg">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">{student.name}</CardTitle>
                  <CardDescription className="font-bold text-slate-500 mt-1 uppercase tracking-wide">
                    {student.id} • {student.class} {student.section && `• SEC ${student.section}`}
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={() => window.print()} className="rounded-xl border-2 border-slate-200 font-bold px-6 h-12 hover:bg-[#0f172a] hover:text-white transition-all">
                <Printer className="mr-2 h-5 w-5" />
                Print Statement
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-b-2">
                      <TableHead className="py-6 pl-10 text-slate-600 font-black uppercase tracking-widest text-[11px]">Transaction Date</TableHead>
                      <TableHead className="text-slate-600 font-black uppercase tracking-widest text-[11px]">Payment Type</TableHead>
                      <TableHead className="text-slate-600 font-black uppercase tracking-widest text-[11px]">Receipt ID</TableHead>
                      <TableHead className="text-right pr-10 text-slate-600 font-black uppercase tracking-widest text-[11px]">Credit (PKR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length > 0 ? history.map((income) => (
                      <TableRow key={income.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                        <TableCell className="py-6 pl-10 text-slate-800 font-bold">{format(income.date, 'PPP')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="font-black text-slate-900 uppercase text-xs">Academy Tuition</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            {income.receiptId || 'OFF-REC-00'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-10">
                          <span className="text-xl font-black text-[#059669]">{income.amount.toLocaleString()}</span>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-60 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4 text-slate-300">
                            <div className="p-6 bg-slate-50 rounded-full">
                              <History size={64} className="opacity-40" />
                            </div>
                            <p className="font-black text-xl uppercase tracking-tight text-slate-400">No History Found</p>
                            <p className="text-sm font-medium text-slate-400">Please search for a valid roll number to view records.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
