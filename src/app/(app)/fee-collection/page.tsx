


'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Student } from '@/lib/data';
import { getStudent, updateStudentFeeStatus, addIncome, resetMonthlyFees } from '@/lib/firebase/firestore';
import { Printer, Search, Loader2, CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { useAppContext } from '@/hooks/use-app-context';
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

export default function FeeCollectionPage() {
  const [search, setSearch] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isResettingFees, setIsResettingFees] = useState(false);
  const { toast } = useToast();
  const { settings, isSettingsLoading } = useSettings();
  const { refreshData } = useAppContext();

  const handleSearch = async () => {
    if (!search.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a student roll number to search.',
      });
      setSearchedStudent(null);
      return;
    }
    setIsSearching(true);
    const student = await getStudent(search.trim());
    if (student) {
      setSearchedStudent(student);
      setPaidAmount(0); // Reset paid amount for new search
    } else {
      toast({
        variant: 'destructive',
        title: 'Not Found',
        description: 'No student found with that roll number.',
      });
      setSearchedStudent(null);
    }
    setIsSearching(false);
  };

  const handlePayment = async () => {
    if (!searchedStudent) return;
    if (paidAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to collect.',
      });
      return;
    }
     if (paidAmount > searchedStudent.totalFee) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: `Paid amount cannot be greater than the due amount of ${searchedStudent.totalFee.toLocaleString()} PKR.`,
      });
      return;
    }

    setIsProcessingPayment(true);
    
    const originalTotal = searchedStudent.totalFee;
    const newTotalFee = originalTotal - paidAmount;
    let newFeeStatus: Student['feeStatus'] = 'Partial';
    if (newTotalFee <= 0) {
      newFeeStatus = 'Paid';
    }

    // Add to income collection first
    const incomeResult = await addIncome({
        studentName: searchedStudent.name,
        studentId: searchedStudent.id,
        amount: paidAmount,
    });
      
    if (!incomeResult.success) {
        toast({
            variant: "destructive",
            title: "Payment Failed",
            description: `Failed to record income: ${incomeResult.message}`,
        });
        setIsProcessingPayment(false);
        return;
    }


    const result = await updateStudentFeeStatus(searchedStudent.id, newTotalFee, newFeeStatus);

    if (result.success) {
      const updatedStudent: Student = {
        ...searchedStudent,
        totalFee: newTotalFee,
        feeStatus: newFeeStatus
      };
      setSearchedStudent(updatedStudent);

      toast({
        title: 'Payment Recorded',
        description: `Paid ${paidAmount} for ${searchedStudent.name}. New balance is ${newTotalFee}.`,
      });
      
      handlePrintReceipt(paidAmount, newTotalFee, originalTotal);
      setPaidAmount(0);
      refreshData(); // Refresh the global context
    } else {
        // If student update fails, we should ideally roll back the income record.
        // For simplicity, we'll just show an error.
        toast({
            variant: "destructive",
            title: "Payment Failed",
            description: `Student record could not be updated: ${result.message}`,
        });
    }

    setIsProcessingPayment(false);
  };

  const handlePrintReceipt = (currentPaidAmount: number, newBalance: number, originalTotal: number) => {
    if (isSettingsLoading || !searchedStudent) {
        toast({ title: "Please wait", description: "Settings are loading."});
        return;
    }

    if (currentPaidAmount <= 0) {
        toast({
            variant: 'destructive',
            title: 'Cannot Print Receipt',
            description: 'A payment must be successfully recorded first.',
        });
        return;
    }

    const receiptContent = {
        student: searchedStudent,
        paidAmount: currentPaidAmount,
        balance: newBalance,
        totalFee: originalTotal,
        settings: settings,
        receiptId: `RCPT-${Date.now()}`.substring(0, 15),
        receiptDate: new Date().toLocaleString(),
    };
    
    const receiptHtml = `
      <html>
          <head>
              <title>Fee Receipt - ${searchedStudent.name}</title>
              <style>
                  @media print {
                      @page { size: 80mm; margin: 0; }
                      body { margin: 0; -webkit-print-color-adjust: exact; }
                      main { padding: 2mm; margin: 0; }
                  }
                  body { font-family: 'PT Sans', sans-serif; background-color: white; color: black; }
                  .receipt-container { width: 80mm; margin: auto; padding: 4mm; }
                  .text-center { text-align: center; }
                  .text-right { text-align: right; }
                  .font-bold { font-weight: bold; }
                  .text-lg { font-size: 1.125rem; }
                  .text-xs { font-size: 0.75rem; }
                  .space-y-1 > * + * { margin-top: 0.25rem; }
                  .flex { display: flex; }
                  .justify-center { justify-content: center; }
                  .justify-between { justify-content: space-between; }
                  .h-16 { height: 4rem; }
                  .w-16 { width: 4rem; }
                  .object-contain { object-fit: contain; }
                  .border-t { border-top: 1px dashed black; }
                  .border-b { border-bottom: 1px dashed black; }
                  .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
                  .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                  .mb-2 { margin-bottom: 0.5rem; }
                  .w-full { width: 100%; }
                  .font-semibold { font-weight: 600; }
                  .text-left { text-align: left; }
                  .mt-2 { margin-top: 0.5rem; }
                  .w-1\\/2 { width: 50%; }
                  .ml-auto { margin-left: auto; }
                  .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
                  .font-medium { font-weight: 500; }
                  .mt-4 { margin-top: 1rem; }
              </style>
          </head>
          <body>
              <div class="receipt-container">
                  <div class="text-center space-y-1">
                      <div class="flex justify-center">
                          <div class="h-16 w-16">
                              <img src="${receiptContent.settings.logo}" alt="Academy Logo" class="h-full w-full object-contain" />
                          </div>
                      </div>
                      <div>
                          <h1 class='text-lg font-bold'>${receiptContent.settings.name}</h1>
                          <p class='text-xs'>${receiptContent.settings.address}</p>
                          <p class='text-xs'>Phone: ${receiptContent.settings.phone}</p>
                      </div>
                  </div>
                  
                  <div class="border-t border-b my-2 py-1 text-xs">
                      <div class='flex justify-between'>
                          <span>Receipt #: ${receiptContent.receiptId}</span>
                          <span>Date: ${receiptContent.receiptDate}</span>
                      </div>
                  </div>

                  <div class='text-xs mb-2'>
                      <p><strong>Student:</strong> ${receiptContent.student.name} (${receiptContent.student.id})</p>
                      <p><strong>Class:</strong> ${receiptContent.student.class}</p>
                  </div>

                  <table class="w-full text-xs">
                      <thead>
                          <tr class='border-t border-b'>
                              <th class="py-1 text-left font-semibold">Description</th>
                              <th class="py-1 text-right font-semibold">Amount</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr class='border-b'>
                              <td class="py-1">Tuition Fee</td>
                              <td class="py-1 text-right">${originalTotal.toLocaleString()}</td>
                          </tr>
                      </tbody>
                  </table>
                  
                  <div class='flex justify-end mt-2'>
                      <table class="w-1/2 ml-auto text-xs">
                          <tbody>
                              <tr>
                                  <td class="py-0.5">Total Due:</td>
                                  <td class="py-0.5 text-right font-medium">${originalTotal.toLocaleString()}</td>
                              </tr>
                              <tr>
                                  <td class="py-0.5">Amount Paid:</td>
                                  <td class="py-0.5 text-right font-medium">${receiptContent.paidAmount.toLocaleString()}</td>
                              </tr>
                              <tr class="font-bold border-t">
                                  <td class="py-1">Balance:</td>
                                  <td class="py-1 text-right">${receiptContent.balance.toLocaleString()}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>

                  <div class='text-center text-xs mt-4 space-y-1'>
                      <p>*** Thank you for your payment! ***</p>
                      <p>&copy; ${new Date().getFullYear()} ${receiptContent.settings.name}.</p>
                  </div>
              </div>
          </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(receiptHtml);
    printWindow?.document.close();
    setTimeout(() => {
        printWindow?.print();
    }, 250);
};

  const handleNextMonth = async () => {
    setIsResettingFees(true);
    const result = await resetMonthlyFees();
    if (result.success) {
        toast({ title: 'Success', description: result.message });
        refreshData();
        // If a student is currently being viewed, refresh their data too
        if (searchedStudent) {
            handleSearch();
        }
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsResettingFees(false);
  }

  const balance = searchedStudent ? searchedStudent.totalFee : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
            <CardTitle>Collect Fee</CardTitle>
            <CardDescription>
                Enter a student roll number to view outstanding dues and collect
                fees.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                type="text"
                placeholder="Enter student roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isSearching}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {isSearching ? 'Searching...' : 'Search'}
                </Button>
            </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>Perform administrative tasks for fee management.</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <CalendarPlus className="mr-2" />
                            Start Next Month
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will generate the next month's fee for ALL students. It will add the monthly fee amount to each student's outstanding balance. This cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleNextMonth} disabled={isResettingFees}>
                                 {isResettingFees ? <Loader2 className="animate-spin" /> : null}
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
      </div>

      {searchedStudent && (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Fee Details for {searchedStudent.name}</CardTitle>
                    <CardDescription>
                        Roll #: {searchedStudent.id} | Class: {searchedStudent.class}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                     <div className="grid grid-cols-2 gap-4 text-center">
                        <div className='p-4 bg-secondary rounded-lg'>
                            <p className='text-sm text-muted-foreground'>Total Fee Dues</p>
                            <p className='text-2xl font-bold'>{searchedStudent.totalFee.toLocaleString()} PKR</p>
                        </div>
                         <div className='p-4 bg-secondary rounded-lg'>
                            <p className='text-sm text-muted-foreground'>Status</p>
                            <p className='text-2xl font-bold'>{searchedStudent.feeStatus}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Collection</CardTitle>
                </CardHeader>
                 <CardContent className="grid md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <Label>Total Dues (PKR)</Label>
                        <Input value={searchedStudent.totalFee.toLocaleString()} readOnly disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="paidAmount">Amount Paid (PKR)</Label>
                        <Input 
                            id="paidAmount" 
                            type="number"
                            placeholder="Enter amount being paid" 
                            value={paidAmount || ''}
                            onChange={(e) => setPaidAmount(Number(e.target.value))}
                            disabled={isProcessingPayment || searchedStudent.totalFee === 0}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Remaining Dues (PKR)</Label>
                        <Input value={(balance - paidAmount).toLocaleString()} readOnly disabled />
                    </div>
                 </CardContent>
                 <CardContent className='flex gap-2'>
                    <Button onClick={handlePayment} disabled={isProcessingPayment || searchedStudent.totalFee === 0}>
                        {isProcessingPayment ? <Loader2 className="animate-spin" /> : null}
                        {isProcessingPayment ? 'Processing...' : 'Collect Fee & Print'}
                    </Button>
                 </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

    
