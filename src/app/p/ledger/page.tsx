'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudent, getIncomeByStudent } from '@/lib/firebase/firestore';
import { Student, Income } from '@/lib/data';
import { Search, Loader2, Wallet, Receipt, AlertCircle, Printer } from 'lucide-react';
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

      const studentData = await getStudent(searchId);

      if (studentData) {
        setStudent(studentData);
        // Simplified fetching to avoid index issues
        const incomeData = await getIncomeByStudent(studentData.id);
        // Client-side sort
        const sortedHistory = [...incomeData].sort((a, b) => b.date.getTime() - a.date.getTime());
        setHistory(sortedHistory);
      } else {
        setError('Record not found. Please check your Roll Number.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = useMemo(() => {
    return history.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [history]);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
      <header className="mb-8 sm:mb-12 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-emerald-50 text-[#059669] mb-4 shadow-sm border border-emerald-100">
          <Receipt className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Financial Statement</h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto">Live fee tracking and payment history.</p>
      </header>

      <Card className="mb-8 shadow-xl border-slate-200/60 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Enter Roll Number (e.g. S001)" 
                value={rollNo} 
                onChange={(e) => setRollNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-lg sm:text-xl h-14 sm:h-16 pl-12 border-2 border-slate-100 focus:border-[#1e40af] focus:ring-[#1e40af]/10 rounded-xl sm:rounded-2xl bg-slate-50/50 font-black text-slate-950 placeholder:text-slate-400"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading} 
              className="h-14 sm:h-16 px-8 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-[#059669] text-white hover:bg-[#047857] shadow-lg transition-all"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
              Search
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {student && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-[#0f172a] text-white shadow-xl rounded-3xl border-0 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-10"><Wallet size={80} /></div>
              <CardHeader className="pb-2">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Balance Due</p>
                <CardTitle className="text-3xl sm:text-4xl font-black tracking-tight">{(student.totalFee || 0).toLocaleString()} PKR</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={cn("bg-opacity-20 border-0 font-bold", (student.totalFee || 0) > 0 ? "bg-amber-500 text-amber-400" : "bg-emerald-500 text-emerald-400")}>
                  {(student.totalFee || 0) > 0 ? "Pending" : "Cleared"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl rounded-3xl border-slate-100 border-b-4 border-b-[#059669]">
              <CardHeader className="pb-2">
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">Total Paid</p>
                <CardTitle className="text-3xl sm:text-4xl font-black tracking-tight text-[#059669]">{totalPaid.toLocaleString()} PKR</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Life-time Payments</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl rounded-3xl border-slate-100 border-b-4 border-b-[#1e40af]">
              <CardHeader className="pb-2">
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">Total Records</p>
                <CardTitle className="text-3xl sm:text-4xl font-black tracking-tight text-[#1e40af]">{history.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Successful Transactions</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-2xl rounded-[2rem] border-slate-100 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="h-16 w-16 rounded-2xl bg-[#1e40af] text-white flex items-center justify-center text-2xl font-black shadow-lg shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">{student.name}</CardTitle>
                  <CardDescription className="font-bold text-slate-500 mt-1 uppercase tracking-wide text-xs">
                    {student.id} • {student.class}
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={() => window.print()} className="rounded-xl border-2 font-bold px-6 h-12 w-full sm:w-auto hover:bg-[#0f172a] hover:text-white transition-all">
                <Printer className="mr-2 h-5 w-5" />
                Print Statement
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-b-2">
                      <TableHead className="py-6 pl-6 sm:pl-10 text-slate-600 font-black uppercase tracking-widest text-[11px]">Date</TableHead>
                      <TableHead className="text-slate-600 font-black uppercase tracking-widest text-[11px]">Description</TableHead>
                      <TableHead className="text-right pr-6 sm:pr-10 text-slate-600 font-black uppercase tracking-widest text-[11px]">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length > 0 ? history.map((income) => (
                      <TableRow key={income.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                        <TableCell className="py-6 pl-6 sm:pl-10 text-slate-800 font-bold text-sm">{format(income.date, 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="font-black text-slate-900 uppercase text-[10px] sm:text-xs">Fee Payment</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 sm:pr-10">
                          <span className="text-lg sm:text-xl font-black text-[#059669]">{income.amount.toLocaleString()}</span>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-48 text-center">
                          <p className="font-black text-slate-300 uppercase tracking-tight">No Records Found</p>
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
