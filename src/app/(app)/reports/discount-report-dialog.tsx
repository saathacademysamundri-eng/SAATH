'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Printer, Trash2, Search, X } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { getDiscounts, deleteDiscount } from '@/lib/firebase/firestore';
import type { Discount } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function DiscountReportDialog() {
    const { settings, isSettingsLoading } = useSettings();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            const data = await getDiscounts();
            setDiscounts(data);
        } catch (e) {
            console.error("Failed to fetch discount data:", e);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchReportData();
    }, []);

    const filteredDiscounts = useMemo(() => {
        return discounts.filter(d => 
            d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.month.includes(searchTerm)
        );
    }, [discounts, searchTerm]);

    const totalDiscounted = useMemo(() => {
        return filteredDiscounts.reduce((sum, d) => sum + d.amount, 0);
    }, [filteredDiscounts]);

    const handleDelete = async (id: string) => {
        const result = await deleteDiscount(id);
        if (result.success) {
            toast({ title: 'Discount Reversed', description: result.message });
            fetchReportData();
        } else {
            toast({ variant: 'destructive', title: 'Action Failed', description: result.message });
        }
    };

    const handlePrint = () => {
        if (isSettingsLoading || filteredDiscounts.length === 0) {
            toast({ variant: 'destructive', title: 'Cannot Print', description: 'No discount data to print.' });
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please allow popups for this site.' });
            return;
        }

        const tableRows = filteredDiscounts.map(d => `
            <tr>
                <td>${format(d.date, 'PPP')}</td>
                <td>${d.studentName}</td>
                <td>${d.studentId}</td>
                <td>${d.phone}</td>
                <td>${d.month}</td>
                <td style="text-align: right;">${d.amount.toLocaleString()} PKR</td>
            </tr>
        `).join('');

        const reportHtml = `
            <html>
                <head>
                    <title>Fee Discount Report - ${format(new Date(), 'PPP')}</title>
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; margin: 20px; }
                        .report-container { max-width: 1000px; margin: auto; display: flex; flex-direction: column; min-height: 95vh; }
                        .content-wrap { flex: 1; }
                        .academy-details { text-align: center; margin-bottom: 1.5rem; }
                        .academy-details img { max-height: 60px; margin-bottom: 0.5rem; }
                        h1 { font-size: 1.5rem; margin: 0; }
                        .report-title { text-align: center; margin-bottom: 2rem; }
                        h2 { font-size: 1.8rem; margin-bottom: 0.5rem; }
                        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .summary { margin-top: 2rem; text-align: right; }
                        .footer { text-align: center; font-size: 0.8rem; color: #888; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                      <div class="content-wrap">
                        <div class="academy-details">
                            ${settings.logo ? `<img src="${settings.logo}" alt="Logo">` : ''}
                            <h1>${settings.name}</h1>
                        </div>
                        <div class="report-title">
                            <h2>Fee Discount Report</h2>
                            <p>Generated on ${format(new Date(), 'PPP')}</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Student</th>
                                    <th>Roll #</th>
                                    <th>Phone</th>
                                    <th>Month</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                        <div class="summary">
                            <h3>Total Discounts Given: ${totalDiscounted.toLocaleString()} PKR</h3>
                        </div>
                      </div>
                      <div class="footer">
                          Copyright &copy; ${new Date().getFullYear()} ${settings.name}. Developed by SchoolUP.
                      </div>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(reportHtml);
        printWindow.document.close();
    };


    return (
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-5xl max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden">
            <DialogHeader className="flex-shrink-0">
                <DialogTitle>Fee Discount Audit Report</DialogTitle>
                <DialogDescription>
                    A full audit trail of manual discounts granted to students.
                </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-4 py-4 flex-1 overflow-hidden">
                <div className="relative flex-shrink-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search student, ID, or month..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <div className="border rounded-md overflow-hidden flex-1 flex flex-col bg-background">
                    <div className="overflow-x-auto overflow-y-auto flex-1">
                        <Table className="min-w-[600px] sm:min-w-full">
                            <TableHeader className="sticky top-0 bg-secondary z-10">
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Date</TableHead>
                                    <TableHead className="whitespace-nowrap">Student</TableHead>
                                    <TableHead className="whitespace-nowrap">Roll #</TableHead>
                                    <TableHead className="whitespace-nowrap">Phone</TableHead>
                                    <TableHead className="whitespace-nowrap">Month</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                                    <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredDiscounts.length > 0 ? (
                                    filteredDiscounts.map(d => (
                                        <TableRow key={d.id} className="hover:bg-muted/50">
                                            <TableCell className="text-[10px] sm:text-xs whitespace-nowrap">{format(d.date, 'PP')}</TableCell>
                                            <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{d.studentName}</TableCell>
                                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">{d.studentId}</TableCell>
                                            <TableCell className="text-[10px] sm:text-xs whitespace-nowrap">{d.phone}</TableCell>
                                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">{d.month}</TableCell>
                                            <TableCell className="text-right font-mono font-bold text-amber-600 text-xs sm:text-sm whitespace-nowrap">
                                                {d.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="w-[90vw] max-w-md rounded-xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Reverse this discount?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the record and <strong>add {d.amount.toLocaleString()} PKR back</strong> to {d.studentName}'s outstanding dues.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                                                            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(d.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Confirm Reversal
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            No discount records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                
                {!isLoading && filteredDiscounts.length > 0 && (
                    <div className="flex justify-end p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30 flex-shrink-0">
                        <p className="text-sm sm:text-lg font-bold">Total Discounted: <span className="text-amber-600">{totalDiscounted.toLocaleString()} PKR</span></p>
                    </div>
                )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t flex-shrink-0">
                <DialogClose asChild>
                    <Button variant="ghost" className="w-full sm:w-auto">Close</Button>
                </DialogClose>
                 <Button onClick={handlePrint} variant="default" className="w-full sm:w-auto" disabled={isLoading || filteredDiscounts.length === 0 || isSettingsLoading}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Full Report
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
