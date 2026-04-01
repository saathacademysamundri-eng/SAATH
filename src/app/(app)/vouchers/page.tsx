
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/hooks/use-app-context';
import { useSettings } from '@/hooks/use-settings';
import { format, addDays } from 'date-fns';
import { Newspaper, Printer, CalendarIcon, Search, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { getStudent } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';


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


export default function VouchersPage() {
  const { classes, loading: appLoading } = useAppContext();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [bulkIssueDate, setBulkIssueDate] = useState<Date>(new Date());
  const [bulkDueDate, setBulkDueDate] = useState<Date>(addDays(new Date(), 10));

  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const [individualIssueDate, setIndividualIssueDate] = useState<Date>(new Date());
  const [individualDueDate, setIndividualDueDate] = useState<Date>(addDays(new Date(), 10));

  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [isLoadingClassStudents, setIsLoadingClassStudents] = useState(false);

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    const className = classes.find(c => c.id === classId)?.name;
    if (className) {
        setIsLoadingClassStudents(true);
        const q = query(collection(db, 'students'), where('class', '==', className), where('status', '==', 'active'), limit(500));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student));
        setClassStudents(data);
        setIsLoadingClassStudents(false);
    }
  };

  const handleSearch = async () => {
    const queryTerm = search.trim();
    if (!queryTerm) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a student name or roll number.' });
      return;
    }
    
    setIsSearching(true);
    setSearchedStudent(null);
    setSearchResults([]);

    let formattedId = queryTerm;
    if (/^\d+$/.test(queryTerm)) {
      formattedId = `S${queryTerm.padStart(3, '0')}`;
    } else if (/^s\d+$/i.test(queryTerm)) {
      formattedId = `S${queryTerm.substring(1).padStart(3, '0')}`;
    }

    let student = await getStudent(formattedId);
    if (!student && formattedId !== queryTerm) {
      student = await getStudent(queryTerm);
    }

    if (student && student.status === 'active') {
      handleStudentSelect(student);
      setIsSearching(false);
      return;
    }

    const resultsMap = new Map<string, Student>();
    const runSearchQuery = async (term: string) => {
      const capitalized = term.charAt(0).toUpperCase() + term.slice(1);
      const qName = query(collection(db, 'students'), where('name', '>=', capitalized), where('name', '<=', capitalized + '\uf8ff'), limit(20));
      const qId = query(collection(db, 'students'), where('id', '>=', term.toUpperCase()), where('id', '<=', term.toUpperCase() + '\uf8ff'), limit(20));
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
      toast({ variant: 'destructive', title: 'Not Found', description: 'No student found matching your search.' });
    }
    setIsSearching(false);
  };
  
  const handleStudentSelect = (student: Student) => {
    setSearchedStudent(student);
    setIsSearchResultsOpen(false);
  };
  
  const generateVoucherHtml = async (student: Student, issueDate: Date, dueDate: Date) => {
    const verificationUrl = `${window.location.origin}/p/student/${student.id}`;
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 128, margin: 1 });
    } catch (error) {
      console.error('QR code generation failed:', error);
    }
  
    return `
      <div class="voucher-container">
          <div class="content-wrap">
              <div class="main-content">
                <div class="header">
                    ${settings.logo ? `<img src="${settings.logo}" alt="logo">` : ''}
                    <h1>${settings.name}</h1>
                    <p>${settings.address}</p>
                    <p>Phone: ${settings.phone}</p>
                </div>
                <h2 style="text-align: center;">Fee Voucher (Student Copy)</h2>
                <table class="details">
                    <tr><td><strong>Student Name:</strong></td><td>${student.name}</td><td><strong>Roll No:</strong></td><td>${student.id}</td></tr>
                    <tr><td><strong>Father's Name:</strong></td><td>${student.fatherName}</td><td><strong>Class:</strong></td><td>${student.class}</td></tr>
                    <tr><td><strong>Issue Date:</strong></td><td>${format(issueDate, 'PPP')}</td><td><strong>Due Date:</strong></td><td>${format(dueDate, 'PPP')}</td></tr>
                </table>
                <table class="fee-details">
                    <thead><tr><th>Description</th><th class="text-right">Amount (PKR)</th></tr></thead>
                    <tbody><tr><td>Tuition Fee (Adjusted)</td><td class="text-right">${student.totalFee.toLocaleString()}</td></tr></tbody>
                    <tfoot><tr class="total-row"><td>Total Amount Due</td><td class="text-right">${student.totalFee.toLocaleString()} /-</td></tr></tfoot>
                </table>
                <div class="qr-section">
                  ${qrCodeDataUrl ? `
                        <p><strong>Scan for live fee status</strong></p>
                        <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 100px; height: 100px;" />
                    ` : ''}
                </div>
              </div>
              <div class="cut-line">
                  <div class="cut-line-icon">&#x2702;</div>
              </div>
              <div class="slip">
                  <h3 style="font-size: 1.5rem; margin-bottom: 15px; font-weight: bold;">Academy Copy</h3>
                  <p><strong>Student:</strong> ${student.name} (${student.id})</p>
                  <p><strong>Father's Name:</strong> ${student.fatherName}</p>
                  <p><strong>Class:</strong> ${student.class}</p>
                  <p><strong>Amount:</strong> ${student.totalFee.toLocaleString()} PKR</p>
                  <p><strong>Due Date:</strong> ${format(dueDate, 'PPP')}</p>
              </div>
          </div>
           <div class="footer">
              Copyright &copy; ${new Date().getFullYear()} ${settings.name}. Developed by SchoolUP.
          </div>
      </div>
    `;
  };

  const handlePrint = async (target: 'class' | 'individual') => {
    let vouchersToPrint: Student[] = [];
    let issueDateToUse: Date, dueDateToUse: Date;
    let pageTitle = 'Fee Vouchers';

    if (target === 'class') {
      if (!selectedClassId) {
        toast({ variant: 'destructive', title: 'No Class Selected', description: 'Please select a class.' });
        return;
      }
      if (classStudents.length === 0) {
        toast({ variant: 'destructive', title: 'No Students Found', description: 'The selected class has no active students.' });
        return;
      }
      vouchersToPrint = classStudents;
      issueDateToUse = bulkIssueDate;
      dueDateToUse = bulkDueDate;
      const className = classes.find(c => c.id === selectedClassId)?.name || '';
      pageTitle = `${className} - Fee Vouchers`;
    } else if (target === 'individual') {
      if (!searchedStudent) {
        toast({ variant: 'destructive', title: 'No Student Found', description: 'Please search for a student first.' });
        return;
      }
      vouchersToPrint = [searchedStudent];
      issueDateToUse = individualIssueDate;
      dueDateToUse = individualDueDate;
      pageTitle = `${searchedStudent.name} - Fee Voucher`;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Popup Blocked', description: 'Please allow popups for this site.' });
      return;
    }

    let allVouchersHtml = '';
    for (const student of vouchersToPrint) {
      allVouchersHtml += await generateVoucherHtml(student, issueDateToUse, dueDateToUse);
    }
    
    const finalHtml = `
        <html>
            <head><title>${pageTitle}</title>
             <style>
                body { font-family: Calibri, sans-serif; }
                .voucher-container { width: 100%; max-width: 800px; margin: auto; padding: 20px; border: 1px solid #ccc; page-break-after: always; display: flex; flex-direction: column; box-sizing: border-box; }
                .voucher-container:last-child { page-break-after: auto; }
                .content-wrap { flex: 1; }
                .main-content { flex-grow: 1; }
                .header { text-align: center; margin-bottom: 20px; }
                .header img { max-height: 80px; margin-bottom: 10px; }
                .header h1 { margin: 0; }
                .details, .fee-details { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .details td, .fee-details th, .fee-details td { border: 1px solid #ccc; padding: 8px; }
                .fee-details th { background-color: #f2f2f2; text-align: left;}
                .text-right { text-align: right; }
                .total-row td { font-weight: bold; }
                .slip { text-align: center; border: 1px solid #000; padding: 10px; width: 100%;}
                .qr-section { text-align: center; margin-top: 20px; }
                .qr-section img { margin: auto; }
                .cut-line { display: flex; align-items: center; text-align: center; margin: 20px 0; border-top: 2px dashed #888; position: relative; }
                .cut-line-icon { font-size: 20px; position: absolute; left: 10px; transform: translateY(-50%); background: #fff; padding: 0 5px; }
                .footer { text-align: center; font-size: 0.8rem; color: #888; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; }
                @media print { @page { size: A4 portrait; margin: 0.5in; } body { -webkit-print-color-adjust: exact; } .voucher-container { min-height: 270mm; } }
            </style>
            </head>
            <body>${allVouchersHtml}</body>
        </html>
    `;

    printWindow.document.write(finalHtml);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fee Vouchers</h1>
        <p className="text-muted-foreground">
          Generate and print fee vouchers for individual students or entire classes.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Individual Fee Voucher</CardTitle>
          <CardDescription>Search for a student by their name or roll number to print a single voucher.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                    type="text"
                    placeholder="Enter student name or roll number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={isSearching}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                    Search
                </Button>
            </div>
            {searchedStudent && (
                <div className="p-4 bg-muted rounded-lg border space-y-4">
                    <div>
                        <p className="font-semibold">{searchedStudent.name} - {searchedStudent.class}</p>
                        <p className="text-sm text-muted-foreground">Outstanding Fee: {searchedStudent.totalFee.toLocaleString()} PKR</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="individualIssueDate">Issue Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button id="individualIssueDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !individualIssueDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {individualIssueDate ? format(individualIssueDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={individualIssueDate} onSelect={(d) => setIndividualIssueDate(d || new Date())} initialFocus /></PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="individualDueDate">Due Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button id="individualDueDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !individualDueDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {individualDueDate ? format(individualDueDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={individualDueDate} onSelect={(d) => setIndividualDueDate(d || new Date())} initialFocus /></PopoverContent>
                            </Popover>
                        </div>
                         <div className="flex items-end">
                            <Button className="w-full" size="sm" variant="secondary" onClick={() => handlePrint('individual')}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Voucher
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </CardContent>
       </Card>

      <StudentSearchResultsDialog
        open={isSearchResultsOpen}
        onOpenChange={setIsSearchResultsOpen}
        students={searchResults}
        onStudentSelect={handleStudentSelect}
      />

      <Card>
        <CardHeader>
          <CardTitle>Bulk Class Vouchers</CardTitle>
          <CardDescription>Select a class and set dates to generate fee vouchers for all its students.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Select Class</Label>
              <Select onValueChange={handleClassChange} disabled={appLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="issueDate"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !bulkIssueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bulkIssueDate ? format(bulkIssueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={bulkIssueDate} onSelect={(d) => setBulkIssueDate(d || new Date())} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dueDate"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !bulkDueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bulkDueDate ? format(bulkDueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={bulkDueDate} onSelect={(d) => setBulkDueDate(d || new Date())} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
           <Button onClick={() => handlePrint('class')} disabled={!selectedClassId || isSettingsLoading || isLoadingClassStudents} size="lg">
              {isLoadingClassStudents ? <Loader2 className="animate-spin mr-2" /> : <Printer className="mr-2" />}
              Print Vouchers ({classStudents.length} Students)
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
