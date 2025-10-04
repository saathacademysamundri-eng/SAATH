
'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/lib/data';
import { getAttendanceForMonth, getStudent } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { addMonths, format } from 'date-fns';
import { Loader2, Search } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
type AttendanceRecord = {
    date: Date;
    status: AttendanceStatus;
};

const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(0, i), 'MMMM') }));
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export function AttendanceReport() {
    const [search, setSearch] = useState('');
    const [student, setStudent] = useState<Student | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

    const { toast } = useToast();

    const handleSearch = async () => {
        if (!search.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a roll number.' });
            return;
        }
        setIsSearching(true);
        const studentData = await getStudent(search);
        if (studentData) {
            setStudent(studentData);
            fetchReport(studentData.id, selectedMonth, selectedYear);
        } else {
            toast({ variant: 'destructive', title: 'Not Found', description: 'Student not found.' });
            setStudent(null);
            setAttendanceData([]);
        }
        setIsSearching(false);
    };
    
    const fetchReport = async (studentId: string, month: number, year: number) => {
        setIsLoadingReport(true);
        const data = await getAttendanceForMonth(studentId, month, year);
        setAttendanceData(data);
        setIsLoadingReport(false);
    }

    useEffect(() => {
        if (student) {
            fetchReport(student.id, selectedMonth, selectedYear);
        }
    }, [student, selectedMonth, selectedYear]);
    
    const summary = useMemo(() => {
        return attendanceData.reduce((acc, record) => {
            acc[record.status] = (acc[record.status] || 0) + 1;
            return acc;
        }, {} as { [key in AttendanceStatus]?: number });
    }, [attendanceData]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-grow max-w-sm space-y-2">
                    <Label htmlFor="roll-number">Student Roll Number</Label>
                    <div className="flex items-center space-x-2">
                        <Input
                            id="roll-number"
                            placeholder="Enter roll number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={isSearching}>
                            {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="space-y-2">
                        <Label>Month</Label>
                        <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))} disabled={!student}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Year</Label>
                        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))} disabled={!student}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {(isSearching || isLoadingReport) && <Skeleton className="h-80 w-full" />}
            
            {!isSearching && !isLoadingReport && student && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <Calendar
                        month={new Date(selectedYear, selectedMonth)}
                        onMonthChange={(date) => {
                            setSelectedMonth(date.getMonth());
                            setSelectedYear(date.getFullYear());
                        }}
                        modifiers={{
                            present: attendanceData.filter(d => d.status === 'Present').map(d => d.date),
                            absent: attendanceData.filter(d => d.status === 'Absent').map(d => d.date),
                            leave: attendanceData.filter(d => d.status === 'Leave').map(d => d.date),
                        }}
                        modifiersClassNames={{
                            present: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md',
                            absent: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md',
                            leave: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 rounded-md',
                        }}
                        className="rounded-md border self-center"
                    />

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            Attendance Summary for {student.name}
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-md">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">Present</p>
                                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{summary.Present || 0}</p>
                            </div>
                            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-md">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">Absent</p>
                                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{summary.Absent || 0}</p>
                            </div>
                            <div className="p-4 bg-yellow-100 dark:bg-yellow-800 rounded-md">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Leave</p>
                                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{summary.Leave || 0}</p>
                            </div>
                        </div>
                         <div className="text-sm text-muted-foreground pt-4">
                            Report for {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
