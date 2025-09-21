'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { students as initialStudents, type Student } from '@/lib/data';
import { Printer, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { format } from 'date-fns';

export default function FeeCollectionPage() {
  const [search, setSearch] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const { toast } = useToast();
  const router = useRouter();
  const { settings } = useSettings();

  const handleSearch = () => {
    if (!search.trim()) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please enter a student roll number to search.',
        });
        setSearchedStudent(null);
        return;
    }
    const student = initialStudents.find(
      s => s.id.toLowerCase() === search.toLowerCase()
    );
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
  };

  const handlePrintReceipt = () => {
    if (searchedStudent) {
      if (paidAmount <= 0) {
        toast({
          variant: 'destructive',
          title: 'Cannot Print Receipt',
          description: 'No payment has been recorded.',
        });
        return;
      }
      
      const balance = searchedStudent.totalFee - paidAmount;
      const receiptDate = format(new Date(), 'dd/MM/yyyy, hh:mm a');
      const receiptId = `RCPT-${Date.now()}`.substring(0, 15);

      const receiptWindow = window.open('', '_blank');
      if (receiptWindow) {
        receiptWindow.document.write(`
          <html>
            <head>
              <title>Fee Receipt</title>
              <style>
                @media print {
                  @page {
                    size: 80mm;
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    -webkit-print-color-adjust: exact;
                  }
                }
                body {
                  font-family: sans-serif;
                  background-color: white;
                  color: black;
                  margin: 0;
                  padding: 2mm;
                  width: 80mm;
                }
                .receipt-container {
                  width: 100%;
                  margin: 0 auto;
                }
                .text-center { text-align: center; }
                .space-y-1 > * + * { margin-top: 0.25rem; }
                .h-16 { height: 4rem; }
                .w-16 { width: 4rem; }
                .flex { display: flex; }
                .justify-center { justify-content: center; }
                .object-contain { object-fit: contain; }
                .text-lg { font-size: 1.125rem; }
                .font-bold { font-weight: 700; }
                .text-xs { font-size: 0.75rem; }
                .border-t { border-top: 1px dashed black; }
                .border-b { border-bottom: 1px dashed black; }
                .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
                .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                .flex-justify-between { display: flex; justify-content: space-between; }
                .mb-2 { margin-bottom: 0.5rem; }
                .w-full { width: 100%; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .font-semibold { font-weight: 600; }
                .mt-2 { margin-top: 0.5rem; }
                .w-1-2 { width: 50%; }
                .ml-auto { margin-left: auto; }
                .font-medium { font-weight: 500; }
                .mt-4 { margin-top: 1rem; }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                  <div class="text-center space-y-1">
                      <div class="flex justify-center">
                          <div class="h-16 w-16">
                              <img src="${settings.logo}" alt="Academy Logo" style="height: 100%; width: 100%; object-fit: contain;" />
                          </div>
                      </div>
                      <div>
                          <h1 class='text-lg font-bold'>${settings.name}</h1>
                          <p class='text-xs'>${settings.address}</p>
                          <p class='text-xs'>Phone: ${settings.phone}</p>
                      </div>
                  </div>
                  
                  <div class="border-t border-b my-2 py-1 text-xs">
                      <div class='flex-justify-between'>
                          <span>Receipt #: ${receiptId}</span>
                          <span>Date: ${receiptDate}</span>
                      </div>
                  </div>

                  <div class='text-xs mb-2'>
                      <p><strong>Student:</strong> ${searchedStudent.name} (${searchedStudent.id})</p>
                      <p><strong>Class:</strong> ${searchedStudent.class}</p>
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
                              <td class="py-1 text-right">${searchedStudent.totalFee.toLocaleString()}</td>
                          </tr>
                      </tbody>
                  </table>
                  
                  <div class='flex justify-end mt-2'>
                      <table class="w-1-2 ml-auto text-xs">
                          <tbody>
                              <tr>
                                  <td class="py-0.5">Total Due:</td>
                                  <td class="py-0.5 text-right font-medium">${searchedStudent.totalFee.toLocaleString()}</td>
                              </tr>
                              <tr>
                                  <td class="py-0.5">Amount Paid:</td>
                                  <td class="py-0.5 text-right font-medium">${paidAmount.toLocaleString()}</td>
                              </tr>
                              <tr class="font-bold border-t" style="border-top: 1px solid black;">
                                  <td class="py-1">Balance:</td>
                                  <td class="py-1 text-right">${balance.toLocaleString()}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>

                  <div class='text-center text-xs mt-4 space-y-1'>
                      <p>*** Thank you for your payment! ***</p>
                      <p>&copy; ${new Date().getFullYear()} ${settings.name}.</p>
                  </div>
              </div>
            </body>
          </html>
        `);
        receiptWindow.document.close();
      }
    }
  };
  
  const balance = searchedStudent ? searchedStudent.totalFee - paidAmount : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fee Collection</h1>
        <p className="text-muted-foreground">
          Search for a student to collect fees and view outstanding dues.
        </p>
      </div>
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
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
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
                            <p className='text-sm text-muted-foreground'>Total Fee</p>
                            <p className='text-2xl font-bold'>{searchedStudent.totalFee.toLocaleString()} PKR</p>
                        </div>
                         <div className='p-4 bg-secondary rounded-lg'>
                            <p className='text-sm text-muted-foreground'>Balance</p>
                            <p className='text-2xl font-bold'>{balance.toLocaleString()} PKR</p>
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
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Remaining Dues (PKR)</Label>
                        <Input value={balance.toLocaleString()} readOnly disabled />
                    </div>
                 </CardContent>
                 <CardContent className='flex gap-2'>
                    <Button onClick={() => toast({ title: 'Payment Recorded', description: `Paid ${paidAmount} for ${searchedStudent.name}`})}>Collect Fee</Button>
                    <Button variant="outline" onClick={handlePrintReceipt}>
                        <Printer className="mr-2"/>
                        Print Receipt
                    </Button>
                 </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
