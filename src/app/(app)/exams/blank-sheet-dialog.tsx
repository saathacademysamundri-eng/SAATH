
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type SheetType = 'single' | 'full';

export function BlankSheetDialog() {
  const { classes, students, loading: appLoading } = useAppContext();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [examName, setExamName] = useState('Weekly Test');
  const [totalMarks, setTotalMarks] = useState(100);
  const [sheetType, setSheetType] = useState<SheetType>('single');
  const [isPrinting, setIsPrinting] = useState(false);

  const studentsInClass = useMemo(() => {
    if (!selectedClassId) return [];
    const className = classes.find((c) => c.id === selectedClassId)?.name;
    if (!className) return [];
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

    const selectedClass = classes.find((c) => c.id === selectedClassId);
    if (!selectedClass) {
        setIsPrinting(false);
        return;
    }
    const className = selectedClass.name;

    let tableHeaders: string[] = [];
    let tableRows: string = '';
    let reportTitle = '';
    let subTitle = '';

    const sortedStudents = [...studentsInClass].sort((a, b) => a.id.localeCompare(b.id));

    if (sheetType === 'single') {
        reportTitle = examName;
        subTitle = `<p>Class: ${className}</p><p style="font-size: 1rem;">Total Marks: ${totalMarks}</p>`;
        tableHeaders = ["Roll #", "Student Name", "Father's Name", "Obtained Marks"];
        tableRows = sortedStudents.map(student => `
            <tr>
              <td>${student.id}</td>
              <td>${student.name}</td>
              <td>${student.fatherName}</td>
              <td style="height: 25px;"></td>
            </tr>
          `).join('');
    } else { // Full class sheet
        reportTitle = `Class Marks Sheet`;
        subTitle = `<p>Class: ${className}</p>`;
        tableHeaders = ["Roll #", "Student Name", "Father's Name", ...selectedClass.subjects.map(s => s.name)];
        tableRows = sortedStudents.map(student => {
            const subjectCells = selectedClass.subjects.map(() => '<td style="height: 25px;"></td>').join('');
            return `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.fatherName}</td>
                    ${subjectCells}
                </tr>
            `;
        }).join('');
    }


    const printHtml = `
      <html>
        <head>
          <title>Blank Mark Sheet - ${className}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 0.75in; }
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
              <h2>${reportTitle}</h2>
              ${subTitle}
            </div>
            <table>
              <thead>
                <tr>
                  ${tableHeaders.map(h => `<th>${h}</th>`).join('')}
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
        <DialogDescription>Generate a printable blank sheet for manual marking.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="space-y-2">
          <Label>Sheet Type</Label>
          <RadioGroup value={sheetType} onValueChange={(v: any) => setSheetType(v)} className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="font-normal">Single Test</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="full" id="full" />
              <Label htmlFor="full" className="font-normal">Full Class Sheet</Label>
            </div>
          </RadioGroup>
        </div>

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

        {sheetType === 'single' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="exam-name">Exam Name</Label>
              <Input id="exam-name" value={examName} onChange={(e) => setExamName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-marks">Total Marks</Label>
              <Input id="total-marks" type="number" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} />
            </div>
          </>
        )}

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
