
'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Teacher } from '@/lib/data';
import { getTeacherAttendanceForMonth } from '@/lib/firebase/firestore';
import { format } from 'date-fns';
import { Loader2, Printer } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { useAppContext } from '@/hooks/use-app-context';

type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
type AttendanceRecord = {
    date: Date;
    status: AttendanceStatus;
};

const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(0, i), 'MMMM') }));
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export function TeacherAttendanceReport() {
    const { teachers, loading: appLoading } = useAppContext();
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

    const { toast } = useToast();
    const { settings, isSettingsLoading } = useSettings();

    const fetchReport = async (teacherId: string, month: number, year: number) => {
        setIsLoadingReport(true);
        const data = await getTeacherAttendanceForMonth(teacherId, month, year);
        setAttendanceData(data);
        setIsLoadingReport(false);
    }

    useEffect(() => {
        if (selectedTeacher) {
            fetchReport(selectedTeacher.id, selectedMonth, selectedYear);
        }
    }, [selectedTeacher, selectedMonth, selectedYear]);
    
    const summary = useMemo(() => {
        return attendanceData.reduce((acc, record) => {
            acc[record.status] = (acc[record.status] || 0) + 1;
            return acc;
        }, {} as { [key in AttendanceStatus]?: number });
    }, [attendanceData]);

    const handlePrint = () => {
        if (isSettingsLoading || !selectedTeacher) {
            toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please select a teacher first.' });
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please allow popups for this site.' });
            return;
        }
        
        const calendarHtml = document.querySelector('.rdp')?.outerHTML || 'Calendar not available';

        const printHtml = `
          <html>
            <head>
              <title>Attendance Report - ${selectedTeacher.name}</title>
              <style>
                @media print {
                  @page { size: A4 portrait; margin: 0.75in; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fff; color: #000; font-size: 10pt; }
                .report-container { max-width: 1000px; margin: auto; padding: 20px; }
                .academy-details { text-align: center; margin-bottom: 2rem; }
                .academy-details img { height: 60px; margin-bottom: 0.5rem; object-fit: contain; }
                .academy-details h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
                .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
                .report-title { text-align: center; margin: 2rem 0; }
                .report-title h2 { font-size: 1.8rem; font-weight: bold; margin: 0 0 0.5rem 0; }
                .report-title p { font-size: 1.1rem; color: #555; margin: 0; }
                
                .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
                
                /* Calendar Styles */
                .rdp { font-family: sans-serif; --rdp-cell-size: 40px; --rdp-accent-color: #007bff; --rdp-background-color: #f0f0f0; }
                .rdp-day_selected { background-color: #007bff !important; color: white !important; }
                .rdp-day_today:not(.rdp-day_selected) { border: 1px solid #007bff; }
                .bg-green-100 { background-color: #d1fae5; } .text-green-800 { color: #065f46; }
                .bg-red-100 { background-color: #fee2e2; } .text-red-800 { color: #991b1b; }
                .bg-yellow-100 { background-color: #fef9c3; } .text-yellow-700 { color: #854d0e; }
                .rdp-table { margin: 0 auto; }
                .rdp-head_cell { font-weight: bold; }

                /* Summary Styles */
                .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; text-align: center; }
                .summary-card { padding: 1rem; border-radius: 8px; }
                .summary-card .label { font-size: 0.9rem; }
                .summary-card .count { font-size: 2rem; font-weight: bold; }
                
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
                  <h2>Teacher Attendance Report</h2>
                   <p>${selectedTeacher.name}</p>
                  <p style="font-size: 1rem;">${months.find(m => m.value === selectedMonth)?.label}, ${selectedYear}</p>
                </div>

                <div class="grid-container">
                    <div>${calendarHtml}</div>
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold">Attendance Summary</h3>
                        <div class="summary-grid">
                            <div class="summary-card bg-green-100">
                                <p class="label text-green-800">Present</p>
                                <p class="count text-green-700">${summary.Present || 0}</p>
                            </div>
                            <div class="summary-card bg-red-100">
                                <p class="label text-red-800">Absent</p>
                                <p class="count text-red-700">${summary.Absent || 0}</p>
                            </div>
                            <div class="summary-card bg-yellow-100">
                                <p class="label text-yellow-800">Leave</p>
                                <p class="count text-yellow-700">${summary.Leave || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </body>
          </html>
        `;

        printWindow.document.write(printHtml);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-grow max-w-sm space-y-2">
                    <Label>Select Teacher</Label>
                    <Select onValueChange={(v) => setSelectedTeacher(teachers.find(t => t.id === v) || null)} disabled={appLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a teacher" />
                        </SelectTrigger>
                        <SelectContent>
                            {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    <div className="space-y-2">
                        <Label>Month</Label>
                        <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))} disabled={!selectedTeacher}>
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
                        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))} disabled={!selectedTeacher}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handlePrint} variant="outline" disabled={!selectedTeacher || isSettingsLoading}>
                    <Printer className="mr-2"/>
                    Print
                </Button>
            </div>

            {(isLoadingReport || appLoading) && <Skeleton className="h-80 w-full" />}
            
            {!isLoadingReport && selectedTeacher && (
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
                            Attendance Summary for {selectedTeacher.name}
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
