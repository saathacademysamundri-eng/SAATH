

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
import { Loader2, Printer } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

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

  useEffect(() => {
    if (!examId) return;

    async function fetchExamData() {
      setLoading(true);
      const examData = await getExam(examId);
      if (examData) {
        setExam(examData);
        const studentData = await getStudentsByClass(examData.className);
        setStudents(studentData);

        // Initialize results state
        const initialResults: { [studentId: string]: StudentResult } = {};
        studentData.forEach(student => {
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

  const handleMarksChange = (studentId: string, subjectName: string, marks: string) => {
    const numericMarks = marks === '' ? null : Number(marks);

    setResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks: {
          ...prev[studentId].marks,
          [subjectName]: numericMarks,
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

    // Sort by total marks descending to calculate position
    const sortedStudents = [...studentTotals].sort((a, b) => b.totalMarks - a.totalMarks);

    // Assign positions, handling ties
    let rank = 0;
    let lastMark = -1;
    return sortedStudents.map((student, index) => {
      if (student.totalMarks !== lastMark) {
        rank = index + 1;
        lastMark = student.totalMarks;
      }
      return { ...student, position: rank };
    });

  }, [results, students, exam]);

  const totalMaxMarks = useMemo(() => {
    if (!exam) return 0;
    return exam.subjects.length * exam.totalMarks;
  }, [exam]);

  const getStudentEnhancedResult = (studentId: string) => {
    return enhancedResults.find(r => r.studentId === studentId);
  }

  const handlePrint = () => {
    if (isSettingsLoading || !exam || !students.length) {
      toast({ variant: 'destructive', title: 'Cannot Print', description: 'Data is not fully loaded.' });
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please allow popups for this site.' });
        return;
    }

    const maxMarksPerSubject = exam.totalMarks;
    const totalMaxMarks = exam.subjects.length * maxMarksPerSubject;
    const tableHeader = exam.subjects.map(s => `<th style="text-align: center;">${s}<br>(${maxMarksPerSubject})</th>`).join('');
    
    const tableRows = students
      .sort((a, b) => {
          const resA = getStudentEnhancedResult(a.id)?.position ?? Infinity;
          const resB = getStudentEnhancedResult(b.id)?.position ?? Infinity;
          return resA - resB;
      })
      .map(student => {
        const studentResult = results[student.id];
        const enhanced = getStudentEnhancedResult(student.id);

        const marksCells = exam.subjects.map(subject => {
            const marks = studentResult?.marks[subject];
            return `<td style="text-align: center;">${marks ?? '-'}</td>`;
        }).join('');

        return `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                ${marksCells}
                <td style="text-align: center; font-weight: bold;">${enhanced?.totalMarks ?? 0}</td>
                <td style="text-align: center;">${enhanced?.percentage.toFixed(2) ?? '0.00'}%</td>
                <td style="text-align: center; font-weight: bold;">${enhanced?.position ?? '-'}</td>
            </tr>
        `;
    }).join('');

    const printHtml = `
      <html>
        <head>
          <title>Exam Results - ${exam.name}</title>
          <style>
            @media print {
              @page { size: A4; margin: 0.75in; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0; 
              padding: 0; 
              background-color: #fff;
              color: #000;
              font-size: 10pt;
            }
            .report-container { max-width: 1000px; margin: auto; padding: 20px; }
            .academy-details { text-align: center; margin-bottom: 2rem; }
            .academy-details img { height: 60px; margin-bottom: 0.5rem; object-fit: contain; }
            .academy-details h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
            .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
            .report-title { text-align: center; margin: 2rem 0; }
            .report-title h2 { font-size: 1.8rem; font-weight: bold; margin: 0 0 0.5rem 0; }
            .report-title p { font-size: 1.1rem; color: #555; margin: 0; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
            th, td { padding: 8px 10px; border: 1px solid #ddd; }
            th { font-weight: bold; background-color: #f2f2f2; text-align: center; }
            tr:nth-child(even) { background-color: #f9f9f9; }
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
              <h2>Exam Results</h2>
              <p>${exam.name} - ${exam.className}</p>
              <p style="font-size: 0.9rem; color: #555;">Total Marks: ${totalMaxMarks}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Roll #</th>
                  <th>Student Name</th>
                  ${tableHeader}
                  <th>Total</th>
                  <th>%age</th>
                  <th>Pos.</th>
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
  };

  if (loading) {
    return null;
  }

  if (!exam) {
    return <div>Exam not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{exam.name}</h1>
        <p className="text-muted-foreground">Enter marks for students of {exam.className}.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Enter Marks</CardTitle>
              <CardDescription>Enter the marks obtained by each student in the subjects below.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveResults} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 animate-spin" />}
                Save Results
              </Button>
               <Button variant="outline" onClick={handlePrint} disabled={isSettingsLoading}>
                <Printer className="mr-2 h-4 w-4" />
                Print Results
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
                  {exam.subjects.map(subject => (
                    <TableHead key={subject} className="text-center">{subject}</TableHead>
                  ))}
                  <TableHead className="text-center font-bold">Obtained</TableHead>
                  <TableHead className="text-center font-bold">Total</TableHead>
                  <TableHead className="text-center font-bold">%</TableHead>
                  <TableHead className="text-center font-bold">Pos.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell className="font-semibold">Total Marks</TableCell>
                    {exam.subjects.map(subject => (
                        <TableCell key={subject} className="text-center font-semibold">
                           <div className="flex justify-center">
                                <div className="w-20 rounded-md bg-background py-1 px-2">{exam.totalMarks}</div>
                           </div>
                        </TableCell>
                    ))}
                    <TableCell className="text-center font-bold">{totalMaxMarks}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                </TableRow>
                {students.sort((a,b) => {
                    const resA = getStudentEnhancedResult(a.id)?.position ?? Infinity;
                    const resB = getStudentEnhancedResult(b.id)?.position ?? Infinity;
                    return resA - resB;
                }).map(student => {
                   const enhanced = getStudentEnhancedResult(student.id);
                   return(
                    <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}<br/><span className="text-xs text-muted-foreground">{student.id}</span></TableCell>
                        {exam.subjects.map(subject => (
                        <TableCell key={subject}>
                            <Input
                            type="number"
                            placeholder="-"
                            className="max-w-[80px] mx-auto text-center"
                            value={results[student.id]?.marks[subject] ?? ''}
                            onChange={e => handleMarksChange(student.id, subject, e.target.value)}
                            />
                        </TableCell>
                        ))}
                        <TableCell className="text-center font-medium">{enhanced?.totalMarks}</TableCell>
                        <TableCell className="text-center font-medium">{totalMaxMarks}</TableCell>
                        <TableCell className="text-center font-medium">{enhanced?.percentage.toFixed(2)}%</TableCell>
                        <TableCell className="text-center font-bold text-lg">{enhanced?.position}</TableCell>
                    </TableRow>
                   )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
