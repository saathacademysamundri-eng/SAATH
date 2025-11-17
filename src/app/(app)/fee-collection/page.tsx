

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
import { getStudent, updateStudentFeeStatus, addIncome } from '@/lib/firebase/firestore';
import { Printer, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { useAppContext } from '@/hooks/use-app-context';
import QRCode from 'qrcode';
import { format, addDays } from 'date-fns';
import { PaidStamp } from '@/components/paid-stamp';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PrintFormat = 'thermal' | 'a4';

export default function FeeCollectionPage() {
  const [search, setSearch] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [printFormat, setPrintFormat] = useState<PrintFormat>('thermal');
  
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
      
    if (!incomeResult.success || !incomeResult.receiptId) {
        toast({
            variant: "destructive",
            title: "Payment Failed",
            description: `Failed to record income: ${incomeResult.message}`,
        });
        setIsProcessingPayment(false);
        return;
    }

    const { receiptId } = incomeResult;

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
      
      handlePrintPaidReceipt(paidAmount, newTotalFee, originalTotal, receiptId);
      setPaidAmount(0);
      refreshData(); // Refresh the global context
    } else {
        toast({
            variant: "destructive",
            title: "Payment Failed",
            description: `Student record could not be updated: ${result.message}`,
        });
    }

    setIsProcessingPayment(false);
  };

  const handlePrintPaidReceipt = async (currentPaidAmount: number, newBalance: number, originalTotal: number, receiptId: string) => {
    if (isSettingsLoading || !searchedStudent) return;
    
    const verificationUrl = `${window.location.origin}/p/receipt/${receiptId}`;
    let qrCodeDataUrl = '';
    try {
        qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 128, margin: 1 });
    } catch (error) {
        console.error('QR code generation failed:', error);
    }
        
    const receiptHtml = `
      <html>
          <head>
              <title>Fee Receipt - ${searchedStudent.name}</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link href="https://fonts.googleapis.com/css2?family=Calibri&display=swap" rel="stylesheet">
              <style>
                  @page { 
                    size: 3in 5in;
                    margin: 0; 
                  }
                  body { 
                    font-family: 'Calibri', sans-serif;
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                  }
                  .receipt-container { 
                    width: 3in;
                    height: 5in;
                    padding: 2mm;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                  }
                  .text-center { text-align: center; }
                  .font-bold { font-weight: bold; }
                  .text-lg { font-size: 1.125rem; }
                  .text-xs { font-size: 0.75rem; line-height: 1.2; }
                  .space-y-1 > * + * { margin-top: 0.25rem; }
                  .flex { display: flex; }
                  .justify-center { justify-content: center; }
                  .justify-between { justify-content: space-between; }
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
                  .footer { margin-top: auto; }
              </style>
          </head>
          <body>
              <div class="receipt-container">
                  <div class="text-center space-y-1">
                      <div class="flex justify-center" style="height: 4rem;">
                          ${settings.logo ? `<img src="${settings.logo}" alt="Academy Logo" style="height: 100%; object-fit: contain;" />` : ''}
                      </div>
                      <div>
                          <h1 class='text-lg font-bold'>${settings.name}</h1>
                          <p class='text-xs'>${settings.address}</p>
                          <p class='text-xs'>Phone: ${settings.phone}</p>
                      </div>
                  </div>
                  
                  <div class="border-t border-b my-2 py-1 text-xs">
                      <div class='flex justify-between'>
                          <span>Receipt #: ${receiptId}</span>
                          <span>${format(new Date(), 'PPP')}</span>
                      </div>
                  </div>

                  <div class='text-xs mb-2'>
                      <p><strong>Student:</strong> ${searchedStudent.name} (${searchedStudent.id})</p>
                      <p><strong>Class:</strong> ${searchedStudent.class}</p>
                  </div>

                  <table class="w-full text-xs">
                      <thead><tr class='border-t border-b'><th class="py-1 text-left font-semibold">Description</th><th class="py-1 text-right font-semibold">Amount (PKR)</th></tr></thead>
                      <tbody><tr class='border-b'><td class="py-1">Tuition Fee</td><td class="py-1 text-right">${originalTotal.toLocaleString()}</td></tr></tbody>
                  </table>
                  
                  <div class='flex justify-end mt-2'>
                      <table class="w-1/2 ml-auto text-xs">
                          <tbody>
                              <tr><td class="py-0.5">Total Due:</td><td class="py-0.5 text-right font-medium">${originalTotal.toLocaleString()}</td></tr>
                              <tr><td class="py-0.5">Amount Paid:</td><td class="py-0.5 text-right font-medium">${currentPaidAmount.toLocaleString()}</td></tr>
                              <tr class="font-bold border-t"><td class="py-1">Balance:</td><td class="py-1 text-right">${newBalance.toLocaleString()}</td></tr>
                          </tbody>
                      </table>
                  </div>

                  <div class='footer text-center text-xs'>
                      ${qrCodeDataUrl ? `
                          <p class='font-bold'>Scan to Verify</p>
                          <div class='flex justify-center'>
                            <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 80px; height: 80px;" />
                          </div>
                      ` : ''}
                      <p>*** Thank you for your payment! ***</p>
                  </div>
              </div>
          </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
    }
  };
  
  const handlePrintVoucher = async () => {
    if (isSettingsLoading || !searchedStudent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const verificationUrl = `${window.location.origin}/p/student/${searchedStudent.id}`;
    let qrCodeDataUrl = '';
    try {
        qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 128, margin: 1 });
    } catch (error) {
        console.error('QR code generation failed:', error);
    }

    let voucherHtml = '';
    const issueDate = new Date();
    const dueDate = addDays(issueDate, 10);

    if (printFormat === 'a4') {
        voucherHtml = `
            <html>
                <head><title>Fee Voucher - ${searchedStudent.name}</title></head>
                <style>
                    body { font-family: Calibri, sans-serif; }
                    .container { width: 800px; margin: auto; padding: 20px; border: 1px solid #ccc; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .header img { max-height: 80px; margin-bottom: 10px; }
                    .header h1 { margin: 0; }
                    .details, .fee-details { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .details td, .fee-details th, .fee-details td { border: 1px solid #ccc; padding: 8px; }
                    .fee-details th { background-color: #f2f2f2; text-align: left;}
                    .text-right { text-align: right; }
                    .total-row td { font-weight: bold; }
                    .slip-container { display: flex; justify-content: space-between; gap: 20px; margin-top: 30px; }
                    .slip { border: 1px solid #000; padding: 10px; width: 48%; }
                    .qr-section { text-align: center; margin-top: 20px; }
                    .qr-section img { margin: auto; }
                </style>
                <body>
                    <div class="container">
                        <div class="header">
                            ${settings.logo ? `<img src="${settings.logo}" alt="logo">` : ''}
                            <h1>${settings.name}</h1>
                            <p>${settings.address}</p>
                            <p>Phone: ${settings.phone}</p>
                        </div>
                        <h2>Fee Voucher</h2>
                        <table class="details">
                            <tr><td><strong>Student Name:</strong></td><td>${searchedStudent.name}</td><td><strong>Roll No:</strong></td><td>${searchedStudent.id}</td></tr>
                            <tr><td><strong>Father's Name:</strong></td><td>${searchedStudent.fatherName}</td><td><strong>Class:</strong></td><td>${searchedStudent.class}</td></tr>
                            <tr><td><strong>Issue Date:</strong></td><td>${format(issueDate, 'PPP')}</td><td><strong>Due Date:</strong></td><td>${format(dueDate, 'PPP')}</td></tr>
                        </table>
                        <table class="fee-details">
                            <thead><tr><th>Description</th><th class="text-right">Amount (PKR)</th></tr></thead>
                            <tbody><tr><td>Tuition Fee</td><td class="text-right">${searchedStudent.totalFee.toLocaleString()}</td></tr></tbody>
                            <tfoot><tr class="total-row"><td>Total Amount Due</td><td class="text-right">${searchedStudent.totalFee.toLocaleString()}</td></tr></tfoot>
                        </table>
                        <div class="qr-section">
                           ${qrCodeDataUrl ? `
                                <p><strong>Scan to check status online</strong></p>
                                <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 100px; height: 100px;" />
                            ` : ''}
                        </div>
                         <div class="slip-container">
                            <div class="slip" style="text-align: center; width: 100%;">
                                <h4>Academy Copy</h4>
                                <p><strong>Student:</strong> ${searchedStudent.name} (${searchedStudent.id})</p>
                                <p><strong>Amount:</strong> ${searchedStudent.totalFee.toLocaleString()} PKR</p>
                                <p><strong>Due Date:</strong> ${format(dueDate, 'PPP')}</p>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `;
    } else { // thermal
        voucherHtml = `
           <html>
              <head>
                  <title>Fee Voucher - ${searchedStudent.name}</title>
                  <link href="https://fonts.googleapis.com/css2?family=Calibri&display=swap" rel="stylesheet">
                  <style>
                      @page { size: 80mm; margin: 0; }
                      body { font-family: 'Calibri', sans-serif; margin: 0; padding: 2mm; -webkit-print-color-adjust: exact; }
                      .text-center { text-align: center; }
                      .font-bold { font-weight: bold; }
                      .text-lg { font-size: 1.125rem; }
                      .text-xs { font-size: 0.75rem; line-height: 1.2; }
                      .flex { display: flex; }
                      .justify-between { justify-content: space-between; }
                      .border-t { border-top: 1px dashed black; }
                      .border-b { border-bottom: 1px dashed black; }
                      .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
                      .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                      .mt-4 { margin-top: 1rem; }
                  </style>
              </head>
              <body>
                  <div class="text-center">
                      ${settings.logo ? `<img src="${settings.logo}" alt="logo" style="height: 4rem; object-fit: contain; margin: auto;">` : ''}
                      <h1 class='text-lg font-bold'>${settings.name}</h1>
                      <p class='text-xs'>${settings.address}</p>
                      <p class='text-xs'>Phone: ${settings.phone}</p>
                  </div>
                  <div class="border-t border-b my-2 py-1 text-xs">
                      <div class='flex justify-between'><span>Voucher</span><span>${format(issueDate, 'PPP')}</span></div>
                  </div>
                  <div class='text-xs'>
                      <p><strong>Student:</strong> ${searchedStudent.name} (${searchedStudent.id})</p>
                      <p><strong>Class:</strong> ${searchedStudent.class}</p>
                  </div>
                  <div class="border-t my-2"></div>
                  <div class='flex justify-between font-bold text-xs'><span>Total Due:</span><span>${searchedStudent.totalFee.toLocaleString()} PKR</span></div>
                  <p class='text-center text-xs mt-4'>Please pay by: ${format(dueDate, 'PPP')}</p>
                   <div class='text-center mt-4'>
                      ${qrCodeDataUrl ? `
                          <p class='font-bold text-xs'>Scan to check status</p>
                          <div style='display:flex; justify-content:center;'>
                            <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 80px; height: 80px;" />
                          </div>
                      ` : ''}
                  </div>
              </body>
            </html>
        `;
    }

    printWindow.document.write(voucherHtml);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };


  const balance = searchedStudent ? searchedStudent.totalFee : 0;
  
  return (
    <div className="flex flex-col gap-6">
       <Card>
            <CardHeader>
            <CardTitle>Collect Fee</CardTitle>
            <CardDescription>
                Enter a student roll number to view outstanding dues and collect
                fees.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="flex w-full items-center space-x-2">
                <div className="flex-grow max-w-sm">
                    <Input
                        type="text"
                        placeholder="Enter student roll number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        disabled={isSearching}
                    />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <Loader2 className="animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    {isSearching ? 'Searching...' : 'Search'}
                </Button>
            </div>
            </CardContent>
        </Card>

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
                     <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-2">
                            <Label>Print Voucher Format</Label>
                            <Select value={printFormat} onValueChange={(v) => setPrintFormat(v as PrintFormat)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="thermal">Thermal Voucher</SelectItem>
                                    <SelectItem value="a4">A4 Voucher</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" onClick={handlePrintVoucher} disabled={isSettingsLoading || searchedStudent.totalFee === 0}>
                            <Printer className="mr-2"/>
                            Print Voucher
                        </Button>
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
                        <Label htmlFor="paidAmount">Amount being Paid (PKR)</Label>
                        <Input 
                            id="paidAmount" 
                            type="number"
                            placeholder="Enter amount" 
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
                    <Button onClick={handlePayment} disabled={isProcessingPayment || searchedStudent.totalFee === 0 || paidAmount <= 0}>
                        {isProcessingPayment ? <Loader2 className="animate-spin" /> : null}
                        {isProcessingPayment ? 'Processing...' : 'Collect & Print Receipt'}
                    </Button>
                 </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

    
