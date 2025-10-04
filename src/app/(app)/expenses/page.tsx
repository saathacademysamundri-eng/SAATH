
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { addExpense, deleteExpense, updateExpense } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MoreHorizontal, PlusCircle, Printer, Trash, Edit, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useAppContext } from '@/hooks/use-app-context';
import { Expense } from '@/lib/data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSettings } from '@/hooks/use-settings';
import { Badge } from '@/components/ui/badge';

function AddExpenseDialog({ onExpenseAdded }: { onExpenseAdded: () => void }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!description.trim() || amount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please provide a valid description and amount.' });
            return;
        }

        setIsSaving(true);
        const result = await addExpense({ description, amount, source: 'manual' });

        if (result.success) {
            toast({ title: 'Expense Added', description: 'The new expense has been recorded.' });
            onExpenseAdded();
        } else {
            toast({ variant: 'destructive', title: 'Failed to Add', description: result.message });
        }
        setIsSaving(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Record a new operational expense.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        placeholder="e.g., Electricity Bill, Staff Salaries"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount (PKR)</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="Enter expense amount"
                        value={amount || ''}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
                        {isSaving ? 'Saving...' : 'Save Expense'}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

function EditExpenseDialog({ expense, onExpenseUpdated }: { expense: Expense, onExpenseUpdated: () => void }) {
    const [description, setDescription] = useState(expense.description);
    const [amount, setAmount] = useState(expense.amount);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        setIsSaving(true);
        const result = await updateExpense(expense.id, { description, amount });
        if (result.success) {
            toast({ title: 'Expense Updated', description: 'The expense record has been updated.' });
            onExpenseUpdated();
        } else {
            toast({ variant: 'destructive', title: 'Update Failed', description: result.message });
        }
        setIsSaving(false);
    }

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-amount">Amount (PKR)</Label>
                    <Input id="edit-amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <DialogClose asChild>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : 'Save Changes'}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

function DeleteExpenseDialog({ expense, onExpenseDeleted }: { expense: Expense, onExpenseDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteExpense(expense.id);
        if (result.success) {
            toast({ title: 'Expense Deleted', description: result.message });
            onExpenseDeleted();
        } else {
            toast({ variant: 'destructive', title: 'Delete Failed', description: result.message });
        }
        setIsDeleting(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                    This action cannot be undone. This will permanently delete the expense record for
                    <span className="font-semibold"> {expense.description} </span>
                    of <span className="font-semibold">{expense.amount.toLocaleString()} PKR</span>.
                </DialogDescription>
            </DialogHeader>
            {expense.source === 'payout' && (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold">Payout Reversal</h4>
                        <p className="text-xs">
                            Deleting this expense will fully reverse the associated teacher payout. The original student fee payments will be voided, and the amounts will be added back to each student's outstanding balance. The teacher's earnings for that period will be reset.
                        </p>
                    </div>
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <DialogClose asChild>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="animate-spin mr-2" /> : 'Confirm Delete'}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

export default function ExpensesPage() {
    const { expenses, loading, refreshData } = useAppContext();
    const { settings, isSettingsLoading } = useSettings();
    const [openDialogs, setOpenDialogs] = useState<{ [key: string]: 'edit' | 'delete' | null }>({});

    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, item) => sum + item.amount, 0);
    }, [expenses]);
    
    const handleActionComplete = () => {
        setOpenDialogs({});
        refreshData();
    }
    
    const handleSetDialog = (id: string, type: 'edit' | 'delete' | null) => {
        setOpenDialogs(prev => ({ ...Object.fromEntries(Object.keys(prev).map(k => [k, null])), [id]: type }));
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const tableRows = expenses.map(item => `
            <tr>
              <td>${format(item.date, 'PPP')}</td>
              <td>${item.description}</td>
              <td>${item.source}</td>
              <td style="text-align: right;">${item.amount.toLocaleString()} PKR</td>
            </tr>
        `).join('');

        const printHtml = `
            <html>
                <head><title>Expense Report</title>
                <style>
                    body { font-family: sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        .print-header { display: block; text-align: center; margin-bottom: 20px; }
                        .print-header img { max-height: 80px; }
                    }
                    .print-header { display: none; }
                </style>
                </head>
                <body>
                    <div class="print-header">
                        ${settings.logo ? `<img src="${settings.logo}" alt="Logo">` : ''}
                        <h1>${settings.name}</h1>
                        <h2>Expense Report</h2>
                    </div>
                    <table>
                        <thead>
                            <tr><th>Date</th><th>Description</th><th>Source</th><th style="text-align: right;">Amount</th></tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                    <h3>Total Expenses: ${totalExpenses.toLocaleString()} PKR</h3>
                </body>
            </html>
        `;

        printWindow.document.write(printHtml);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
    };

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
                <p className="text-muted-foreground">
                    A record of all operational expenses.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handlePrint} variant="outline" disabled={isSettingsLoading}>
                    <Printer className="mr-2" /> Print Report
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2" /> Add Expense
                        </Button>
                    </DialogTrigger>
                    <AddExpenseDialog onExpenseAdded={refreshData} />
                </Dialog>
            </div>
        </div>
      <Card>
        <CardHeader>
            <CardTitle>Expense Report</CardTitle>
            <CardDescription>
                List of all recorded expenses. Total expenses are
                <span className="font-bold text-red-600"> {totalExpenses.toLocaleString()} PKR</span>.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Amount (PKR)</TableHead>
                        <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                        ))
                    ) : (
                        expenses.map((item) => (
                            <Dialog key={item.id} open={!!openDialogs[item.id]} onOpenChange={(open) => !open && handleSetDialog(item.id, null)}>
                                <TableRow>
                                    <TableCell>{format(item.date, 'PPP')}</TableCell>
                                    <TableCell className="font-medium">{item.description}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.source === 'payout' ? 'secondary' : 'outline'}>
                                            {item.source}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{item.amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem 
                                                    onSelect={() => handleSetDialog(item.id, 'edit')}
                                                    disabled={item.source === 'payout'}
                                                >
                                                    <Edit className="mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    className="text-destructive" 
                                                    onSelect={() => handleSetDialog(item.id, 'delete')}
                                                >
                                                    <Trash className="mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                {openDialogs[item.id] === 'edit' && <EditExpenseDialog expense={item} onExpenseUpdated={handleActionComplete} />}
                                {openDialogs[item.id] === 'delete' && <DeleteExpenseDialog expense={item} onExpenseDeleted={handleActionComplete} />}
                            </Dialog>
                        ))
                    )}
                     {!loading && expenses.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                No expense records found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    