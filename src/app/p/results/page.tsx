
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudent, getExamsForStudent } from '@/lib/firebase/firestore';
import { useSettings } from '@/hooks/use-settings';
import { Student, Exam } from '@/lib/data';
import { Search, Loader2, Award, BookOpen, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function PublicResultsSearchPage() {
  const { settings, isSettingsLoading } = useSettings();
  const [rollNo, setRollNo] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!rollNo.trim()) return;
    
    setLoading(true);
    setError(null);
    setStudent(null);
    setExams([]);

    try {
      const studentData = await getStudent(rollNo.trim().toUpperCase());
      if (studentData) {
        setStudent(studentData);
        const examsData = await getExamsForStudent(studentData.id);
        setExams(examsData);
      } else {
        setError('Student not found. Please check the roll number.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateResultStats = (exam: Exam, studentId: string) => {
    const result = exam.results?.find(r => r.studentId === studentId);
    if (!result) return null;

    let obtained = 0;
    exam.subjects.forEach(sub => {
        const mark = result.marks[sub];
        if (typeof mark === 'number') obtained += mark;
    });

    const total = exam.totalMarks * exam.subjects.length;
    const percentage = (obtained / total) * 100;

    return { obtained, total, percentage };
  };

  return (
    <main className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          {settings.logo && <img src={settings.logo} alt="Logo" className="h-16 mx-auto mb-4" />}
          <h1 className="text-3xl font-bold text-primary">{settings.name}</h1>
          <p className="text-muted-foreground">Student Performance Portal</p>
        </header>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>Enter your Roll Number to view your academic results.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g. S001" 
                value={rollNo} 
                onChange={(e) => setRollNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-lg h-12"
              />
              <Button onClick={handleSearch} disabled={loading} size="lg">
                {loading ? <Loader2 className="animate-spin" /> : <Search className="mr-2" />}
                Search
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {student && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-2xl">{student.name}</CardTitle>
                  <CardDescription>Roll #: {student.id} | Class: {student.class}</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-6">
              {exams.length > 0 ? exams.map(exam => {
                const stats = calculateResultStats(exam, student.id);
                const result = exam.results?.find(r => r.studentId === student.id);
                return (
                  <Card key={exam.id} className="overflow-hidden">
                    <div className="bg-primary/5 px-6 py-4 border-b flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{exam.name}</h3>
                        <p className="text-sm text-muted-foreground">{format(exam.date, 'PPP')}</p>
                      </div>
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {stats?.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead className="text-center">Obtained</TableHead>
                            <TableHead className="text-center">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exam.subjects.map(sub => {
                            const mark = result?.marks[sub];
                            return (
                              <TableRow key={sub}>
                                <TableCell className="font-medium">{sub}</TableCell>
                                <TableCell className="text-center">
                                  {mark === 'A' ? <span className="text-destructive font-bold">Absent</span> : (mark ?? '-')}
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">{exam.totalMarks}</TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-muted/30 font-bold">
                            <TableCell>Total Obtained</TableCell>
                            <TableCell className="text-center text-primary">{stats?.obtained}</TableCell>
                            <TableCell className="text-center">{stats?.total}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                );
              }) : (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    No results have been recorded for this student yet.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
