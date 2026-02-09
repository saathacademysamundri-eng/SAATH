'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudent, getExamsForStudent } from '@/lib/firebase/firestore';
import { useSettings } from '@/hooks/use-settings';
import { Student, Exam } from '@/lib/data';
import { Search, Loader2, Award, BookOpen, AlertCircle, TrendingUp, User, GraduationCap, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function PublicResultsSearchPage() {
  const { settings } = useSettings();
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
        setError('No student found with this roll number. Please verify and try again.');
      }
    } catch (err) {
      setError('A system error occurred. Please try again later.');
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
    const percentage = total > 0 ? (obtained / total) * 100 : 0;

    return { obtained, total, percentage };
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-blue-50 text-[#1e40af] mb-4 shadow-sm border border-blue-100">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Academic Results</h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">Enter your credentials below to access your performance report and exam records.</p>
        </header>

        <Card className="mb-12 shadow-xl border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-24 z-40">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Enter Student Roll Number (e.g. S001)" 
                  value={rollNo} 
                  onChange={(e) => setRollNo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-lg h-14 pl-12 border-2 border-slate-100 focus:border-[#1e40af] focus:ring-[#1e40af]/20 rounded-xl bg-white shadow-inner"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading} 
                className="h-14 px-8 text-lg font-bold rounded-xl bg-[#1e40af] hover:bg-[#1e40af]/90 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                Search Results
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {student && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Student ID Card */}
            <Card className="overflow-hidden border-0 shadow-2xl rounded-3xl">
              <div className="bg-gradient-to-r from-[#1e40af] to-[#059669] p-8 md:p-10 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Award size={160} />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="h-28 w-28 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl font-black border-4 border-white/30 shadow-inner">
                    {student.name.charAt(0)}
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-4xl font-black tracking-tight">{student.name}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-sm px-4 py-1 rounded-full backdrop-blur-sm">
                        Roll #: {student.id}
                      </Badge>
                      <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-sm px-4 py-1 rounded-full backdrop-blur-sm">
                        Class: {student.class}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-8">
              {exams.length > 0 ? exams.map(exam => {
                const stats = calculateResultStats(exam, student.id);
                const result = exam.results?.find(r => r.studentId === student.id);
                return (
                  <Card key={exam.id} className="overflow-hidden border-slate-200 shadow-lg rounded-2xl hover:border-[#1e40af]/30 transition-colors">
                    <div className="bg-slate-50/80 px-6 py-5 border-b flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h3 className="font-bold text-xl text-slate-900">{exam.name}</h3>
                        <p className="text-sm text-slate-500 font-medium">{format(exam.date, 'PPP')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Percentage</p>
                          <p className="text-2xl font-black text-[#059669]">{stats?.percentage.toFixed(1)}%</p>
                        </div>
                        <div className="h-10 w-px bg-slate-200" />
                        <Button variant="ghost" size="icon" onClick={() => window.print()} className="rounded-full text-slate-400 hover:text-[#1e40af]">
                          <Printer className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-b">
                            <TableHead className="py-4 pl-6 text-slate-600 font-bold uppercase tracking-wider text-[11px]">Subject</TableHead>
                            <TableHead className="text-center text-slate-600 font-bold uppercase tracking-wider text-[11px]">Marks Obtained</TableHead>
                            <TableHead className="text-center text-slate-600 font-bold uppercase tracking-wider text-[11px]">Total Marks</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exam.subjects.map(sub => {
                            const mark = result?.marks[sub];
                            return (
                              <TableRow key={sub} className="hover:bg-slate-50/20 transition-colors">
                                <TableCell className="font-bold py-4 pl-6 text-slate-800">{sub}</TableCell>
                                <TableCell className="text-center">
                                  {mark === 'A' ? (
                                    <Badge className="bg-red-50 text-red-600 border-red-100 hover:bg-red-50">Absent</Badge>
                                  ) : (
                                    <span className="font-mono text-lg font-bold text-slate-900">{mark ?? '-'}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center text-slate-400 font-medium">{exam.totalMarks}</TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-slate-900 text-white font-bold h-16">
                            <TableCell className="pl-6 text-slate-300">CONSOLIDATED SCORE</TableCell>
                            <TableCell className="text-center text-2xl font-black text-white">{stats?.obtained}</TableCell>
                            <TableCell className="text-center text-slate-400">{stats?.total}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                );
              }) : (
                <Card className="border-dashed border-2 border-slate-200">
                  <CardContent className="py-20 text-center space-y-4">
                    <div className="mx-auto w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-slate-900">No Academic Records Yet</p>
                      <p className="text-slate-500 max-w-xs mx-auto">Once your exams are graded, you'll be able to view your detailed performance report here.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
