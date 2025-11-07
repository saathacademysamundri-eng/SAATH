
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/hooks/use-app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, Printer, X, TrendingDown, Wallet, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Payout } from '@/lib/data';

const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
];

export default function AcademySharePage() {
  const { academyShare, expenses, loading: isAppLoading } = useAppContext();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();
  const router = useRouter();
  
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set(academyShare.map(p => p.payoutDate.getFullYear().toString()));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [academyShare]);

  const filteredAcademyShare = useMemo(() => {
    if (!selectedYear) return academyShare;

    return academyShare.filter(share => {
      const shareYear = share.payoutDate.getFullYear().toString();
      const shareMonth = (share.payoutDate.getMonth() + 1).toString();
      
      if (selectedYear && !selectedMonth) {
        return shareYear === selectedYear;
      }
      if (selectedYear && selectedMonth) {
        return shareYear === selectedYear && shareMonth === selectedMonth;
      }
      return true;
    });
  }, [academyShare, selectedYear, selectedMonth]);

  const shareByTeacher = useMemo(() => {
    if (isAppLoading) return [];

    const shareMap = new Map<string, { teacherName: string; teacherId: string; totalShare: number }>();

    filteredAcademyShare.forEach(share => {
      if (!shareMap.has(share.teacherId)) {
        shareMap.set(share.teacherId, { teacherName: share.teacherName, teacherId: share.teacherId, totalShare: 0 });
      }
      shareMap.get(share.teacherId)!.totalShare += share.amount;
    });

    return Array.from(shareMap.values()).sort((a, b) => b.totalShare - a.totalShare);

  }, [isAppLoading, filteredAcademyShare]);

  const totalAcademyEarnings = useMemo(() => {
    return shareByTeacher.reduce((acc, curr) => acc + curr.totalShare, 0);
  }, [shareByTeacher]);

   const filteredManualExpenses = useMemo(() => {
    const manualExpenses = expenses.filter(e => e.source === 'manual');
    if (!selectedYear) return manualExpenses;

    const filtered = manualExpenses.filter(expense => {
        const expenseYear = expense.date.getFullYear().toString();
        const expenseMonth = (expense.date.getMonth() + 1).toString();
        if (selectedYear && !selectedMonth) return expenseYear === selectedYear;
        if (selectedYear && selectedMonth) return expenseYear === selectedYear && expenseMonth === selectedMonth;
        return true;
    });
    return filtered;
  }, [expenses, selectedYear, selectedMonth]);

  const totalManualExpenses = useMemo(() => {
    return filteredManualExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredManualExpenses]);

  const netAcademyEarnings = totalAcademyEarnings - totalManualExpenses;

  const handleClearFilters = () => {
      setSelectedYear(null);
      setSelectedMonth(null);
  }

  const handlePrint = () => {
    if (isSettingsLoading) {
      toast({ variant: 'destructive', title: 'Please wait', description: 'Settings are still loading.' });
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please allow popups for this site.' });
      return;
    }

    const reportTitle = 'Academy Share Report';
    let dateRangeString = 'All Time';
    if(selectedYear && selectedMonth) {
        const monthName = months.find(m => m.value === selectedMonth)?.label;
        dateRangeString = `For ${monthName}, ${selectedYear}`;
    } else if (selectedYear) {
        dateRangeString = `For Year ${selectedYear}`;
    }

    const shareTableHeaders = ["Teacher", "Total Academy Share"];
    const shareTableRows = shareByTeacher.map(item => `
        <tr>
          <td>${item.teacherName}</td>
          <td style="text-align: right;">${item.totalShare.toLocaleString()} PKR</td>
        </tr>
      `).join('');
    
    const expenseTableHeaders = ["Description", "Category", "Amount"];
    const expenseTableRows = filteredManualExpenses.map(item => `
        <tr>
          <td>${item.description}</td>
          <td>${item.category || 'N/A'}</td>
          <td style="text-align: right;">${item.amount.toLocaleString()} PKR</td>
        </tr>
      `).join('');

    const printHtml = `
      <html>
        <head>
          <title>${reportTitle}</title>
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
            .report-title h2 { font-size: 1.8rem; font-weight: bold; margin: 0 0 0.5rem 0; }
            .report-title p { font-size: 1rem; color: #555; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; text-align: center; }
            .summary-card { padding: 1.5rem; border-radius: 8px; }
            .summary-card p { margin: 0; font-size: 1.1rem; color: #555; }
            .summary-card .amount { font-size: 2rem; font-weight: bold; margin-top: 0.5rem; }
            .income { background-color: #e8f5e9; }
            .income .amount { color: #2e7d32; }
            .expense { background-color: #ffebee; }
            .expense .amount { color: #c62828; }
            .net { background-color: #e3f2fd; }
            .net .amount { color: #1565c0; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; margin-bottom: 2rem; }
            th, td { padding: 8px 10px; border: 1px solid #ddd; }
            th { font-weight: bold; background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
             .final-summary { margin-top: 2rem; float: right; width: 50%; }
             .final-summary th { text-align: left; }
             .final-summary td { text-align: right; }
             h3.table-title { font-size: 1.2rem; font-weight: bold; margin: 2rem 0 1rem 0; }
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
              <h2>${reportTitle}</h2>
              <p>${dateRangeString}</p>
            </div>
             <div class="summary-grid">
                <div class="summary-card income">
                    <p>Total Academy Earnings</p>
                    <p class="amount">${totalAcademyEarnings.toLocaleString()} PKR</p>
                </div>
                 <div class="summary-card expense">
                    <p>Total Manual Expenses</p>
                    <p class="amount">${totalManualExpenses.toLocaleString()} PKR</p>
                </div>
                <div class="summary-card net">
                    <p>Net Academy Earnings</p>
                    <p class="amount">${netAcademyEarnings.toLocaleString()} PKR</p>
                </div>
            </div>

            <h3 class="table-title">Share Per Teacher</h3>
            <table>
              <thead>
                <tr>
                  ${shareTableHeaders.map(h => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${shareTableRows.length > 0 ? shareTableRows : `<tr><td colspan="${shareTableHeaders.length}" style="text-align: center;">No data for this period.</td></tr>`}
              </tbody>
            </table>
            
             <h3 class="table-title">Manual Expense Breakdown</h3>
             <table>
              <thead>
                <tr>
                  ${expenseTableHeaders.map(h => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${expenseTableRows.length > 0 ? expenseTableRows : `<tr><td colspan="${expenseTableHeaders.length}" style="text-align: center;">No manual expenses for this period.</td></tr>`}
              </tbody>
            </table>

            <table class="final-summary">
                <tr><th>Total Academy Share</th><td>${totalAcademyEarnings.toLocaleString()} PKR</td></tr>
                <tr><th>Total Manual Expenses</th><td>${totalManualExpenses.toLocaleString()} PKR</td></tr>
                <tr style="font-weight: bold; border-top: 2px solid #333;"><th>Net Earnings</th><td>${netAcademyEarnings.toLocaleString()} PKR</td></tr>
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Academy Share</h1>
            <p className="text-muted-foreground">
                An overview of the academy's revenue share from teacher earnings.
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Select value={selectedYear || ''} onValueChange={(v) => setSelectedYear(v)}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {availableYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedMonth || ''} onValueChange={(v) => setSelectedMonth(v)} disabled={!selectedYear}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Month (All)" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {(selectedYear || selectedMonth) && <Button variant="ghost" size="icon" onClick={handleClearFilters}><X className="h-4 w-4" /></Button>}
             <Button onClick={handlePrint} disabled={isSettingsLoading}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <TrendingUp />
                  Total Academy Earnings
              </CardTitle>
              <CardDescription>
                  The cumulative 30% share from all teacher payouts
                  {selectedYear && !selectedMonth && ` for ${selectedYear}`}
                  {selectedYear && selectedMonth && ` for ${months.find(m => m.value === selectedMonth)?.label}, ${selectedYear}`}.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-4xl font-bold text-primary">{totalAcademyEarnings.toLocaleString()} PKR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="text-destructive" />
                  Total Manual Expenses
              </CardTitle>
              <CardDescription>
                  Operational costs like utility bills for the selected period.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-4xl font-bold text-destructive">{totalManualExpenses.toLocaleString()} PKR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Wallet className="text-green-600" />
                  Net Academy Earnings
              </CardTitle>
              <CardDescription>
                  The academy's final profit after deducting manual expenses.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-4xl font-bold text-green-600">{netAcademyEarnings.toLocaleString()} PKR</p>
          </CardContent>
        </Card>
      </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Share per Teacher</CardTitle>
          <CardDescription>
            The total revenue share generated for the academy by each teacher for the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead className="text-right">Total Academy Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shareByTeacher.map(({ teacherName, teacherId, totalShare }) => (
                <TableRow key={teacherId} className="cursor-pointer" onClick={() => router.push(`/teachers/${teacherId}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{teacherName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{teacherName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {totalShare.toLocaleString()} PKR
                  </TableCell>
                </TableRow>
              ))}
              {shareByTeacher.length === 0 && (
                <TableRow>
                    <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                        No payout data available for the selected period.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen />
            Manual Expense Breakdown
          </CardTitle>
          <CardDescription>
            A detailed list of all manually entered expenses for the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManualExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {expense.amount.toLocaleString()} PKR
                  </TableCell>
                </TableRow>
              ))}
              {filteredManualExpenses.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                        No manual expenses recorded for this period.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
