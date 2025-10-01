
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { addExpense } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useAppContext } from '@/hooks/use-app-context';

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
        const result = await addExpense({ description, amount });

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

export default function ExpensesPage() {
    const { expenses, loading, refreshData } = useAppContext();

    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, item) => sum + item.amount, 0);
    }, [expenses]);

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
                <p className="text-muted-foreground">
                    A record of all operational expenses.
                </p>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2" /> Add Expense
                    </Button>
                </DialogTrigger>
                <AddExpenseDialog onExpenseAdded={refreshData} />
            </Dialog>
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
                        <TableHead className="text-right">Amount (PKR)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                        </TableRow>
                        ))
                    ) : (
                        expenses.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{format(item.date, 'PPP')}</TableCell>
                                <TableCell className="font-medium">{item.description}</TableCell>
                                <TableCell className="text-right font-medium">{item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                        ))
                    )}
                     {!loading && expenses.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
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
