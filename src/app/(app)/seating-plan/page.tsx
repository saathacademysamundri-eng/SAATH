
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/hooks/use-app-context';
import { useSettings } from '@/hooks/use-settings';
import { Student } from '@/lib/data';
import { Armchair, Printer } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export default function SeatingPlanPage() {
  const { classes, students, loading: appLoading } = useAppContext();
  const { settings, isSettingsLoading } = useSettings();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [examName, setExamName] = useState('Mid-Term Exam');
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [seatingPlan, setSeatingPlan] = useState<(Student | null)[][]>([]);

  const handleGeneratePlan = () => {
    if (!selectedClassId) return;

    const className = classes.find(c => c.id === selectedClassId)?.name;
    const studentsInClass = students.filter(s => s.class === className);
    const shuffledStudents = shuffleArray([...studentsInClass]);

    const plan: (Student | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
    
    let studentIndex = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (studentIndex < shuffledStudents.length) {
          plan[r][c] = shuffledStudents[studentIndex];
          studentIndex++;
        }
      }
    }
    setSeatingPlan(plan);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const className = classes.find(c => c.id === selectedClassId)?.name || 'N/A';
    const currentDate = format(new Date(), 'PPP');

    const tableHeader = `
      <thead>
        <tr>
          ${Array.from({ length: cols }).map((_, cIdx) => `<th>Line ${cIdx + 1}</th>`).join('')}
        </tr>
      </thead>
    `;

    const tableRows = seatingPlan.map(row => `
        <tr>
            ${row.map(student => `
                <td style="height: 100px; width: 120px; vertical-align: top; border: 1px solid #ccc; padding: 5px; text-align: center;">
                    ${student ? `
                        <div style="font-weight: bold; font-size: 1.1em;">${student.name}</div>
                        <div style="font-size: 0.9em; color: #555;">${student.id}</div>
                    ` : ''}
                </td>
            `).join('')}
        </tr>
    `).join('');

    const printHtml = `
      <html>
        <head>
          <title>Seating Plan - ${className}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 0.5in; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: 'Segoe UI', sans-serif; }
            .report-container { max-width: 1100px; margin: auto; }
            .academy-details { text-align: center; margin-bottom: 1rem; }
            .academy-details h1 { font-size: 1.5rem; }
            .report-title { text-align: center; margin-bottom: 1rem; }
            .report-title h2 { margin-bottom: 0.5rem; }
            .report-title p { margin: 0.25rem 0; font-size: 1rem; color: #333; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; vertical-align: middle; }
            th { font-weight: bold; background-color: #f2f2f2; }
            td { height: 80px; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="academy-details">
              ${settings.logo ? `<img src="${settings.logo}" alt="Logo" style="height: 50px; margin: auto;">` : ''}
              <h1>${settings.name}</h1>
               <p>${settings.phone}</p>
            </div>
            <div class="report-title">
              <h2>Seating Plan</h2>
              <p><strong>Exam:</strong> ${examName}</p>
              <p><strong>Class:</strong> ${className}</p>
              <p><strong>Date:</strong> ${currentDate}</p>
            </div>
            <table>
              ${tableHeader}
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seating Plan Generator</h1>
        <p className="text-muted-foreground">Create and print randomized seating arrangements for classes or exams.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Select a class and define the grid size for the seating plan.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select onValueChange={setSelectedClassId} disabled={appLoading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="examName">Exam Name</Label>
            <Input id="examName" value={examName} onChange={e => setExamName(e.target.value)} className="w-48" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rows">Rows</Label>
            <Input id="rows" type="number" value={rows} onChange={e => setRows(Number(e.target.value))} className="w-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cols">Columns</Label>
            <Input id="cols" type="number" value={cols} onChange={e => setCols(Number(e.target.value))} className="w-24" />
          </div>
          <Button onClick={handleGeneratePlan} disabled={!selectedClassId}>
            <Armchair className="mr-2" />
            Generate Plan
          </Button>
          {seatingPlan.length > 0 && (
            <Button onClick={handlePrint} variant="outline" disabled={isSettingsLoading}>
              <Printer className="mr-2" />
              Print Plan
            </Button>
          )}
        </CardContent>
      </Card>

      {seatingPlan.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Seating Plan</CardTitle>
            <CardDescription>
              A randomized seating arrangement for {classes.find(c => c.id === selectedClassId)?.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {Array.from({ length: cols }).map((_, cIdx) => (
                      <th key={`col-header-${cIdx}`} className="border border-border p-2 font-semibold bg-muted">
                        Line {cIdx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {seatingPlan.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((student, cIdx) => (
                        <td key={cIdx} className="border border-border p-2 text-center align-top h-28 w-40">
                          {student && (
                            <div className="flex flex-col items-center justify-center h-full">
                              <p className="font-bold text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.id}</p>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    