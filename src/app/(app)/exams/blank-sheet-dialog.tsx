
'use client';

import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { useAppContext } from '@/hooks/use-app-context';
import { Printer, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';

export function BlankSheetDialog() {
  const { classes, students, loading: appLoading } = useAppContext();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [examName, setExamName] = useState('Weekly Test');
  const [totalMarks, setTotalMarks] = useState(100);
  const [isPrinting, setIsPrinting] = useState(false);

  const studentsInClass = useMemo(() => {
    if (!selectedClassId) return [];
    const className = classes.find((c) => c.id === selectedClassId)?.name;
    return students.filter((student) => student.class === className);
  }, [selectedClassId, students, classes]);

  const handlePrint = () => {
    if (!selectedClassId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a class.' });
      return;
    }
    if (studentsInClass.length === 0) {
      toast({ variant: 'destructive', title: 'No Students', description: 'Selected class has no students.' });
      return;
    }

    setIsPrinting(true);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please allow popups for this site.' });
      setIsPrinting(false);
      return;
    }

    const className = classes.find((c) => c.id === selectedClassId)?.name || '';

    const tableRows = studentsInClass
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(
        (student) => `
        <tr>
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${student.fatherName}</td>
          <td style="height: 25px;"></td>
        </tr>
      `
      )
      .join('');

    const printHtml = `
      <html>
        <head>
          <title>Blank Mark Sheet - ${className}</title>
          <style>
            @media print {
              @page { size: A4 portrait; margin: 0.75in; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fff; color: #000; font-size: 10pt; }
            .report-container { max-width: 1000px; margin: auto; padding: 20px; }
            .academy-details { text-align: center; margin-bottom: 2rem; }
            .academy-details img { height: 60px; margin-bottom: 0.5rem; object-fit: contain; }
            .academy-details h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
            .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
            .report-title { text-align: center; margin: 2rem 0; }
            .report-title h2 { font-size: 1.8rem; font-weight: bold; margin: 0 0 0.5rem 0; }
            .report-title p { font-size: 1.1rem; color: #555; margin: 0; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
            th, td { padding: 8px 10px; border: 1px solid #333; }
            th { font-weight: bold; background-color: #f2f2f2; text-align: center; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="academy-details">
              ${settings.logo ? `<img src="${settings.logo}" alt="Academy Logo" />` : ''}
              <h1>${settings.name}</h1>
              <p>${settings.address}</p>
              <p>Phone: ${settings.phone}</p>
            </div>
            <div class="report-title">
              <h2>${examName}</h2>
              <p>Class: ${className}</p>
              <p style="font-size: 1rem;">Total Marks: ${totalMarks}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 15%;">Roll #</th>
                  <th style="width: 30%;">Student Name</th>
                  <th style="width: 30%;">Father's Name</th>
                  <th style="width: 25%;">Obtained Marks</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printHtml);
    printWindow.document.close();
    setIsPrinting(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Print Blank Marks Sheet</DialogTitle>
        <DialogDescription>Select a class and define the exam details to generate a printable blank sheet for manual marking.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="class-select">Class</Label>
          <Select onValueChange={setSelectedClassId} value={selectedClassId || undefined} disabled={appLoading}>
            <SelectTrigger id="class-select">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="exam-name">Exam Name</Label>
          <Input id="exam-name" value={examName} onChange={(e) => setExamName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total-marks">Total Marks</Label>
          <Input id="total-marks" type="number" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button onClick={handlePrint} disabled={isPrinting || isSettingsLoading || !selectedClassId}>
          {isPrinting ? <Loader2 className="mr-2 animate-spin" /> : <Printer className="mr-2" />}
          Print Sheet
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
