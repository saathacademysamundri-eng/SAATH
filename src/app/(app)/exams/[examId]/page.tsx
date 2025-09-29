
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { type Exam, type Student, type StudentResult } from '@/lib/data';
import { getExam, getStudentsByClass, saveExamResults } from '@/lib/firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

export default function ExamResultsPage() {
  const params = useParams();
  const examId = params.examId as string;
  const { toast } = useToast();

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
    // For 'Full Test', we need to get all subjects of that class
    // This assumes all students in the class have a list of subjects they are taking.
    // We can aggregate this from the first student for simplicity.
    if (students.length > 0) {
        return students[0].subjects.map(s => s.subject_name);
    }
    return [];
  }, [exam, students]);

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
            <Button onClick={handleSaveResults} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 animate-spin" />}
              Save Results
            </Button>
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
