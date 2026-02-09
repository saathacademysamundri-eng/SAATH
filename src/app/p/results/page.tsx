'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudent, getExamsForStudent } from '@/lib/firebase/firestore';
import { Student, Exam } from '@/lib/data';
import { Search, Loader2, Award, BookOpen, AlertCircle, GraduationCap, Printer, Medal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function PublicResultsSearchPage() {
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
      const searchTerm = rollNo.trim().toUpperCase();
      let searchId = searchTerm;
      
      if (/^\d+$/.test(searchTerm)) {
        searchId = `S${searchTerm.padStart(3, '0')}`;
      }

      let studentData = await getStudent(searchId);
      if (!studentData && searchId !== searchTerm) {
        studentData = await getStudent(searchTerm);
      }

      if (studentData) {
        setStudent(studentData);
        const examsData = await getExamsForStudent(studentData.id);
        setExams(examsData);
      } else {
        setError('No student record found. Please verify your Roll Number.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('A connection error occurred. Please try again in a moment.');
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
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-blue-50 text-[#1e40af] mb-6 shadow-sm border border-blue-100">
          <GraduationCap className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Academic Performance</h1>
        <p className="text-lg text-slate-600 max-w-md mx-auto">Access your official results and progress reports instantly.</p>
      </header>

      <Card className="mb-12 shadow-xl border-slate-200/60 bg-white overflow-hidden rounded-[2rem]">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Enter Roll Number (e.g. S001)" 
                value={rollNo} 
                onChange={(e) => setRollNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-lg h-16 pl-12 border-2 border-slate-100 focus:border-[#1e40af] focus:ring-[#1e40af]/10 rounded-2xl bg-slate-50/50 font-semibold text-slate-900"
              />
            </div>
            <button 
              onClick={handleSearch} 
              disabled={loading} 
              className="h-16 px-10 text-lg font-bold rounded-2xl bg-[#1e40af] text-white hover:bg-[#1e3a8a] shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <Search className="mr-3 h-6 w-6" />}
              View Results
            </button>
          </div>
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {student && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <Card className="overflow-hidden border-0 shadow-2xl rounded-[2.5rem]">
            <div className="bg-gradient-to-r from-[#1e40af] to-[#059669] p-10 md:p-12 text-white relative">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Award size={180} />
              </div>
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="h-32 w-32 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-6xl font-black border-4 border-white/30 shadow-inner">
                  {student.name.charAt(0)}
                </div>
                <div className="text-center md:text-left space-y-4">
                  <h2 className="text-5xl font-black tracking-tight">{student.name}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-base px-6 py-2 rounded-full backdrop-blur-md font-bold">
                      Roll #: {student.id}
                    </Badge>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-base px-6 py-2 rounded-full backdrop-blur-md font-bold">
                      Class: {student.class}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-10">
            {exams.length > 0 ? exams.map(exam => {
              const stats = calculateResultStats(exam, student.id);
              const result = exam.results?.find(r => r.studentId === student.id);
              return (
                <Card key={exam.id} className="overflow-hidden border-slate-200 shadow-xl rounded-[2rem] hover:border-[#1e40af]/30 transition-all group bg-white">
                  <div className="bg-slate-50/80 px-8 py-6 border-b flex flex-wrap justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 text-[#1e40af] flex items-center justify-center font-black">
                        <Medal size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-2xl text-slate-900 tracking-tight">{exam.name}</h3>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{format(exam.date, 'MMMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Percentage</p>
                        <p className="text-3xl font-black text-[#059669] leading-none">{stats?.percentage.toFixed(1)}%</p>
                      </div>
                      <div className="h-12 w-px bg-slate-200" />
                      <Button variant="ghost" size="icon" onClick={() => window.print()} className="rounded-full text-slate-400 hover:bg-[#1e40af] hover:text-white transition-all h-12 w-12">
                        <Printer className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-b-2">
                            <TableHead className="py-5 pl-10 text-slate-600 font-black uppercase tracking-widest text-[11px]">Academic Subject</TableHead>
                            <TableHead className="text-center text-slate-600 font-black uppercase tracking-widest text-[11px]">Obtained</TableHead>
                            <TableHead className="text-center text-slate-600 font-black uppercase tracking-widest text-[11px]">Maximum</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exam.subjects.map(sub => {
                            const mark = result?.marks[sub];
                            return (
                              <TableRow key={sub} className="hover:bg-slate-50/20 transition-colors border-slate-100">
                                <TableCell className="font-black py-6 pl-10 text-slate-800 text-lg">{sub}</TableCell>
                                <TableCell className="text-center">
                                  {mark === 'A' ? (
                                    <Badge className="bg-red-50 text-red-600 border-red-100 font-black rounded-lg px-4 py-1">ABSENT</Badge>
                                  ) : (
                                    <span className="font-mono text-2xl font-black text-slate-900">{mark ?? '-'}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center text-slate-400 font-bold text-lg">{exam.totalMarks}</TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-[#0f172a] text-white font-bold h-24">
                            <TableCell className="pl-10">
                              <div className="flex items-center gap-3">
                                <Award className="h-6 w-6 text-amber-400" />
                                <span className="text-slate-400 font-black uppercase tracking-widest text-sm">Aggregate</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-4xl font-black text-white">{stats?.obtained}</TableCell>
                            <TableCell className="text-center text-xl text-slate-500 font-black">/ {stats?.total}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <Card className="border-dashed border-4 border-slate-100 bg-slate-50/30 rounded-[2.5rem] py-24 text-center">
                <CardContent className="space-y-6">
                  <div className="mx-auto w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-inner">
                    <BookOpen className="h-12 w-12 text-slate-200" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Records Found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
