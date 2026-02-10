
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Receipt, Wallet, Calendar, ArrowRight, Loader2, CreditCard, History } from 'lucide-react';
import { getStudent, getIncome } from '@/lib/firebase/firestore';
import { Student, Income } from '@/lib/data';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function PublicLedgerPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [history, setHistory] = useState<Income[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    const term = search.trim();
    if (!term) return;

    setLoading(true);
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
      let rollNo = term.toUpperCase();
      if (!rollNo.startsWith('S')) rollNo = `S${rollNo.padStart(3, '0')}`;

      const studentData = await getStudent(rollNo);
      if (studentData) {
        setStudent(studentData);
        const allIncome = await getIncome();
        const studentIncome = allIncome.filter(i => i.studentId === studentData.id);
        setHistory(studentIncome);
      } else {
        toast({ variant: 'destructive', title: 'STUDENT NOT FOUND', description: `NO RECORD FOR ROLL NUMBER: ${rollNo}` });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'CONNECTION ERROR', description: 'FAILED TO SYNC WITH DATABASE.' });
      const searchTerm = rollNo.trim().toUpperCase();
      let searchId = searchTerm;
      
      if (/^\d+$/.test(searchTerm)) {
        searchId = `S${searchTerm.padStart(3, '0')}`;
      } else if (!searchTerm.startsWith('S')) {
        searchId = `S${searchTerm.replace(/\D/g, '').padStart(3, '0')}`;
      }

      const studentData = await getStudent(searchId);

      if (studentData) {
        setStudent(studentData);
        const incomeData = await getIncomeByStudent(studentData.id);
        setHistory(incomeData.sort((a, b) => b.date.getTime() - a.date.getTime()));
      } else {
        setError('Record not found. Please verify your Roll Number.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = useMemo(() => history.reduce((sum, item) => sum + item.amount, 0), [history]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-4 sm:px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight leading-none">SAATH &nbsp; ACADEMY</span>
            <span className="text-sm font-black text-emerald-600 tracking-[0.3em] uppercase">SAMUNDRI</span>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">OFFICIAL STUDENT PORTAL</p>
            <p className="text-xs font-black text-slate-600 uppercase">FINANCIAL STATEMENT</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-emerald-50 text-emerald-600 mb-4 shadow-sm border border-emerald-100">
            <Receipt className="h-10 w-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase">FINANCIAL LEDGER</h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">TRACK YOUR FEE PAYMENTS AND OUTSTANDING BALANCE</p>
        </div>

        <Card className="mb-8 border-2 border-slate-200 shadow-xl overflow-hidden rounded-3xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="ENTER ROLL NUMBER (E.G. 001 OR S001)"
                  className="pl-12 h-14 text-lg font-black text-slate-950 border-2 border-slate-200 focus:border-primary rounded-2xl placeholder:text-slate-300 uppercase"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading} 
                className="h-14 px-8 rounded-2xl font-black text-base transition-all hover:scale-[1.02]"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'CHECK STATEMENT'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {student && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <Card className="border-2 border-slate-200 rounded-3xl overflow-hidden shadow-lg bg-white">
              <CardHeader className="bg-slate-900 text-white p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight uppercase">{student.name}</CardTitle>
                    <CardDescription className="text-slate-400 font-bold uppercase tracking-widest mt-1">
                      ROLL NO: {student.id} | CLASS: {student.class}
                    </CardDescription>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 font-black text-xs tracking-widest uppercase">
                    STUDENT ACCOUNT ACTIVE
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-b">
                  <div className="p-8 text-center bg-emerald-50/30">
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mb-2 uppercase">LIFETIME PAID</p>
                    <p className="text-4xl font-black text-emerald-600 tracking-tighter">{totalPaid.toLocaleString()} PKR</p>
                  </div>
                  <div className="p-8 text-center bg-rose-50/30">
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mb-2 uppercase">OUTSTANDING DUES</p>
                    <p className="text-4xl font-black text-rose-600 tracking-tighter">{student.totalFee.toLocaleString()} PKR</p>
                  </div>
                  <div className="p-8 text-center bg-indigo-50/30">
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mb-2 uppercase">MONTHLY FEE</p>
                    <p className="text-4xl font-black text-indigo-600 tracking-tighter">{student.monthlyFee.toLocaleString()} PKR</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-black text-slate-900 uppercase ml-2">
                <History className="h-6 w-6 text-primary" /> TRANSACTION HISTORY
              </h3>
              <Card className="border-2 border-slate-200 rounded-3xl overflow-hidden shadow-md">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-black uppercase text-[10px] tracking-widest py-6 px-6">PAYMENT DATE</TableHead>
                          <TableHead className="font-black uppercase text-[10px] tracking-widest">DESCRIPTION</TableHead>
                          <TableHead className="font-black uppercase text-[10px] tracking-widest">RECEIPT NO</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest px-6">AMOUNT (PKR)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.length > 0 ? history.map((item) => (
                          <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-bold py-5 px-6 uppercase text-xs">{format(item.date, 'PPP').toUpperCase()}</TableCell>
                            <TableCell className="font-black text-slate-600 text-xs">MONTHLY TUITION FEE PAYMENT</TableCell>
                            <TableCell className="font-mono font-bold text-slate-400 text-xs">{item.receiptId || item.id.substring(0, 8)}</TableCell>
                            <TableCell className="text-right font-black text-emerald-600 px-6">{item.amount.toLocaleString()}</TableCell>
                          </TableRow>
                        )) : (
                          <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-400 font-bold uppercase text-xs">NO TRANSACTIONS FOUND FOR THIS SESSION.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center space-y-2 border-t pt-12 pb-12 px-4">
        <p className="text-sm text-slate-500 font-black uppercase tracking-wider">
          © 2026 SAATH ACADEMY SAMUNDRI. ALL RIGHTS RESERVED.
        </p>
        <p className="text-xs text-slate-400 font-mono font-black tracking-[0.2em] uppercase">
          POWERED BY SCHOOLUP PLATFORM
        </p>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">
          DEVELOPED BY MIAN MUDASSAR
        </p>
      </footer>
    </div>
  );
}
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
        <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto font-medium text-center">Live fee tracking and payment history.</p>
      </header>

      <Card className="mb-8 shadow-xl border-slate-200/60 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-white">
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
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">Life-time Paid</p>
                <CardTitle className="text-3xl sm:text-4xl font-black tracking-tight text-[#059669]">{totalPaid.toLocaleString()} PKR</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Collections</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl rounded-3xl border-slate-100 border-b-4 border-b-[#1e40af]">
              <CardHeader className="pb-2">
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">Transactions</p>
                <CardTitle className="text-3xl sm:text-4xl font-black tracking-tight text-[#1e40af]">{history.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Successful Payments</p>
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
