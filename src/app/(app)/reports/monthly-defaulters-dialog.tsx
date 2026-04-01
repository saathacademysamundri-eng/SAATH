
'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getStudents, getIncome } from '@/lib/firebase/firestore';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Loader2, Printer, FileDown, AlertCircle, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAppContext } from '@/hooks/use-app-context';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSettings } from '@/hooks/use-settings';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Student, Income } from '@/lib/data';

const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(0, i), 'MMMM') }));
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export function MonthlyDefaultersDialog() {
    const { classes } = useAppContext();
    const { settings, isSettingsLoading } = useSettings();
    const { toast } = useToast();

    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    
    const [defaulters, setDefaulters] = useState<(Student & { paidAmount: number })[]>([]);
    const [hasGenerated, setHasGenerated] = useState(false);

    const handleGenerate = async () => {
        if (!selectedClassId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a class.' });
            return;
        }

        setIsLoading(true);
        try {
            const [allStudents, allIncome] = await Promise.all([getStudents(), getIncome()]);
            
            const className = classes.find(c => c.id === selectedClassId)?.name;
            const classStudents = allStudents.filter(s => s.class === className && s.status === 'active');
            
            const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
            
            const monthlyDefaulters = classStudents.map(student => {
                const studentMonthlyIncome = allIncome.filter(i => 
                    i.studentId === student.id && 
                    (i.forMonth === monthKey || format(i.date, 'yyyy-MM') === monthKey)
                );
                
                const totalPaidForMonth = studentMonthlyIncome.reduce((sum, inc) => sum + inc.amount, 0);
                
                return {
                    ...student,
                    paidAmount: totalPaidForMonth
                };
            }).filter(s => s.paidAmount < s.monthlyFee);

            setDefaulters(monthlyDefaulters.sort((a, b) => a.id.localeCompare(b.id)));
            setHasGenerated(true);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate report.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        if (!hasGenerated || defaulters.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const className = classes.find(c => c.id === selectedClassId)?.name || '';
        const monthName = months.find(m => m.value === selectedMonth)?.label;

        const tableRows = defaulters.map((s, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${s.fatherName}</td>
                <td>${s.phone}</td>
                <td style="text-align: right;">${s.monthlyFee.toLocaleString()}</td>
                <td style="text-align: right;">${s.paidAmount.toLocaleString()}</td>
                <td style="text-align: right; color: red; font-weight: bold;">${(s.monthlyFee - s.paidAmount).toLocaleString()}</td>
            </tr>
        `).join('');

        const totalRemaining = defaulters.reduce((sum, s) => sum + (s.monthlyFee - s.paidAmount), 0);

        const printHtml = `
            <html>
                <head>
                    <title>Defaulters Report - ${className}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .summary { margin-top: 30px; text-align: right; font-size: 16px; font-weight: bold; }
                        .footer { text-align: center; font-size: 10px; margin-top: 50px; color: #888; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Monthly Defaulters Report</h1>
                        <p>${className} | ${monthName} ${selectedYear}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Roll #</th>
                                <th>Student Name</th>
                                <th>Father's Name</th>
                                <th>Phone</th>
                                <th style="text-align: right;">Expect Fee</th>
                                <th style="text-align: right;">Paid</th>
                                <th style="text-align: right;">Remaining</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                    <div class="summary">
                        Total Unpaid for ${monthName}: ${totalRemaining.toLocaleString()} PKR
                    </div>
                    <div class="footer">Copyright &copy; ${new Date().getFullYear()} ${settings.name}</div>
                </body>
            </html>
        `;
        printWindow.document.write(printHtml);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    const handleExport = () => {
        if (!hasGenerated) return;
        const className = classes.find(c => c.id === selectedClassId)?.name || '';
        const monthName = months.find(m => m.value === selectedMonth)?.label;
        const filename = `Defaulters-${className}-${monthName}-${selectedYear}.csv`;

        const headers = ["Roll #", "Name", "Father's Name", "Phone", "Monthly Fee", "Paid Amount", "Remaining"];
        const rows = defaulters.map(s => [
            s.id, s.name, s.fatherName, s.phone, s.monthlyFee, s.paidAmount, s.monthlyFee - s.paidAmount
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', filename);
        link.click();
    };

    return (
        <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Monthly Defaulters Report</DialogTitle>
                <DialogDescription>
                    Identify students in a specific class who have not cleared their dues for a selected month.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-4 items-end py-4 border-b">
                <div className="space-y-2">
                    <Label>Class</Label>
                    <Select onValueChange={setSelectedClassId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select class..." />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Month</Label>
                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleGenerate} disabled={isLoading || !selectedClassId}>
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
                    Find Defaulters
                </Button>
            </div>

            <div className="flex-1 overflow-auto py-4">
                {isLoading ? (
                    <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                ) : hasGenerated ? (
                    defaulters.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Roll #</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Expected</TableHead>
                                    <TableHead>Paid</TableHead>
                                    <TableHead className="text-right">Unpaid Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {defaulters.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-bold">{s.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{s.name}</div>
                                            <div className="text-xs text-muted-foreground">{s.phone}</div>
                                        </TableCell>
                                        <TableCell>{s.monthlyFee.toLocaleString()}</TableCell>
                                        <TableCell className="text-green-600 font-bold">{s.paidAmount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-destructive font-black">
                                            {(s.monthlyFee - s.paidAmount).toLocaleString()} PKR
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                            <p>No defaulters found for this period. Great job!</p>
                        </div>
                    )
                ) : (
                    <div className="h-40 flex items-center justify-center text-muted-foreground">
                        Select a class and month to generate the report.
                    </div>
                )}
            </div>

            <DialogFooter className="border-t pt-4">
                <DialogClose asChild>
                    <Button variant="ghost">Close</Button>
                </DialogClose>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport} disabled={!hasGenerated || defaulters.length === 0}>
                        <FileDown className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Button onClick={handlePrint} disabled={!hasGenerated || defaulters.length === 0}>
                        <Printer className="mr-2 h-4 w-4" /> Print Defaulters
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    );
}
