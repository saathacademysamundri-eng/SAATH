
'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { type Income } from '@/lib/data';
import { deleteIncomeRecord, getIncome, updateIncomeRecord } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { CalendarIcon, Loader2, MoreHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';

function EditIncomeDialog({
  incomeRecord,
  onIncomeUpdated,
}: {
  incomeRecord: Income;
  onIncomeUpdated: () => void;
}) {
  const [amount, setAmount] = useState(incomeRecord.amount);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid positive amount.',
      });
      return;
    }
    setIsSaving(true);
    const result = await updateIncomeRecord(incomeRecord.id, amount);
    if (result.success) {
      toast({
        title: 'Income Updated',
        description: `Record for ${incomeRecord.studentName} has been updated.`,
      });
      onIncomeUpdated();
    } else {
      toast({ variant: 'destructive', title: 'Update Failed', description: result.message });
    }
    setIsSaving(false);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Income Record</DialogTitle>
        <DialogDescription>
          Editing this record will adjust the student's fee balance.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label>Student</Label>
          <Input value={`${incomeRecord.studentName} (${incomeRecord.studentId})`} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (PKR)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin mr-2" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function DeleteIncomeConfirmation({
  incomeRecord,
  onIncomeDeleted,
}: {
  incomeRecord: Income;
  onIncomeDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteIncomeRecord(incomeRecord.id);
    if (result.success) {
      toast({
        title: 'Income Record Deleted',
        description: 'The student\'s fee balance has been updated.',
      });
      onIncomeDeleted();
    } else {
      toast({ variant: 'destructive', title: 'Deletion Failed', description: result.message });
    }
    setIsDeleting(false);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogDescription>
          This will delete the income record of{' '}
          <span className="font-semibold">{incomeRecord.amount.toLocaleString()} PKR</span> for{' '}
          <span className="font-semibold">{incomeRecord.studentName}</span>. This amount will be
          added back to the student's outstanding dues. This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="animate-spin mr-2" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}


export default function IncomePage() {
    const [income, setIncome] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
     const [openDialogs, setOpenDialogs] = useState<{ [key: string]: 'edit' | 'delete' | null }>({});

    const fetchIncome = async () => {
        setLoading(true);
        const incomeData = await getIncome();
        setIncome(incomeData);
        setLoading(false);
    }

    useEffect(() => {
        fetchIncome();
    }, []);

    const handleActionComplete = () => {
      fetchIncome();
      setOpenDialogs({});
    }

    const filteredIncome = useMemo(() => {
        if (!date?.from) return income;
        const fromDate = date.from;
        const toDate = date.to ? addDays(date.to, 1) : addDays(fromDate, 1); // include the whole 'to' day

        return income.filter(item => {
            const itemDate = item.date;
            return itemDate >= fromDate && itemDate < toDate;
        });
    }, [income, date]);

    const totalIncome = useMemo(() => {
        return filteredIncome.reduce((sum, item) => sum + item.amount, 0);
    }, [filteredIncome]);

    const handleSetDialog = (id: string, type: 'edit' | 'delete' | null) => {
        setOpenDialogs(prev => ({ ...prev, [id]: type }));
    }

  return (
    <div className="flex flex-col gap-6">
       <div>
          <h1 className="text-2xl font-bold tracking-tight">Income</h1>
          <p className="text-muted-foreground">
            A record of all fee collections.
          </p>
        </div>
      <Card>
        <CardHeader>
            <CardTitle>Income Statement</CardTitle>
            <CardDescription>
                List of all income generated from student fee payments. Total income for the selected period is
                <span className="font-bold text-green-600"> {totalIncome.toLocaleString()} PKR</span>.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
                 <Button variant="ghost" onClick={() => setDate(undefined)}>
                    <X className="mr-2" />
                    Clear
                </Button>
            </div>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead className="text-right">Amount (PKR)</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                        ))
                    ) : (
                        filteredIncome.map((item) => (
                            <Dialog key={item.id} open={!!openDialogs[item.id]} onOpenChange={(open) => !open && handleSetDialog(item.id, null)}>
                                <TableRow>
                                    <TableCell>{format(item.date, 'PPP')}</TableCell>
                                    <TableCell className="font-medium">{item.studentName}</TableCell>
                                    <TableCell>{item.studentId}</TableCell>
                                    <TableCell className="text-right font-medium">{item.amount.toLocaleString()}</TableCell>
                                     <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={() => handleSetDialog(item.id, 'edit')}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleSetDialog(item.id, 'delete')} className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                {openDialogs[item.id] === 'edit' && <EditIncomeDialog incomeRecord={item} onIncomeUpdated={handleActionComplete} />}
                                {openDialogs[item.id] === 'delete' && <DeleteIncomeConfirmation incomeRecord={item} onIncomeDeleted={handleActionComplete} />}
                            </Dialog>
                        ))
                    )}
                     {!loading && filteredIncome.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                No income records found for the selected period.
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

