

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/hooks/use-app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, Printer, X, TrendingDown, Wallet, BookOpen, UserCheck, ChevronsRight } from 'lucide-react';
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
  const { allPayouts, loading: isAppLoading, expenses } = useAppContext();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();
  const router = useRouter();
  
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set(allPayouts.map(p => p.payoutDate.getFullYear().toString()));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [allPayouts]);

  const filteredPayouts = useMemo(() => {
    if (!selectedYear) return allPayouts;

    return allPayouts.filter(payout => {
      const payoutYear = payout.payoutDate.getFullYear().toString();
      const payoutMonth = (payout.payoutDate.getMonth() + 1).toString();
      
      if (selectedYear && !selectedMonth) {
        return payoutYear === selectedYear;
      }
      if (selectedYear && selectedMonth) {
        return payoutYear === selectedYear && payoutMonth === selectedMonth;
      }
      return true;
    });
  }, [allPayouts, selectedYear, selectedMonth]);

  const totalAcademyShare = useMemo(() => {
    return filteredPayouts.reduce((acc, curr) => acc + (curr.academyShare || 0), 0);
  }, [filteredPayouts]);
  
  const totalTeacherPayouts = useMemo(() => {
    return filteredPayouts.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredPayouts]);

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

  const netAcademyEarnings = totalAcademyShare - totalManualExpenses - totalTeacherPayouts;

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
    
    const expenseTableHeaders = ["Description", "Category", "Amount"];
    const expenseTableRows = filteredManualExpenses.map(item => `
        <tr>
          <td>${item.description}</td>
          <td>${item.category || 'N/A'}</td>
          <td style="text-align: right;">${item.amount.toLocaleString()} PKR</td>
        </tr>
      `).join('');
      
    const payoutTableHeaders = ["Teacher", "Payout Date", "Amount"];
    const payoutTableRows = filteredPayouts.map(item => `
        <tr>
          <td>${item.teacherName}</td>
          <td>${format(item.payoutDate, 'PPP')}</td>
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
            .report-container { max-width: 1000px; margin: auto; padding: 20px; display: flex; flex-direction: column; min-height: 95vh; }
            .content-wrap { flex: 1; }
            .academy-details { text-align: center; margin-bottom: 2rem; }
            .academy-details img { height: 60px; margin-bottom: 0.5rem; object-fit: contain; }
            .academy-details h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
            .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
            .report-title { text-align: center; margin: 2rem 0; }
            .report-title h2 { font-size: 1.8rem; font-weight: bold; margin: 0 0 0.5rem 0; }
            .report-title p { font-size: 1rem; color: #555; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; text-align: center; }
            .summary-card { padding: 1.5rem; border-radius: 8px; }
            .summary-card p { margin: 0; font-size: 1.1rem; color: #555; }
            .summary-card .amount { font-size: 2rem; font-weight: bold; margin-top: 0.5rem; }
            .income { background-color: #e8f5e9; }
            .income .amount { color: #2e7d32; }
            .expense { background-color: #ffebee; }
            .expense .amount { color: #c62828; }
            .payout { background-color: #fff3e0; }
            .payout .amount { color: #e65100; }
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
             .footer { text-align: center; font-size: 0.8rem; color: #888; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="content-wrap">
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
                        <p>Total Academy Share</p>
                        <p class="amount">${totalAcademyShare.toLocaleString()} PKR</p>
                    </div>
                    <div class="summary-card payout">
                        <p>Total Teacher Payouts</p>
                        <p class="amount">${totalTeacherPayouts.toLocaleString()} PKR</p>
                    </div>
                    <div class="summary-card expense">
                        <p>Total Manual Expenses</p>
                        <p class="amount">${totalManualExpenses.toLocaleString()} PKR</p>
                    </div>
                    <div class="summary-card net">
                        <p>Net Academy Profit</p>
                        <p class="amount">${netAcademyEarnings.toLocaleString()} PKR</p>
                    </div>
                </div>
                
                <h3 class="table-title">Teacher Payout Breakdown</h3>
                <table>
                    <thead>
                        <tr>
                        ${payoutTableHeaders.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${payoutTableRows.length > 0 ? payoutTableRows : `<tr><td colspan="${payoutTableHeaders.length}" style="text-align: center;">No teacher payouts for this period.</td></tr>`}
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
                    <tr><th>Total Academy Share</th><td>${totalAcademyShare.toLocaleString()} PKR</td></tr>
                    <tr><th>Total Teacher Payouts</th><td>-${totalTeacherPayouts.toLocaleString()} PKR</td></tr>
                    <tr><th>Total Manual Expenses</th><td>-${totalManualExpenses.toLocaleString()} PKR</td></tr>
                    <tr style="font-weight: bold; border-top: 2px solid #333;"><th>Net Profit</th><td>${netAcademyEarnings.toLocaleString()} PKR</td></tr>
                </table>
            </div>
            <div class="footer">
                Copyright &copy; ${new Date().getFullYear()} ${settings.name}. Developed by SchoolUP.
            </div>
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
                An overview of the academy's share from collected student fees after payouts.
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <TrendingUp />
                  Total Academy Share
              </CardTitle>
              <CardDescription>
                  The cumulative 30% share from all payouts for the selected period.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-4xl font-bold text-primary">{totalAcademyShare.toLocaleString()} PKR</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCheck className="text-orange-600" />
                    Total Teacher Payouts
                </CardTitle>
                <CardDescription>
                    The total amount paid out to teachers for the selected period.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold text-orange-600">{totalTeacherPayouts.toLocaleString()} PKR</p>
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
                  Net Academy Profit
              </CardTitle>
              <CardDescription>
                  The academy's final profit after deducting all expenses.
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
                <CardTitle className="flex items-center gap-2">
                    <ChevronsRight />
                    Teacher Payout Breakdown
                </CardTitle>
                <CardDescription>
                    A detailed list of all teacher salary payouts for the selected period.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Payout Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayouts.map((payout) => (
                            <TableRow key={payout.id}>
                                <TableCell className="font-medium">{payout.teacherName}</TableCell>
                                <TableCell>{format(payout.payoutDate, 'PPP')}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {payout.amount.toLocaleString()} PKR
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredPayouts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                    No teacher payouts for this period.
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
