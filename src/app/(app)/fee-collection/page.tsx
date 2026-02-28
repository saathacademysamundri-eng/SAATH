
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
import { getStudent, updateStudentFeeStatus, addIncome, logActivity } from '@/lib/firebase/firestore';
import { Printer, Search, Loader2 } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { useAppContext } from '@/hooks/use-app-context';
import QRCode from 'qrcode';
import { format, addDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendWhatsappMessage as sendWhatsappMessageFlow } from '@/ai/flows/send-whatsapp-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import html2canvas from 'html2canvas';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

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
  const [studentIncome, setStudentIncome] = useState<Income[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [printFormat, setPrintFormat] = useState<PrintFormat>('thermal');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const [forMonth, setForMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const printRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { settings, isSettingsLoading } = useSettings();
  const { refreshData } = useAppContext();
  
  const lastPayment = useMemo(() => {
    if (studentIncome.length === 0) return null;
    return [...studentIncome].sort((a, b) => b.date.getTime() - a.date.getTime())[0] || null;
  }, [studentIncome]);

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = -6; i <= 1; i++) {
      const d = addDays(now, i * 30);
      const val = format(d, 'yyyy-MM');
      options.push({ value: val, label: format(d, 'MMMM yyyy') });
    }
    return options;
  }, []);

  const fetchStudentIncome = async (studentId: string) => {
    const q = query(collection(db, 'income'), where('studentId', '==', studentId), limit(10));
    const snapshot = await getDocs(q);
    const history = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, date: doc.data().date.toDate() } as Income));
    setStudentIncome(history);
  };

  const handleSearch = async () => {
    const queryTerm = search.trim();
    if (!queryTerm) {
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

    // 1. Smart ID Formatting
    let formattedId = queryTerm;
    if (/^\d+$/.test(queryTerm)) {
      formattedId = `S${queryTerm.padStart(3, '0')}`;
    } else if (/^s\d+$/i.test(queryTerm)) {
      formattedId = `S${queryTerm.substring(1).padStart(3, '0')}`;
    }

    // 2. Try exact ID match first
    let student = await getStudent(formattedId);
    if (!student && formattedId !== queryTerm) {
      student = await getStudent(queryTerm);
    }

    if (student && student.status === 'active') {
      handleStudentSelect(student);
      setIsSearching(false);
      return;
    }

    // 3. Name or ID Prefix Search (Multiple results)
    const resultsMap = new Map<string, Student>();

    const runSearchQuery = async (term: string) => {
      const capitalized = term.charAt(0).toUpperCase() + term.slice(1);
      
      const qName = query(
        collection(db, 'students'),
        where('name', '>=', capitalized),
        where('name', '<=', capitalized + '\uf8ff'),
        limit(20)
      );
      
      const qId = query(
        collection(db, 'students'),
        where('id', '>=', term.toUpperCase()),
        where('id', '<=', term.toUpperCase() + '\uf8ff'),
        limit(20)
      );

      const [nameSnap, idSnap] = await Promise.all([getDocs(qName), getDocs(qId)]);
      
      nameSnap.forEach(doc => {
        const data = doc.data() as Student;
        if (data.status === 'active') resultsMap.set(doc.id, { ...data, id: doc.id });
      });
      
      idSnap.forEach(doc => {
        const data = doc.data() as Student;
        if (data.status === 'active') resultsMap.set(doc.id, { ...data, id: doc.id });
      });
    };

    await runSearchQuery(queryTerm);

    const results = Array.from(resultsMap.values());

    if (results.length === 1) {
      handleStudentSelect(results[0]);
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
  
  const handleStudentSelect = async (student: Student) => {
    setSearchedStudent(student);
    await fetchStudentIncome(student.id);
    setPaidAmount(0);
    setDiscountAmount(0);
    setIsSearchResultsOpen(false);
  };


  const handlePayment = async () => {
    if (!searchedStudent) return;
    
    const totalReduction = paidAmount + discountAmount;
    if (totalReduction <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid paid amount or discount.',
      });
      return;
    }

    setIsProcessingPayment(true);
    
    const originalTotal = searchedStudent.totalFee;
    const effectiveDuesBeforePay = originalTotal - discountAmount;
    const newTotalFee = effectiveDuesBeforePay - paidAmount;

    let newFeeStatus: Student['feeStatus'] = 'Partial';
    if (newTotalFee <= 0) {
      newFeeStatus = 'Paid';
    } else if (newTotalFee >= searchedStudent.monthlyFee) {
        newFeeStatus = 'Overdue';
    }

    // 1. Process Discount Logging
    if (discountAmount > 0) {
        await logActivity('fee_discount', `Applied ${discountAmount} PKR discount to ${searchedStudent.name}.`);
    }

    // 2. Process Income Record (Only if money was paid)
    let receiptId = `RCPT-${Date.now()}`;
    if (paidAmount > 0) {
        const incomeResult = await addIncome({
            studentName: searchedStudent.name,
            studentId: searchedStudent.id,
            amount: paidAmount,
            receiptId: receiptId,
            forMonth: forMonth,
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
    }

    // 3. Update Student Record
    const result = await updateStudentFeeStatus(searchedStudent.id, newTotalFee, newFeeStatus);

    if (result.success) {
      const updatedStudent: Student = {
        ...searchedStudent,
        totalFee: newTotalFee,
        feeStatus: newFeeStatus
      };
      setSearchedStudent(updatedStudent);
      await fetchStudentIncome(searchedStudent.id);

      toast({
        title: 'Transaction Recorded',
        description: `Applied ${discountAmount} PKR discount and received ${paidAmount} PKR for ${searchedStudent.name}.`,
      });

      if (paidAmount > 0 && settings.paymentReceiptMsg && searchedStudent.phone) {
        let messageBody = settings.paymentReceiptTemplate || 'Dear parent, we have received a payment of {amount} for {student_name}. Thank you!';
        messageBody = messageBody.replace(/{student_name}/g, searchedStudent.name)
                                  .replace(/{amount}/g, paidAmount.toLocaleString() + ' PKR');

        const apiUrl = settings.whatsappProvider === 'ultramsg' ? settings.ultraMsgApiUrl : settings.officialApiUrl;
        const token = settings.whatsappProvider === 'ultramsg' ? settings.ultraMsgToken : settings.officialApiToken;
        if (apiUrl && token) {
          sendWhatsappMessageFlow({ to: searchedStudent.phone, body: messageBody, apiUrl, token });
        }
      }
      
      // Use effective dues (after discount) as the total due on the printed receipt
      handlePrintPaidReceipt(paidAmount, newTotalFee, effectiveDuesBeforePay, receiptId);
      setPaidAmount(0);
      setDiscountAmount(0);
      refreshData();
    } else {
        toast({
            variant: "destructive",
            title: "Process Failed",
            description: `Student record could not be updated: ${result.message}`,
        });
    }

    setIsProcessingPayment(false);
  };

  const handlePrintPaidReceipt = async (currentPaidAmount: number, newBalance: number, originalTotal: number, receiptId: string, receiptDate?: Date) => {
    if (isSettingsLoading || !searchedStudent) return;
    
    const verificationUrl = `${window.location.origin}/p/student/${searchedStudent.id}`;
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
                            ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="QR Code" style="width: 100px; height: 100px; margin: auto;"><p>Scan for live fee status</p>` : ''}
                            <p style="margin-top: 2rem;">*** Thank you for your payment! ***</p>
                            <p style="font-size: 0.8rem; color: #888; margin-top: 2rem;">Copyright &copy; ${new Date().getFullYear()} ${settings.name}. Powered by SchoolUP.</p>
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
                              <p class='font-bold'>Scan for Status</p>
                              <div class='flex justify-center'>
                                <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 80px; height: 80px;" />
                              </div>
                          ` : ''}
                           <p>*** Thank you for your payment! ***</p>
                          Copyright &copy; ${new Date().getFullYear()} ${settings.name}. Powered by SchoolUP.
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

  const handleReprint = async () => {
    if (!searchedStudent || !lastPayment) {
        toast({
            variant: "destructive",
            title: "No Payment Found",
            description: "No previous payment record exists for this student.",
        });
        return;
    }
    
    const amountPaidVal = lastPayment.amount;
    const balanceAfterPaymentVal = searchedStudent.totalFee;
    const balanceBeforePaymentVal = balanceAfterPaymentVal + amountPaidVal;
    const originalReceiptIdVal = lastPayment.receiptId || lastPayment.id;

    handlePrintPaidReceipt(amountPaidVal, balanceAfterPaymentVal, balanceBeforePaymentVal, originalReceiptIdVal, lastPayment.date);
  };
  
  const currentBalanceValue = searchedStudent ? searchedStudent.totalFee : 0;
  
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
                  <CardContent className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                      <div className="space-y-2">
                          <Label>Current Dues (PKR)</Label>
                          <Input value={searchedStudent.totalFee.toLocaleString()} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="discountAmount">Discount Amount (PKR)</Label>
                          <Input 
                              id="discountAmount" 
                              type="number"
                              placeholder="Enter discount" 
                              value={discountAmount || ''}
                              onChange={(e) => setDiscountAmount(Number(e.target.value))}
                              disabled={isProcessingPayment || searchedStudent.totalFee === 0}
                          />
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
                          <Label htmlFor="forMonth">Payment For Month</Label>
                          <Select value={forMonth} onValueChange={setForMonth}>
                            <SelectTrigger id="forMonth">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {monthOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label>Remaining Dues (PKR)</Label>
                          <Input value={Math.max(0, currentBalanceValue - discountAmount - paidAmount).toLocaleString()} readOnly disabled />
                      </div>
                  </CardContent>
                  <CardContent className='flex gap-2'>
                      <Button onClick={handlePayment} disabled={isProcessingPayment || searchedStudent.totalFee === 0 || (paidAmount + discountAmount) <= 0}>
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
