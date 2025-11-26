
'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/lib/data';
import { getAttendanceForClassInMonth } from '@/lib/firebase/firestore';
import { format, getDaysInMonth } from 'date-fns';
import { Loader2, Printer, FileText } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/hooks/use-app-context';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSettings } from '@/hooks/use-settings';

type AttendanceStatus = 'P' | 'A' | 'L';
type MonthlyAttendance = {
    [studentId: string]: {
        [day: number]: AttendanceStatus;
    }
};

const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(0, i), 'MMMM') }));
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export function ClassAttendanceReport() {
    const { classes, students, loading: appLoading } = useAppContext();
    const { settings, isSettingsLoading } = useSettings();
    const { toast } = useToast();

    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    const [monthlyData, setMonthlyData] = useState<MonthlyAttendance>({});

    const classStudents = useMemo(() => {
        if (!selectedClassId) return [];
        const className = classes.find(c => c.id === selectedClassId)?.name;
        return students.filter(s => s.class === className).sort((a, b) => a.id.localeCompare(b.id));
    }, [selectedClassId, students, classes]);

    const handleFetchReport = async () => {
        if (!selectedClassId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a class.' });
            return;
        }
        setIsLoading(true);
        const data = await getAttendanceForClassInMonth(selectedClassId, selectedMonth, selectedYear);
        setMonthlyData(data);
        setIsLoading(false);
    };
    
    const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
    const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getStatusStyle = (status?: AttendanceStatus) => {
        switch (status) {
            case 'P': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'A': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'L': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200';
            default: return 'bg-gray-100 dark:bg-gray-800';
        }
    };

    const studentSummaries = useMemo(() => {
        return classStudents.map(student => {
            const summary = { P: 0, A: 0, L: 0 };
            const studentData = monthlyData[student.id] || {};
            for (const day in studentData) {
                const status = studentData[day];
                if (status in summary) {
                    summary[status]++;
                }
            }
            return { studentId: student.id, summary };
        });
    }, [monthlyData, classStudents]);

    const handlePrint = () => {
        if (isSettingsLoading || !selectedClassId || Object.keys(monthlyData).length === 0) {
            toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please generate a report first.' });
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const className = classes.find(c => c.id === selectedClassId)?.name || '';

        const thDays = dayHeaders.map(day => `<th>${day}</th>`).join('');
        const tbodyRows = classStudents.map(student => {
            const studentData = monthlyData[student.id] || {};
            const summary = studentSummaries.find(s => s.studentId === student.id)?.summary || { P: 0, A: 0, L: 0 };
            const daysCells = dayHeaders.map(day => {
                const status = studentData[day];
                const statusClass = status === 'P' ? 'p' : status === 'A' ? 'a' : status === 'L' ? 'l' : 'na';
                return `<td class="${statusClass}">${status || '-'}</td>`;
            }).join('');
            return `
                <tr>
                    <td>${student.name}</td>
                    ${daysCells}
                    <td class="p">${summary.P}</td>
                    <td class="a">${summary.A}</td>
                    <td class="l">${summary.L}</td>
                </tr>
            `;
        }).join('');

        const printHtml = `
            <html>
                <head>
                    <title>Class Attendance Report - ${className}</title>
                     <style>
                        @media print {
                            @page { size: A4 landscape; margin: 0.5in; }
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 8pt; }
                        }
                        body { font-family: 'Segoe UI', sans-serif; }
                        .report-container { max-width: 1100px; margin: auto; }
                        .academy-details { text-align: center; margin-bottom: 1rem; }
                        .academy-details h1 { font-size: 1.5rem; }
                        .report-title { text-align: center; margin-bottom: 1rem; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ccc; padding: 4px; text-align: center; }
                        th { background-color: #f2f2f2; }
                        td.p { background-color: #d1fae5; color: #065f46; }
                        td.a { background-color: #fee2e2; color: #991b1b; }
                        td.l { background-color: #fef9c3; color: #854d0e; }
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
                            <h2>Class Attendance Report</h2>
                            <p>${className} - ${months.find(m => m.value === selectedMonth)?.label}, ${selectedYear}</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="min-width: 120px;">Student Name</th>
                                    ${thDays}
                                    <th style="background-color: #d1fae5;">P</th>
                                    <th style="background-color: #fee2e2;">A</th>
                                    <th style="background-color: #fef9c3;">L</th>
                                </tr>
                            </thead>
                            <tbody>${tbodyRows}</tbody>
                        </table>
                    </div>
                </body>
            </html>
        `;
        printWindow.document.write(printHtml);
        printWindow.document.close();
    }
    
    const handlePrintBlank = () => {
        if (isSettingsLoading || !selectedClassId) {
            toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please select a class.' });
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const className = classes.find(c => c.id === selectedClassId)?.name || '';

        const thDays = dayHeaders.map(day => `<th>${day}</th>`).join('');
        const tbodyRows = classStudents.map(student => {
            const daysCells = dayHeaders.map(() => `<td style="height: 25px;"></td>`).join('');
            return `
                <tr>
                    <td style="text-align: left;">${student.id}</td>
                    <td style="text-align: left;">${student.name}</td>
                    ${daysCells}
                </tr>
            `;
        }).join('');

        const printHtml = `
            <html>
                <head>
                    <title>Attendance Sheet - ${className}</title>
                     <style>
                        @media print {
                            @page { size: A4 landscape; margin: 0.5in; }
                            body { font-size: 8pt; }
                        }
                        body { font-family: 'Segoe UI', sans-serif; }
                        .report-container { max-width: 1100px; margin: auto; }
                        .academy-details { text-align: center; margin-bottom: 1rem; }
                        .academy-details h1 { font-size: 1.5rem; margin: 0; }
                        .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
                        .report-title { text-align: center; margin-bottom: 1rem; }
                        .report-title h2 { font-size: 1.8rem; margin-bottom: 0.5rem; }
                        .report-title p { font-size: 1.2rem; margin: 0; color: #333; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #333; padding: 4px; text-align: center; }
                        th { background-color: #f2f2f2; }
                     </style>
                </head>
                <body>
                    <div class="report-container">
                        <div class="academy-details">
                            ${settings.logo ? `<img src="${settings.logo}" alt="Logo" style="height: 50px; margin: auto;">` : ''}
                            <h1>${settings.name}</h1>
                            <p>${settings.address}</p>
                            <p>${settings.phone}</p>
                        </div>
                        <div class="report-title">
                            <h2>Attendance Sheet</h2>
                            <p>${className} - ${months.find(m => m.value === selectedMonth)?.label}, ${selectedYear}</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="min-width: 60px; text-align: left;">Roll #</th>
                                    <th style="min-width: 120px; text-align: left;">Student Name</th>
                                    ${thDays}
                                </tr>
                            </thead>
                            <tbody>${tbodyRows}</tbody>
                        </table>
                    </div>
                </body>
            </html>
        `;
        printWindow.document.write(printHtml);
        printWindow.document.close();
    }


    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                    <Label>Class</Label>
                    <Select onValueChange={(v) => setSelectedClassId(v)} disabled={appLoading}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Month</Label>
                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))} disabled={!selectedClassId}>
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
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))} disabled={!selectedClassId}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleFetchReport} disabled={isLoading || !selectedClassId}>
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                    Generate Report
                </Button>
                <Button onClick={handlePrintBlank} variant="secondary" disabled={!selectedClassId || isSettingsLoading}>
                    <FileText className="mr-2" />
                    Print Blank Sheet
                </Button>
                 <Button onClick={handlePrint} variant="outline" disabled={isLoading || Object.keys(monthlyData).length === 0 || isSettingsLoading}>
                    <Printer className="mr-2" />
                    Print Report
                </Button>
            </div>
            
            {isLoading && <Skeleton className="h-96 w-full" />}
            
            {!isLoading && Object.keys(monthlyData).length > 0 && (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">Student Name</TableHead>
                                {dayHeaders.map(day => <TableHead key={day} className="text-center">{day}</TableHead>)}
                                <TableHead className="text-center text-green-700 font-bold sticky right-[96px] bg-background z-10">P</TableHead>
                                <TableHead className="text-center text-red-700 font-bold sticky right-[48px] bg-background z-10">A</TableHead>
                                <TableHead className="text-center text-yellow-700 font-bold sticky right-0 bg-background z-10">L</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {classStudents.map(student => {
                                const summary = studentSummaries.find(s => s.studentId === student.id)?.summary || { P: 0, A: 0, L: 0 };
                                return (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium sticky left-0 bg-background z-10">{student.name}</TableCell>
                                        {dayHeaders.map(day => (
                                            <TableCell key={day} className={`text-center font-bold text-xs p-2 ${getStatusStyle(monthlyData[student.id]?.[day])}`}>
                                                {monthlyData[student.id]?.[day] || '-'}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-center font-bold text-green-700 sticky right-[96px] bg-background z-10">{summary.P}</TableCell>
                                        <TableCell className="text-center font-bold text-red-700 sticky right-[48px] bg-background z-10">{summary.A}</TableCell>
                                        <TableCell className="text-center font-bold text-yellow-700 sticky right-0 bg-background z-10">{summary.L}</TableCell>
                                    </TableRow>
                                )
                           })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

    