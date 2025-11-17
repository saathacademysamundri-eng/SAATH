
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/hooks/use-app-context';
import { useSettings } from '@/hooks/use-settings';
import { format, addDays } from 'date-fns';
import { Newspaper, Printer } from 'lucide-react';
import { useState, useMemo } from 'react';
import QRCode from 'qrcode';

export default function VouchersPage() {
  const { classes, students, loading: appLoading } = useAppContext();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const studentsInClass = useMemo(() => {
    if (!selectedClassId) return [];
    const className = classes.find(c => c.id === selectedClassId)?.name;
    return students.filter(student => student.class === className);
  }, [selectedClassId, students, classes]);

  const handlePrintVouchers = async () => {
    if (!selectedClassId) {
      toast({ variant: 'destructive', title: 'No Class Selected', description: 'Please select a class to generate vouchers.' });
      return;
    }
    if (studentsInClass.length === 0) {
      toast({ variant: 'destructive', title: 'No Students Found', description: 'The selected class has no students to generate vouchers for.' });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Popup Blocked', description: 'Please allow popups for this site.' });
      return;
    }

    let allVouchersHtml = '';
    const dueDate = format(addDays(new Date(), 10), 'PPP');

    for (const student of studentsInClass) {
      const verificationUrl = `${window.location.origin}/p/student/${student.id}`;
      let qrCodeDataUrl = '';
      try {
        qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 128, margin: 1 });
      } catch (error) {
        console.error('QR code generation failed:', error);
      }

      const voucherHtml = `
        <div class="voucher-container">
          <div class="header">
              ${settings.logo ? `<img src="${settings.logo}" alt="logo">` : ''}
              <h1>${settings.name}</h1>
              <p>${settings.address}</p>
              <p>Phone: ${settings.phone}</p>
          </div>
          <h2>Fee Voucher</h2>
          <table class="details">
              <tr><td><strong>Student Name:</strong></td><td>${student.name}</td><td><strong>Roll No:</strong></td><td>${student.id}</td></tr>
              <tr><td><strong>Father's Name:</strong></td><td>${student.fatherName}</td><td><strong>Class:</strong></td><td>${student.class}</td></tr>
              <tr><td><strong>Issue Date:</strong></td><td>${format(new Date(), 'PPP')}</td><td><strong>Due Date:</strong></td><td>${dueDate}</td></tr>
          </table>
          <table class="fee-details">
              <thead><tr><th>Description</th><th class="text-right">Amount (PKR)</th></tr></thead>
              <tbody><tr><td>Tuition Fee</td><td class="text-right">${student.totalFee.toLocaleString()}</td></tr></tbody>
              <tfoot><tr class="total-row"><td>Total Amount Due</td><td class="text-right">${student.totalFee.toLocaleString()}</td></tr></tfoot>
          </table>
          <div class="qr-section">
             ${qrCodeDataUrl ? `
                  <p><strong>Scan to check status online</strong></p>
                  <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 100px; height: 100px;" />
              ` : ''}
          </div>
           <div class="slip-container">
              <div class="slip">
                  <h4>Bank Copy</h4>
                  <p><strong>Student:</strong> ${student.name} (${student.id})</p>
                  <p><strong>Amount:</strong> ${student.totalFee.toLocaleString()} PKR</p>
                  <p><strong>Due Date:</strong> ${dueDate}</p>
              </div>
              <div class="slip">
                  <h4>Student Copy</h4>
                  <p><strong>Student:</strong> ${student.name} (${student.id})</p>
                  <p><strong>Amount:</strong> ${student.totalFee.toLocaleString()} PKR</p>
                  <p><strong>Due Date:</strong> ${dueDate}</p>
              </div>
          </div>
        </div>
      `;
      allVouchersHtml += voucherHtml;
    }
    
    const finalHtml = `
        <html>
            <head><title>Class Fee Vouchers - ${classes.find(c => c.id === selectedClassId)?.name}</title>
             <style>
                body { font-family: Calibri, sans-serif; }
                .voucher-container { 
                  width: 800px; 
                  margin: auto; 
                  padding: 20px; 
                  border: 1px solid #ccc; 
                  page-break-after: always; /* Ensure each voucher is on a new page */
                  height: 1050px; /*Approx A4 height*/
                  display: flex;
                  flex-direction: column;
                }
                .voucher-container:last-child { page-break-after: auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .header img { max-height: 80px; margin-bottom: 10px; }
                .header h1 { margin: 0; }
                .details, .fee-details { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .details td, .fee-details th, .fee-details td { border: 1px solid #ccc; padding: 8px; }
                .fee-details th { background-color: #f2f2f2; text-align: left;}
                .text-right { text-align: right; }
                .total-row td { font-weight: bold; }
                .slip-container { display: flex; justify-content: space-between; gap: 20px; margin-top: auto; }
                .slip { border: 1px solid #000; padding: 10px; width: 48%; }
                .qr-section { text-align: center; margin-top: 20px; }
                .qr-section img { margin: auto; }
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 0.5in;
                  }
                  body { -webkit-print-color-adjust: exact; }
                }
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
        <h1 className="text-2xl font-bold tracking-tight">Generate Class Vouchers</h1>
        <p className="text-muted-foreground">
          Create and print A4 fee vouchers for an entire class at once.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Voucher Generation</CardTitle>
          <CardDescription>Select a class to generate fee vouchers for all its students.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Select Class</Label>
            <Select onValueChange={setSelectedClassId} disabled={appLoading}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a class..." />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handlePrintVouchers} disabled={!selectedClassId || isSettingsLoading}>
            <Printer className="mr-2" />
            Print Vouchers ({studentsInClass.length} Students)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
