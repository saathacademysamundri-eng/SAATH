
'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/hooks/use-app-context';
import { useSettings } from '@/hooks/use-settings';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { getDetailedDailyAttendance } from '@/lib/firebase/firestore';
import type { DailyAttendanceSummary } from '@/lib/data';

export function DailyAttendanceSummaryDialog() {
    const { settings, isSettingsLoading } = useSettings();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<DailyAttendanceSummary | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const data = await getDetailedDailyAttendance();
            setSummaryData(data);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    const handlePrint = () => {
        if (isSettingsLoading || !summaryData) {
            toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please wait for the report to generate.' });
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please allow popups for this site.' });
            return;
        }

        const reportHtml = `
            <html>
                <head>
                    <title>Daily Attendance Summary - ${format(new Date(), 'PPP')}</title>
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; margin: 20px; }
                        .report-container { max-width: 800px; margin: auto; }
                        .academy-details { text-align: center; margin-bottom: 1.5rem; }
                        .academy-details img { max-height: 60px; margin-bottom: 0.5rem; }
                        h1 { font-size: 1.5rem; }
                        .report-title { text-align: center; margin-bottom: 2rem; }
                        h2 { font-size: 1.8rem; margin-bottom: 0; }
                        .section-title { font-size: 1.5rem; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 5px; margin-top: 2rem; margin-bottom: 1rem; }
                        .class-summary { margin-bottom: 1.5rem; border: 1px solid #ccc; border-radius: 8px; overflow: hidden; }
                        .class-header { background-color: #f2f2f2; padding: 10px; font-weight: bold; font-size: 1.2rem; }
                        .class-stats { display: flex; justify-content: space-around; padding: 10px; background-color: #f9f9f9; }
                        .class-stats div { text-align: center; }
                        .class-stats .label { font-size: 0.9rem; color: #555; }
                        .class-stats .value { font-size: 1.5rem; font-weight: bold; }
                        .absent-list { padding: 10px; }
                        .absent-list p { font-weight: bold; }
                        .absent-list ul { list-style: none; padding-left: 0; column-count: 2; }
                        .teacher-section ul { list-style: none; padding-left: 0; }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        <div class="academy-details">
                            ${settings.logo ? `<img src="${settings.logo}" alt="Logo">` : ''}
                            <h1>${settings.name}</h1>
                        </div>
                        <div class="report-title">
                            <h2>Daily Attendance Summary</h2>
                            <p>${format(new Date(), 'EEEE, PPP')}</p>
                        </div>
                        
                        <div class="section-title">Student Attendance</div>
                        ${summaryData.students.classSummaries.map(cls => `
                            <div class="class-summary">
                                <div class="class-header">${cls.className}</div>
                                <div class="class-stats">
                                    <div><p class="label">Total Students</p><p class="value">${cls.totalStudents}</p></div>
                                    <div><p class="label">Present</p><p class="value" style="color: green;">${cls.presentCount}</p></div>
                                    <div><p class="label">Absent</p><p class="value" style="color: red;">${cls.absentCount}</p></div>
                                </div>
                                ${cls.absentCount > 0 ? `
                                    <div class="absent-list">
                                        <p>Absent Students:</p>
                                        <ul>
                                            ${cls.absentStudents.map(s => `<li>${s.name} (${s.id})</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}

                        <div class="section-title">Teacher Attendance</div>
                        <div class="class-summary">
                            <div class="class-stats">
                                <div><p class="label">Total Teachers</p><p class="value">${summaryData.teachers.totalTeachers}</p></div>
                                <div><p class="label">Present</p><p class="value" style="color: green;">${summaryData.teachers.presentCount}</p></div>
                                <div><p class="label">Absent / Leave</p><p class="value" style="color: red;">${summaryData.teachers.absentCount}</p></div>
                            </div>
                            ${summaryData.teachers.absentCount > 0 ? `
                                <div class="absent-list">
                                    <p>Absent / On-Leave Teachers:</p>
                                    <ul>
                                        ${summaryData.teachers.absentTeachers.map(t => `<li>${t.name}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(reportHtml);
        printWindow.document.close();
    };


    return (
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>Daily Attendance Summary</DialogTitle>
                <DialogDescription>
                    A summary of today's student and teacher attendance.
                </DialogDescription>
            </DialogHeader>
            
            {isLoading ? (
                <div className="py-10"><Skeleton className="h-96 w-full" /></div>
            ) : summaryData ? (
                 <div className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto pr-4">
                    <h3 className="text-xl font-bold">Student Attendance</h3>
                    {summaryData.students.classSummaries.map(cls => (
                        <div key={cls.classId} className="border rounded-lg">
                            <div className="bg-muted px-4 py-2 font-bold">{cls.className}</div>
                            <div className="grid grid-cols-3 gap-4 p-4 text-center">
                                <div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{cls.totalStudents}</p></div>
                                <div><p className="text-sm text-muted-foreground">Present</p><p className="text-2xl font-bold text-green-600">{cls.presentCount}</p></div>
                                <div><p className="text-sm text-muted-foreground">Absent</p><p className="text-2xl font-bold text-red-600">{cls.absentCount}</p></div>
                            </div>
                            {cls.absentCount > 0 && (
                                <div className="border-t px-4 py-2">
                                    <p className="font-semibold">Absent Students:</p>
                                    <ul className="list-disc list-inside columns-2">
                                        {cls.absentStudents.map(s => <li key={s.id}>{s.name} ({s.id})</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    <h3 className="text-xl font-bold pt-4 border-t">Teacher Attendance</h3>
                     <div className="border rounded-lg">
                        <div className="grid grid-cols-3 gap-4 p-4 text-center">
                            <div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{summaryData.teachers.totalTeachers}</p></div>
                            <div><p className="text-sm text-muted-foreground">Present</p><p className="text-2xl font-bold text-green-600">{summaryData.teachers.presentCount}</p></div>
                            <div><p className="text-sm text-muted-foreground">Absent / Leave</p><p className="text-2xl font-bold text-red-600">{summaryData.teachers.absentCount}</p></div>
                        </div>
                        {summaryData.teachers.absentCount > 0 && (
                            <div className="border-t px-4 py-2">
                                <p className="font-semibold">Absent / On-Leave Teachers:</p>
                                <ul className="list-disc list-inside">
                                    {summaryData.teachers.absentTeachers.map(t => <li key={t.id}>{t.name}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                <p className="text-center py-10 text-muted-foreground">No attendance data found for today.</p>
            )}

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">Close</Button>
                </DialogClose>
                 <Button onClick={handlePrint} variant="default" disabled={isLoading || !summaryData || isSettingsLoading}>
                    <Printer className="mr-2" />
                    Print Report
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

