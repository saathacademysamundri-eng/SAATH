

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
import { type Student, type Income } from '@/lib/data';
import { getStudents, updateStudentFeeStatus, addIncome } from '@/lib/firebase/firestore';
import { Printer, Search, Loader2 } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { useAppContext } from '@/hooks/use-app-context';
import QRCode from 'qrcode';
import { format, addDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendWhatsappMessage } from '@/lib/whatsapp';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import html2canvas from 'html2canvas';

type PrintFormat = 'thermal' | 'a4' | 'jpg';

function StudentSearchResultsDialog({
  open,
  onOpenChange,
  students,
  onStudentSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  onStudentSelect: (student: Student) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Student Search Results</DialogTitle>
          <DialogDescription>Multiple students found. Please select the correct one.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} onClick={() => onStudentSelect(student)} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.imageUrl} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {student.id} | {student.class}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.fatherName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default function FeeCollectionPage() {
  const [search, setSearch] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [printFormat, setPrintFormat] = useState<PrintFormat>('thermal');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { settings, isSettingsLoading } = useSettings();
  const { students, income, refreshData } = useAppContext();
  
  const lastPayment = useMemo(() => {
    if (!searchedStudent) return null;
    return income
      .filter(i => i.studentId === searchedStudent.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0] || null;
  }, [searchedStudent, income]);


  const handleSearch = async () => {
    if (!search.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a student name or roll number to search.',
      });
      setSearchedStudent(null);
      return;
    }

    setIsSearching(true);
    setSearchedStudent(null);
    setSearchResults([]);

    const searchTerm = search.trim().toLowerCase();
    
    const isRollNumber = /^(s|S)?\d+$/.test(searchTerm);
    let potentialRollNumber = searchTerm;
    if (/^\d+$/.test(searchTerm)) {
        potentialRollNumber = `S${searchTerm.padStart(3, '0')}`;
    }

    const results = students.filter(student => 
        student.id.toLowerCase() === potentialRollNumber.toLowerCase() ||
        student.name.toLowerCase().includes(searchTerm)
    );

    if (results.length === 1) {
      setSearchedStudent(results[0]);
      setPaidAmount(0);
    } else if (results.length > 1) {
      setSearchResults(results);
      setIsSearchResultsOpen(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Not Found',
        description: 'No student found matching your search.',
      });
    }

    setIsSearching(false);
  };
  
  const handleStudentSelect = (student: Student) => {
    setSearchedStudent(student);
    setPaidAmount(0);
    setIsSearchResultsOpen(false);
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

    // Generate receiptId before saving
    const receiptId = `RCPT-${Date.now()}`;

    // Add to income collection first
    const incomeResult = await addIncome({
        studentName: searchedStudent.name,
        studentId: searchedStudent.id,
        amount: paidAmount,
        receiptId: receiptId,
    });
      
    if (!incomeResult.success || !incomeResult.id) {
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

      if (settings.paymentReceiptMsg && searchedStudent.phone) {
        let messageBody = settings.paymentReceiptTemplate || 'Dear parent, we have received a payment of {amount} for {student_name}. Thank you!';
        messageBody = messageBody.replace(/{student_name}/g, searchedStudent.name)
                                  .replace(/{amount}/g, paidAmount.toLocaleString() + ' PKR');

        const apiUrl = settings.whatsappProvider === 'ultramsg' ? settings.ultraMsgApiUrl : settings.officialApiUrl;
        const token = settings.whatsappProvider === 'ultramsg' ? settings.ultraMsgToken : settings.officialApiToken;
        if (apiUrl && token) {
          sendWhatsappMessage({ to: searchedStudent.phone, body: messageBody, apiUrl, token });
        }
      }
      
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

  const handlePrintPaidReceipt = async (currentPaidAmount: number, newBalance: number, originalTotal: number, receiptId: string, receiptDate?: Date) => {
    if (isSettingsLoading || !searchedStudent) return;
    
    const verificationUrl = `${window.location.origin}/p/receipt/${receiptId}`;
    let qrCodeDataUrl = '';
    try {
        qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 128, margin: 1 });
    } catch (error) {
        console.error('QR code generation failed:', error);
    }
        
    const dateToPrint = receiptDate || new Date();
    
    let receiptHtml = '';
    
    const paidStampHtml = `
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); opacity: 0.1; font-size: ${printFormat === 'a4' ? '10rem' : '5rem'}; font-weight: bold; color: #000; pointer-events: none; z-index: -1;">
        PAID
      </div>
    `;

    if (printFormat === 'a4') {
        receiptHtml = `
             <html>
                <head>
                    <title>Receiving Receipt - ${searchedStudent.name}</title>
                    <style>
                        @page { size: A4; margin: 0.75in; }
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        .receipt-container { position: relative; max-width: 800px; margin: auto; padding: 2rem; border: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        ${paidStampHtml}
                        <div style="text-align: center; margin-bottom: 2rem;">
                            ${settings.logo ? `<img src="${settings.logo}" alt="Logo" style="height: 80px; margin: auto; object-fit: contain;">` : ''}
                            <h1 style="font-size: 2rem; margin: 0.5rem 0;">${settings.name}</h1>
                            <p>${settings.address}</p>
                            <p>${settings.phone}</p>
                        </div>
                        <h2 style="text-align: center; font-size: 1.5rem; margin-bottom: 2rem;">Receiving Receipt</h2>
                        <table style="width: 100%; margin-bottom: 1rem;">
                          <tr><td><strong>Receipt #:</strong> ${receiptId}</td><td style="text-align: right;"><strong>Date:</strong> ${format(dateToPrint, 'PPP')}</td></tr>
                          <tr><td colspan="2"><strong>Student:</strong> ${searchedStudent.name} (${searchedStudent.id})</td></tr>
                           <tr><td colspan="2"><strong>Class:</strong> ${searchedStudent.class}</td></tr>
                        </table>
                        <table style="width: 100%; border-collapse: collapse; font-size: 1.1rem;">
                            <thead style="background-color: #f2f2f2;">
                                <tr><th style="padding: 10px; text-align: left;">Description</th><th style="padding: 10px; text-align: right;">Amount (PKR)</th></tr>
                            </thead>
                            <tbody>
                                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Tuition Fee</td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${originalTotal.toLocaleString()}</td></tr>
                            </tbody>
                        </table>
                        <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                             <table style="width: 50%;">
                                <tr><td>Total Due:</td><td style="text-align: right;">${originalTotal.toLocaleString()}</td></tr>
                                <tr><td>Amount Paid:</td><td style="text-align: right;">${currentPaidAmount.toLocaleString()}</td></tr>
                                <tr style="font-weight: bold; border-top: 2px solid #333;"><td>Balance:</td><td style="text-align: right;">${newBalance.toLocaleString()}</td></tr>
                             </table>
                        </div>
                         <div style="text-align: center; margin-top: 3rem;">
                            ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="QR Code" style="width: 100px; height: 100px; margin: auto;"><p>Scan to verify</p>` : ''}
                            <p style="margin-top: 2rem;">*** Thank you for your payment! ***</p>
                            <p style="font-size: 0.8rem; color: #888; margin-top: 2rem;">Copyright &copy; ${new Date().getFullYear()} ${settings.name}. Developed by SchoolUP.</p>
                        </div>
                    </div>
                </body>
             </html>
        `;
    } else { // thermal
        receiptHtml = `
          <html>
              <head>
                  <title>Receiving Receipt - ${searchedStudent.name}</title>
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
                        position: relative;
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
                      .footer { text-align: center; font-size: 0.8rem; color: #888; margin-top: auto; padding-top: 1rem; border-top: 1px solid #ddd; }
                  </style>
              </head>
              <body>
                  <div class="receipt-container">
                      ${paidStampHtml}
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
                              <span>${format(dateToPrint, 'PPP')}</span>
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
                        <div class="footer">
                          ${qrCodeDataUrl ? `
                              <p class='font-bold'>Scan to Verify</p>
                              <div class='flex justify-center'>
                                <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 80px; height: 80px;" />
                              </div>
                          ` : ''}
                           <p>*** Thank you for your payment! ***</p>
                          Copyright &copy; ${new Date().getFullYear()} ${settings.name}. Developed by SchoolUP.
                      </div>
                  </div>
              </body>
          </html>
        `;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
    }
  };

  const getA4HtmlWithStyles = async (currentPaidAmount: number, newBalance: number, originalTotal: number, receiptId: string, receiptDate?: Date) => {
    if (isSettingsLoading || !searchedStudent) return '';
    
    const verificationUrl = `${window.location.origin}/p/receipt/${receiptId}`;
    let qrCodeDataUrl = '';
    try {
        qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 128, margin: 1 });
    } catch (error) {
        console.error('QR code generation failed:', error);
    }
        
    const dateToPrint = receiptDate || new Date();
    
    const paidStampHtml = `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); opacity: 0.1; font-size: 10rem; font-weight: bold; color: #000; pointer-events: none; z-index: -1;">PAID</div>`;

    return `<div style="font-family: 'Segoe UI', sans-serif; color: black; background: white; padding: 2rem; max-width: 800px; margin: auto; border: 1px solid #ddd; position: relative;">
        ${paidStampHtml}
        <div style="text-align: center; margin-bottom: 2rem;">
            ${settings.logo ? `<img src="${settings.logo}" alt="Logo" style="height: 80px; margin: auto; object-fit: contain;">` : ''}
            <h1 style="font-size: 2rem; margin: 0.5rem 0; color: black;">${settings.name}</h1>
            <p style="color: #555; margin: 0;">${settings.address}</p>
            <p style="color: #555; margin: 0;">${settings.phone}</p>
        </div>
        <h2 style="text-align: center; font-size: 1.5rem; margin-bottom: 2rem; color: black;">Receiving Receipt</h2>
        <table style="width: 100%; margin-bottom: 1rem; color: black;">
          <tr><td style="color: black;"><strong>Receipt #:</strong> ${receiptId}</td><td style="text-align: right; color: black;"><strong>Date:</strong> ${format(dateToPrint, 'PPP')}</td></tr>
          <tr><td colspan="2" style="color: black;"><strong>Student:</strong> ${searchedStudent.name} (${searchedStudent.id})</td></tr>
           <tr><td colspan="2" style="color: black;"><strong>Class:</strong> ${searchedStudent.class}</td></tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 1.1rem; color: black;">
            <thead style="background-color: #f2f2f2;">
                <tr><th style="padding: 10px; text-align: left; color: black;">Description</th><th style="padding: 10px; text-align: right; color: black;">Amount (PKR)</th></tr>
            </thead>
            <tbody>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: black;">Tuition Fee</td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: black;">${originalTotal.toLocaleString()}</td></tr>
            </tbody>
        </table>
        <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
             <table style="width: 50%; color: black;">
                <tr><td style="color: black;">Total Due:</td><td style="text-align: right; color: black;">${originalTotal.toLocaleString()}</td></tr>
                <tr><td style="color: black;">Amount Paid:</td><td style="text-align: right; color: black;">${currentPaidAmount.toLocaleString()}</td></tr>
                <tr style="font-weight: bold; border-top: 2px solid #333;"><td style="color: black;">Balance:</td><td style="text-align: right; color: black;">${newBalance.toLocaleString()}</td></tr>
             </table>
        </div>
         <div style="text-align: center; margin-top: 3rem; color: black;">
            ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="QR Code" style="width: 100px; height: 100px; margin: auto;"><p style="color: black;">Scan to verify</p>` : ''}
            <p style="margin-top: 2rem; color: black;">*** Thank you for your payment! ***</p>
            <p style="font-size: 0.8rem; color: #888; margin-top: 2rem;">Copyright &copy; ${new Date().getFullYear()} ${settings.name}. Developed by SchoolUP.</p>
        </div>
    </div>`;
  };

  const handleReprint = async () => {
    if (!searchedStudent || !lastPayment) {
        toast({
            variant: "destructive",
            title: "No Payment Found",
            description: "No previous payment record exists for this student.",
        });
        return;
    }
    
    // Recalculate the state at the time of the last payment
    const amountPaid = lastPayment.amount;
    const balanceAfterPayment = searchedStudent.totalFee;
    const balanceBeforePayment = balanceAfterPayment + amountPaid;
    const originalReceiptId = lastPayment.receiptId || lastPayment.id;

    if (printFormat === 'jpg') {
        const a4Html = await getA4HtmlWithStyles(amountPaid, balanceAfterPayment, balanceBeforePayment, originalReceiptId, lastPayment.date);
        
        if (printRef.current) {
            printRef.current.innerHTML = a4Html;
            html2canvas(printRef.current.firstElementChild as HTMLElement, { scale: 2, useCORS: true, backgroundColor: 'white' }).then(canvas => {
                const link = document.createElement('a');
                link.download = `receipt-${searchedStudent.id}-${originalReceiptId}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                link.click();
                printRef.current!.innerHTML = ''; // Clear after use
            });
        }
    } else {
      handlePrintPaidReceipt(amountPaid, balanceAfterPayment, balanceBeforePayment, originalReceiptId, lastPayment.date);
    }
  };
  
  const balance = searchedStudent ? searchedStudent.totalFee : 0;
  
  return (
    <>
      <div className="absolute -left-[9999px] top-auto w-auto" ref={printRef} />

      <div className="flex flex-col gap-6">
        <Card>
              <CardHeader>
              <CardTitle>Collect Fee</CardTitle>
              <CardDescription>
                  Enter a student's name or roll number to view outstanding dues and collect
                  fees.
              </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="flex w-full items-center space-x-2">
                  <div className="flex-grow max-w-sm">
                      <Input
                          type="text"
                          placeholder="Enter name or roll number..."
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

        <StudentSearchResultsDialog
          open={isSearchResultsOpen}
          onOpenChange={setIsSearchResultsOpen}
          students={searchResults}
          onStudentSelect={handleStudentSelect}
        />

        {searchedStudent && (
          <div className="grid gap-6">
              <Card>
                  <CardHeader>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                              <CardTitle>Fee Details for {searchedStudent.name}</CardTitle>
                              <CardDescription>
                                  Roll #: {searchedStudent.id} | Class: {searchedStudent.class}
                              </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                              <Select value={printFormat} onValueChange={(v) => setPrintFormat(v as PrintFormat)}>
                                  <SelectTrigger className="w-[150px]">
                                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="thermal">Thermal Printer</SelectItem>
                                      <SelectItem value="a4">A4 Page</SelectItem>
                                      <SelectItem value="jpg">JPG Image</SelectItem>
                                  </SelectContent>
                              </Select>
                              <Button onClick={handleReprint} variant="outline" disabled={!lastPayment}>
                                  <Printer className="mr-2" />
                                  Reprint Last Receipt
                              </Button>
                          </div>
                      </div>
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
    </>
  );
}
