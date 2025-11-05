
'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getTeacherAttendanceForMonth } from '@/lib/firebase/firestore';
import { format, getDaysInMonth } from 'date-fns';
import { Loader2, Printer } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/hooks/use-app-context';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSettings } from '@/hooks/use-settings';

type AttendanceStatus = 'P' | 'A' | 'L';
type MonthlyAttendance = {
    [teacherId: string]: {
        [day: number]: AttendanceStatus;
    }
};

const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(0, i), 'MMMM') }));
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export function TeacherMonthlySheet() {
    const { teachers, loading: appLoading } = useAppContext();
    const { settings, isSettingsLoading } = useSettings();
    const { toast } = useToast();

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    const [monthlyData, setMonthlyData] = useState<MonthlyAttendance>({});

    const handleFetchReport = async () => {
        setIsLoading(true);
        const allTeachersData: MonthlyAttendance = {};
        
        for (const teacher of teachers) {
            const data = await getTeacherAttendanceForMonth(teacher.id, selectedMonth, selectedYear);
            const teacherAttendance: { [day: number]: AttendanceStatus } = {};
            data.forEach(record => {
                const day = record.date.getUTCDate();
                teacherAttendance[day] = record.status.charAt(0) as AttendanceStatus;
            });
            allTeachersData[teacher.id] = teacherAttendance;
        }
        
        setMonthlyData(allTeachersData);
        setIsLoading(false);
    };
    
    useEffect(() => {
        // Automatically fetch report when component loads for the first time
        if (teachers.length > 0) {
            handleFetchReport();
        }
    }, [teachers, selectedMonth, selectedYear]);

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

    const teacherSummaries = useMemo(() => {
        return teachers.map(teacher => {
            const summary = { P: 0, A: 0, L: 0 };
            const teacherData = monthlyData[teacher.id] || {};
            for (const day in teacherData) {
                const status = teacherData[day];
                if (status in summary) {
                    summary[status]++;
                }
            }
            return { teacherId: teacher.id, summary };
        });
    }, [monthlyData, teachers]);

    const handlePrint = () => {
        if (isSettingsLoading || Object.keys(monthlyData).length === 0) {
            toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please generate a report first.' });
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const thDays = dayHeaders.map(day => `<th>${day}</th>`).join('');
        const tbodyRows = teachers.map(teacher => {
            const teacherData = monthlyData[teacher.id] || {};
            const summary = teacherSummaries.find(s => s.teacherId === teacher.id)?.summary || { P: 0, A: 0, L: 0 };
            const daysCells = dayHeaders.map(day => {
                const status = teacherData[day];
                const statusClass = status === 'P' ? 'p' : status === 'A' ? 'a' : status === 'L' ? 'l' : 'na';
                return `<td class="${statusClass}">${status || '-'}</td>`;
            }).join('');
            return `
                <tr>
                    <td>${teacher.name}</td>
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
                    <title>Teacher Monthly Attendance Report</title>
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
                        </div>
                        <div class="report-title">
                            <h2>Teacher Monthly Attendance Report</h2>
                            <p>${months.find(m => m.value === selectedMonth)?.label}, ${selectedYear}</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="min-width: 120px;">Teacher Name</th>
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


    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                    <Label>Month</Label>
                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
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
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleFetchReport} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                    Generate Report
                </Button>
                 <Button onClick={handlePrint} variant="outline" disabled={isLoading || Object.keys(monthlyData).length === 0 || isSettingsLoading}>
                    <Printer className="mr-2" />
                    Print Report
                </Button>
            </div>
            
            {(isLoading || appLoading) && <Skeleton className="h-96 w-full" />}
            
            {!isLoading && Object.keys(monthlyData).length > 0 && (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">Teacher Name</TableHead>
                                {dayHeaders.map(day => <TableHead key={day} className="text-center">{day}</TableHead>)}
                                <TableHead className="text-center text-green-700 font-bold sticky right-[96px] bg-background z-10">P</TableHead>
                                <TableHead className="text-center text-red-700 font-bold sticky right-[48px] bg-background z-10">A</TableHead>
                                <TableHead className="text-center text-yellow-700 font-bold sticky right-0 bg-background z-10">L</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {teachers.map(teacher => {
                                const summary = teacherSummaries.find(s => s.teacherId === teacher.id)?.summary || { P: 0, A: 0, L: 0 };
                                return (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-medium sticky left-0 bg-background z-10">{teacher.name}</TableCell>
                                        {dayHeaders.map(day => (
                                            <TableCell key={day} className={`text-center font-bold text-xs p-2 ${getStatusStyle(monthlyData[teacher.id]?.[day])}`}>
                                                {monthlyData[teacher.id]?.[day] || '-'}
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
