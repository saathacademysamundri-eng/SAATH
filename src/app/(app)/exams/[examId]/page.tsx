
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

  const examSubjects = useMemo(() => {
    if (!exam) return [];
    if (exam.examType === 'Single Subject') {
      return exam.subjects;
    }
    if (students.length > 0 && students[0].subjects) {
        // For full tests, aggregate subjects from all students in the class
        const allClassSubjects = new Set<string>();
        students.forEach(student => {
            student.subjects.forEach(s => allClassSubjects.add(s.subject_name));
        });
        return Array.from(allClassSubjects);
    }
    return [];
  }, [exam, students]);

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

    const tableHeader = examSubjects.map(s => `<th style="text-align: center;">${s}</th>`).join('');
    const tableRows = students
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(student => {
        const studentResult = results[student.id];
        const marksCells = examSubjects.map(subject => {
            const marks = studentResult?.marks[subject];
            return `<td style="text-align: center;">${marks ?? '-'}</td>`;
        }).join('');
        return `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                ${marksCells}
            </tr>
        `;
    }).join('');

    const printHtml = `
      <html>
        <head>
          <title>Exam Results - ${exam.name}</title>
          <style>
            @media print {
              @page { size: A4; margin: 1in; }
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
            .report-container { max-width: 800px; margin: auto; padding: 20px; }
            .academy-details { text-align: center; margin-bottom: 2rem; }
            .academy-details img { height: 80px; margin-bottom: 0.5rem; object-fit: contain; }
            .academy-details h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
            .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
            .report-title { text-align: center; margin: 2rem 0; }
            .report-title h2 { font-size: 1.8rem; font-weight: bold; margin: 0 0 0.5rem 0; }
            .report-title p { font-size: 1.1rem; color: #555; margin: 0; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
            th, td { padding: 8px 12px; border: 1px solid #ddd; }
            th { font-weight: bold; background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="academy-details">
              <img src="${settings.logo}" alt="Academy Logo" />
              <h1>${settings.name}</h1>
              <p>${settings.address}</p>
              <p>Phone: ${settings.phone}</p>
            </div>
            <div class="report-title">
              <h2>Exam Results</h2>
              <p>${exam.name} - ${exam.className}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Roll #</th>
                  <th>Student Name</th>
                  ${tableHeader}
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
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          </CardContent>
        </Card>
      </div>
    );
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
                  <TableHead>Roll #</TableHead>
                  <TableHead>Student Name</TableHead>
                  {examSubjects.map(subject => (
                    <TableHead key={subject} className="text-center">{subject}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    {examSubjects.map(subject => (
                      <TableCell key={subject}>
                        <Input
                          type="number"
                          placeholder="Marks"
                          className="max-w-[100px] mx-auto text-center"
                          value={results[student.id]?.marks[subject] ?? ''}
                          onChange={e => handleMarksChange(student.id, subject, e.target.value)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
