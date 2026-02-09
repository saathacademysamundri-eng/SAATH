'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudent, getExamsForStudent } from '@/lib/firebase/firestore';
import { Student, Exam } from '@/lib/data';
import { Search, Loader2, Award, GraduationCap, Printer, Medal, AlertCircle } from 'lucide-react';
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
      } else if (!searchTerm.startsWith('S')) {
        searchId = `S${searchTerm.replace(/\D/g, '').padStart(3, '0')}`;
      }

      const studentData = await getStudent(searchId);

      if (studentData) {
        setStudent(studentData);
        const examsData = await getExamsForStudent(studentData.id);
        setExams(examsData);
      } else {
        setError('Record not found. Please verify your Roll Number.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Connection failed. Please try again.');
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

    const total = (exam.totalMarks || 0) * exam.subjects.length;
    const percentage = total > 0 ? (obtained / total) * 100 : 0;

    return { obtained, total, percentage };
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
      <header className="mb-8 sm:mb-12 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-blue-50 text-[#1e40af] mb-4 shadow-sm border border-blue-100">
          <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Academic Results</h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto font-medium">Official grades and performance reports.</p>
      </header>

      <Card className="mb-8 shadow-xl border-slate-200/60 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-white">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Enter Roll Number (e.g. S001)" 
                value={rollNo} 
                onChange={(e) => setRollNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-lg sm:text-xl h-14 sm:h-16 pl-12 border-2 border-slate-100 focus:border-[#1e40af] focus:ring-[#1e40af]/10 rounded-xl sm:rounded-2xl bg-slate-50/50 font-black text-slate-950 placeholder:text-slate-400"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading} 
              className="h-14 sm:h-16 px-8 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-[#1e40af] text-white hover:bg-[#1e3a8a] shadow-lg transition-all"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
              View Results
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {student && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="overflow-hidden border-0 shadow-2xl rounded-[2.5rem]">
            <div className="bg-gradient-to-br from-[#1e40af] to-[#059669] p-8 sm:p-12 text-white relative">
              <div className="absolute top-0 right-0 p-10 opacity-10 hidden xs:block"><Award size={140} /></div>
              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 relative z-10 text-center md:text-left">
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-4xl sm:text-6xl font-black border-4 border-white/30 shadow-inner shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-none">{student.name}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4">
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-xs sm:text-base px-6 py-2 rounded-full font-bold">
                      ID: {student.id}
                    </Badge>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-xs sm:text-base px-6 py-2 rounded-full font-bold uppercase">
                      {student.class}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 sm:gap-10">
            {exams.length > 0 ? exams.map(exam => {
              const stats = calculateResultStats(exam, student.id);
              const result = exam.results?.find(r => r.studentId === student.id);
              return (
                <Card key={exam.id} className="overflow-hidden border-slate-200 shadow-xl rounded-[2rem] bg-white group">
                  <div className="bg-slate-50/80 px-6 sm:px-10 py-6 border-b flex flex-wrap justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-left">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 text-[#1e40af] flex items-center justify-center font-black shrink-0"><Medal size={24} /></div>
                      <div>
                        <h3 className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight uppercase">{exam.name}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{format(exam.date, 'MMMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Percentage</p>
                        <p className="text-2xl sm:text-3xl font-black text-[#059669] leading-none">{stats?.percentage.toFixed(1)}%</p>
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
                            <TableHead className="py-5 pl-6 sm:pl-10 text-slate-600 font-black uppercase tracking-widest text-[11px]">Subject</TableHead>
                            <TableHead className="text-center text-slate-600 font-black uppercase tracking-widest text-[11px]">Obtained</TableHead>
                            <TableHead className="text-center text-slate-600 font-black uppercase tracking-widest text-[11px]">Maximum</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exam.subjects.map(sub => {
                            const mark = result?.marks[sub];
                            return (
                              <TableRow key={sub} className="hover:bg-slate-50/20 border-slate-100">
                                <TableCell className="font-black py-6 pl-6 sm:pl-10 text-slate-800 text-base sm:text-lg uppercase">{sub}</TableCell>
                                <TableCell className="text-center">
                                  {mark === 'A' ? (
                                    <Badge className="bg-red-50 text-red-600 border-red-100 font-black rounded-lg px-4 py-1 text-xs">ABSENT</Badge>
                                  ) : (
                                    <span className="font-mono text-2xl font-black text-slate-900">{mark ?? '-'}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center text-slate-400 font-bold text-base sm:text-lg">{exam.totalMarks}</TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-[#0f172a] text-white font-bold h-24">
                            <TableCell className="pl-6 sm:pl-10">
                              <div className="flex items-center gap-3">
                                <Award className="h-6 w-6 text-amber-400" />
                                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] sm:text-sm">Aggregate</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-3xl sm:text-4xl font-black text-white">{stats?.obtained}</TableCell>
                            <TableCell className="text-center text-lg sm:text-xl text-slate-500 font-black">/ {stats?.total}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <Card className="border-dashed border-4 border-slate-100 bg-slate-50/30 rounded-[2.5rem] py-24 text-center">
                <CardContent>
                  <p className="text-2xl font-black text-slate-300 uppercase tracking-tight">No Records Available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
