

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { type Exam, type Student, type StudentResult } from '@/lib/data';
import { getExam, getStudentsByClass, saveExamResults } from '@/lib/firebase/firestore';
import { Loader2, Printer, FileImage } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import html2canvas from 'html2canvas';

type EnhancedResult = {
    studentId: string;
    studentName: string;
    totalMarks: number;
    percentage: number;
    position: number;
};

export default function ExamResultsPage() {
  const params = useParams();
  const examId = params.examId as string;
  const { toast } = useToast();
  const { settings, isSettingsLoading } = useSettings();

  const [exam, setExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<{ [studentId: string]: StudentResult }>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPosition, setShowPosition] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!examId) return;

    async function fetchExamData() {
      setLoading(true);
      const examData = await getExam(examId);
      if (examData) {
        setExam(examData);
        if (examData.subjects.length <= 1) {
            setShowPosition(false);
        } else {
            setShowPosition(true);
        }
        const studentData = await getStudentsByClass(examData.className);
        // Sort students by ID to ensure a consistent order
        const sortedStudents = studentData.sort((a, b) => a.id.localeCompare(b.id));
        setStudents(sortedStudents);

        // Initialize results state
        const initialResults: { [studentId: string]: StudentResult } = {};
        sortedStudents.forEach(student => {
          const existingResult = examData.results?.find(r => r.studentId === student.id);
          if (existingResult) {
            initialResults[student.id] = existingResult;
          } else {
             initialResults[student.id] = {
              studentId: student.id,
              studentName: student.name,
              marks: {},
            };
          }
        });
        setResults(initialResults);

      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Exam not found.' });
      }
      setLoading(false);
    }
    fetchExamData();
  }, [examId, toast]);

  const handleMarksChange = (studentId: string, subjectName: string, value: string) => {
    let finalValue: number | string | null;
    if (value.trim().toLowerCase() === 'a') {
      finalValue = 'A';
    } else {
      const numericValue = Number(value);
      finalValue = value === '' ? null : isNaN(numericValue) ? results[studentId]?.marks[subjectName] ?? '' : numericValue;
    }

    setResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks: {
          ...prev[studentId].marks,
          [subjectName]: finalValue,
        },
      },
    }));
  };
  
  const handleSaveResults = async () => {
    if (!examId || !exam) return;
    
    setIsSaving(true);
    const resultsArray = Object.values(results);
    const result = await saveExamResults(examId, resultsArray);

    if (result.success) {
      toast({ title: 'Results Saved', description: 'Student marks have been updated.' });
    } else {
      toast({ variant: 'destructive', title: 'Save Failed', description: result.message });
    }
    setIsSaving(false);
  }

  const enhancedResults = useMemo((): EnhancedResult[] => {
    if (!exam) return [];
    
    const maxMarksPerSubject = exam.totalMarks;
    const totalMaxMarks = exam.subjects.length * maxMarksPerSubject;

    const studentTotals = students.map(student => {
      const studentResult = results[student.id];
      const totalMarks = exam.subjects.reduce((acc, subject) => {
        const mark = studentResult?.marks[subject];
        return acc + (typeof mark === 'number' ? mark : 0);
      }, 0);
      
      const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        totalMarks,
        percentage,
      };
    });

    const sortedForRanking = [...studentTotals].sort((a, b) => b.totalMarks - a.totalMarks);
    
    const finalResultsWithPosition: EnhancedResult[] = [];
    let rank = 0;
    let lastMark = -1;

    // Assign positions
    const rankedStudents = new Map<number, number>();
    sortedForRanking.forEach((student, index) => {
      if (student.totalMarks !== lastMark) {
        rank = index + 1;
        lastMark = student.totalMarks;
      }
      rankedStudents.set(student.totalMarks, rank);
    });

    return studentTotals.map(s => ({
      ...s,
      position: rankedStudents.get(s.totalMarks) || 0,
    }))

  }, [results, students, exam]);

  const totalMaxMarks = useMemo(() => {
    if (!exam) return 0;
    return exam.subjects.length * exam.totalMarks;
  }, [exam]);

  const getStudentEnhancedResult = (studentId: string) => {
    return enhancedResults.find(r => r.studentId === studentId);
  }

  const generatePrintContent = () => {
    if (isSettingsLoading || !exam || !students.length || !printRef.current) {
        toast({ variant: 'destructive', title: 'Cannot Proceed', description: 'Data is not fully loaded.' });
        return;
    }
    
    const element = printRef.current;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please allow popups for this site.' });
        return;
    }
    printWindow.document.write('<html><head><title>Print</title>');
    const styles = Array.from(document.styleSheets)
        .map(s => `<link rel="stylesheet" href="${s.href}">`)
        .join('');
    printWindow.document.write(styles);
    printWindow.document.write(`<style>
        @media print { @page { size: A4; margin: 0.75in; } }
        body { -webkit-print-color-adjust: exact; }
        .printable-content { margin: 0; padding: 0; }
    </style>`);
    printWindow.document.write('</head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };
  
  const generateImage = () => {
    if (isSettingsLoading || !exam || !students.length || !printRef.current) {
        toast({ variant: 'destructive', title: 'Cannot Proceed', description: 'Data is not fully loaded.' });
        return;
    }
    const element = printRef.current;
     html2canvas(element, { 
            scale: 2, // for higher quality
            useCORS: true,
            backgroundColor: 'white',
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `${exam.name.replace(/ /g, '_')}_results.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
        });
  }

 const printableTableHeaders = useMemo(() => {
    if (!exam) return '';
    let headers = `
        <th>Roll #</th>
        <th>Student Name</th>
        <th>Father's Name</th>
    `;
    headers += exam.subjects.map(s => `<th>${s}<br>(${exam.totalMarks})</th>`).join('');
    if (exam.subjects.length > 1) {
        headers += `<th>Total</th>`;
    }
    headers += `<th>%age</th>`;
    if (showPosition) {
        headers += `<th>Pos.</th>`;
    }
    return `<tr>${headers}</tr>`;
  }, [exam, showPosition]);

  const printableTableBody = useMemo(() => {
    if (!exam || !students.length) return '';
    return students.map(student => {
      const enhanced = getStudentEnhancedResult(student.id);
      const marksCells = exam.subjects.map(subject => {
        const marks = results[student.id]?.marks[subject];
        const isAbsent = marks === 'A';
        const cellStyle = isAbsent ? 'background-color: #fee2e2; color: #991b1b; font-weight: bold; text-align: center;' : 'text-align: center;';
        return `<td style="${cellStyle}">${marks ?? '-'}</td>`;
      }).join('');
      
      const totalCell = exam.subjects.length > 1 ? `<td style="text-align: center; font-weight: bold;">${enhanced?.totalMarks ?? 0}</td>` : '';
      const percentageCell = `<td style="text-align: center;">${enhanced?.percentage.toFixed(2) ?? '0.00'}%</td>`;
      const positionCell = showPosition ? `<td style="text-align: center; font-weight: bold;">${enhanced?.position ?? '-'}</td>` : '';

      return `
        <tr>
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${student.fatherName}</td>
          ${marksCells}
          ${totalCell}
          ${percentageCell}
          ${positionCell}
        </tr>
      `;
    }).join('');
  }, [exam, students, results, enhancedResults, showPosition]);


  if (loading) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-80" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-10 w-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-96 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!exam) {
    return <div>Exam not found.</div>;
  }

  return (
    <>
      {/* Hidden div for printing/saving */}
       <div className="absolute -left-[9999px] top-auto w-[1000px] bg-white text-black p-4" ref={printRef}>
          <style>{`
            .printable-content body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0; padding: 0; background-color: #fff; color: #000; font-size: 10pt;
            }
            .report-container { max-width: 1000px; margin: auto; padding: 20px; }
            .academy-details { display: flex; align-items: center; justify-content: center; text-align: center; margin-bottom: 2rem; }
            .academy-details img { height: 60px; object-fit: contain; margin-right: 1.5rem; }
            .academy-details h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
            .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
            .report-title { text-align: center; margin: 2rem 0; }
            .report-title h2 { font-size: 1.8rem; font-weight: bold; margin: 0 0 0.5rem 0; }
            .report-title p { font-size: 1.1rem; color: #555; margin: 0; }
            .printable-content table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
            .printable-content th, .printable-content td { padding: 8px 10px; border: 1px solid #ddd; }
            .printable-content th { font-weight: bold; background-color: #f2f2f2; text-align: center; }
            .printable-content tr:nth-child(even) { background-color: #f9f9f9; }
          `}</style>
          <div className="report-container printable-content">
              <div className="academy-details">
                {settings.logo && <img src={settings.logo} alt="Academy Logo" />}
                <div>
                    <h1>${settings.name}</h1>
                    <p>${settings.address}</p>
                    <p>Phone: ${settings.phone}</p>
                </div>
              </div>
              <div className="report-title">
                <h2>Exam Results</h2>
                <p>${exam.name} - ${exam.className}</p>
                <p style={{fontSize: '0.9rem', color: '#555'}}>Total Marks: ${totalMaxMarks}</p>
              </div>
              <table>
                 <thead dangerouslySetInnerHTML={{ __html: printableTableHeaders }} />
                 <tbody dangerouslySetInnerHTML={{ __html: printableTableBody }} />
              </table>
          </div>
        </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">${exam.name}</h1>
          <p className="text-muted-foreground">Enter marks for students of ${exam.className}.</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Enter Marks</CardTitle>
                <CardDescription>Enter the marks obtained or 'A' for absent students.</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="show-position" checked={showPosition} onCheckedChange={setShowPosition} />
                  <Label htmlFor="show-position">Show Position</Label>
                </div>
                <Button onClick={handleSaveResults} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 animate-spin" />}
                  Save Results
                </Button>
                <Button variant="outline" onClick={generatePrintContent}>
                    <Printer className="mr-2" />
                    Print Results
                </Button>
                <Button variant="outline" onClick={generateImage}>
                    <FileImage className="mr-2" />
                    Save as JPG
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Student</TableHead>
                    <TableHead className="min-w-[150px]">Father's Name</TableHead>
                    {exam.subjects.map(subject => (
                      <TableHead key={subject} className="text-center">{subject}</TableHead>
                    ))}
                    {exam.subjects.length > 1 && <TableHead className="text-center font-bold">Obtained</TableHead>}
                    {exam.subjects.length > 1 && <TableHead className="text-center font-bold">Total</TableHead>}
                    <TableHead className="text-center font-bold">%</TableHead>
                    {showPosition && <TableHead className="text-center font-bold">Pos.</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={2} className="font-semibold">Total Marks</TableCell>
                      {exam.subjects.map(subject => (
                          <TableCell key={subject} className="text-center font-semibold">
                            <div className="flex justify-center">
                                  <div className="w-20 rounded-md bg-background py-1 px-2">{exam.totalMarks}</div>
                            </div>
                          </TableCell>
                      ))}
                      {exam.subjects.length > 1 && <TableCell className="text-center font-bold">${totalMaxMarks}</TableCell>}
                      {exam.subjects.length > 1 && <TableCell></TableCell>}
                      <TableCell></TableCell>
                      {showPosition && <TableCell></TableCell>}
                  </TableRow>
                  {students.map(student => {
                    const enhanced = getStudentEnhancedResult(student.id);
                    return(
                      <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}<br/><span className="text-xs text-muted-foreground">{student.id}</span></TableCell>
                          <TableCell className="font-medium">{student.fatherName}</TableCell>
                          {exam.subjects.map(subject => {
                            const marks = results[student.id]?.marks[subject] ?? '';
                            return (
                              <TableCell key={subject}>
                                <Input
                                  type="text"
                                  placeholder="-"
                                  className="max-w-[80px] mx-auto text-center"
                                  value={marks}
                                  onChange={(e) => handleMarksChange(student.id, subject, e.target.value)}
                                />
                              </TableCell>
                            )
                          })}
                          {exam.subjects.length > 1 && <TableCell className="text-center font-medium">${enhanced?.totalMarks}</TableCell>}
                          {exam.subjects.length > 1 && <TableCell className="text-center font-medium">${totalMaxMarks}</TableCell>}
                          <TableCell className="text-center font-medium">${enhanced?.percentage.toFixed(2)}%</TableCell>
                          {showPosition && <TableCell className="text-center font-bold text-lg">${enhanced?.position}</TableCell>}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
