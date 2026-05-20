'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { type Exam, type Student } from '@/lib/data';
import { Printer, FileDown } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/hooks/use-app-context';

type AggregatedResult = {
    studentId: string;
    studentName: string;
    fatherName: string;
    marks: { [subjectName: string]: number | string | null };
    totalMarks: number;
    percentage: number;
    position: number;
};

export function MasterSheetView({ exams, groupTitle }: { exams: Exam[], groupTitle: string }) {
  const { toast } = useToast();
  const { settings, isSettingsLoading } = useSettings();
  const { students: allStudents = [] } = useAppContext();

  const [showPosition, setShowPosition] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  
  const { studentsInClass, allSubjects, totalMaxMarks } = useMemo(() => {
    if (!exams || exams.length === 0) {
        return { studentsInClass: [], allSubjects: [], totalMaxMarks: 0 };
    }
    const className = exams[0].className;
    
    // CRITICAL: Always pull the ENTIRE class for the Master Sheet view
    const studentsInClass = allStudents.filter(s => s.class === className);

    const subjectSet = new Set<string>();
    exams.forEach(exam => {
        exam.subjects.forEach(sub => subjectSet.add(sub));
    });
    const allSubjects = Array.from(subjectSet);

    // Calculate total possible marks for this exam group (e.g., Computer + Bio + English)
    const totalMaxMarks = exams.reduce((acc, exam) => acc + (exam.totalMarks * exam.subjects.length), 0);

    return { studentsInClass, allSubjects, totalMaxMarks };
  }, [exams, allStudents]);

  const aggregatedResults = useMemo((): AggregatedResult[] => {
    if (studentsInClass.length === 0 || exams.length === 0 || totalMaxMarks === 0) return [];

    const studentTotals = studentsInClass.map(student => {
      const allMarks: { [subjectName: string]: number | string | null } = {};
      let totalObtainedMarks = 0;
      let totalAttendedMaxMarks = 0;

      exams.forEach(exam => {
        const studentResult = exam.results?.find(r => r.studentId === student.id);
        
        exam.subjects.forEach(subject => {
            const mark = studentResult?.marks[subject];
            allMarks[subject] = mark ?? null;
            
            if (typeof mark === 'number') {
                totalObtainedMarks += mark;
            }
            
            // Track if student was actually eligible/enrolled for this subject in the exam
            // This handles the Bio vs Computer positions better
            if (mark !== undefined && mark !== null) {
                totalAttendedMaxMarks += exam.totalMarks;
            }
        });
      });
      
      // Percentage is calculated against the total potential marks for this group
      const percentage = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        fatherName: student.fatherName,
        marks: allMarks,
        totalMarks: totalObtainedMarks,
        percentage,
      };
    });
    
    // Sort and rank
    const sortedForRanking = [...studentTotals].sort((a, b) => b.totalMarks - a.totalMarks);
    const rankedStudents = new Map<number, number>();
    let rank = 0;
    let lastMark = -1;
    sortedForRanking.forEach((student, index) => {
        if (student.totalMarks !== lastMark) {
            rank = index + 1;
            lastMark = student.totalMarks;
        }
        rankedStudents.set(student.totalMarks, rank);
    });

    return studentTotals.map(s => ({
      ...s,
      position: rankedStudents.get(s.totalMarks) || 0,
    })).sort((a, b) => a.studentId.localeCompare(b.studentId));

  }, [studentsInClass, exams, totalMaxMarks]);
  
  const printableHeaderHtml = useMemo(() => {
    if (!exams.length) return '';
    const exam = exams[0];
    const logoHtml = settings.logo ? `<img src="${settings.logo}" alt="Academy Logo" style="display: block; margin: 0 auto 0.5rem auto; height: 60px; object-fit: contain;" />` : '';
    return `
      <div class="academy-details">
        ${logoHtml}
        <h1>${settings.name}</h1>
        <p>${settings.address}</p>
        <p>${settings.phone}</p>
      </div>
      <div class="report-title">
        <h2>${groupTitle}</h2>
        <p>Class: ${exam.className} | Session: ${exam.academicSession}</p>
        <p style="font-size: 0.9rem; color: #555;">Total Group Marks: ${totalMaxMarks}</p>
      </div>
    `;
  }, [settings, exams, totalMaxMarks, groupTitle]);

  const printableTableHeaders = useMemo(() => {
    if (!allSubjects.length) return '';
    let headers = `
        <th>#</th>
        <th>Roll #</th>
        <th>Student Name</th>
        <th>Father's Name</th>
    `;
    headers += allSubjects.map(s => `<th>${s}</th>`).join('');
    headers += `<th>Obtained</th>`;
    headers += `<th>Total</th>`;
    headers += `<th>%age</th>`;
    if (showPosition) {
        headers += `<th>Pos.</th>`;
    }
    return `<tr>${headers}</tr>`;
  }, [allSubjects, showPosition]);

   const printableTableBody = useMemo(() => {
    if (!aggregatedResults.length) return '';
    return aggregatedResults.map((student, index) => {
      const marksCells = allSubjects.map(subject => {
        const marks = student.marks[subject];
        const isAbsent = marks === 'A';
        const cellStyle = isAbsent ? 'background-color: #fee2e2; color: #991b1b; font-weight: bold; text-align: center;' : 'text-align: center;';
        return `<td style="${cellStyle}">${marks ?? '-'}</td>`;
      }).join('');
      
      const totalCell = `<td style="text-align: center; font-weight: bold;">${student.totalMarks}</td>`;
      const maxMarksCell = `<td style="text-align: center;">${totalMaxMarks}</td>`;
      const percentageCell = `<td style="text-align: center;">${student.percentage.toFixed(2)}%</td>`;
      const positionCell = showPosition ? `<td style="text-align: center; font-weight: bold;">${student.position ?? '-'}</td>` : '';

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${student.studentId}</td>
          <td>${student.studentName}</td>
          <td>${student.fatherName}</td>
          ${marksCells}
          ${totalCell}
          ${maxMarksCell}
          ${percentageCell}
          ${positionCell}
        </tr>
      `;
    }).join('');
  }, [aggregatedResults, allSubjects, totalMaxMarks, showPosition]);

  const handlePrint = () => {
    if (isSettingsLoading || !printRef.current) {
        toast({ variant: 'destructive', title: 'Cannot Proceed', description: 'Data is not fully loaded.' });
        return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please allow popups for this site.' });
        return;
    }
    printWindow.document.write(`<html><head><title>Print Master Sheet</title>
        <style>
            @media print { 
                @page { size: A4 landscape; margin: 0.75in; } 
                body { -webkit-print-color-adjust: exact; }
            }
            body { font-family: 'Segoe UI', sans-serif; font-size: 10pt; }
            .report-container { max-width: 1100px; margin: auto; display: flex; flex-direction: column; min-height: 95vh; }
            .content-wrap { flex: 1; }
            .academy-details { text-align: center; margin-bottom: 2rem; }
            .academy-details h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
            .academy-details p { font-size: 0.9rem; margin: 0.2rem 0; color: #555; }
            .report-title { text-align: center; margin: 2rem 0; }
            .report-title h2 { font-size: 1.8rem; font-weight: bold; margin: 0 0 0.5rem 0; }
            .report-title p { font-size: 1.1rem; color: #555; margin: 0; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem; }
            th, td { padding: 6px 8px; border: 1px solid #ddd; }
            th { font-weight: bold; background-color: #f2f2f2; text-align: center; }
            .footer { text-align: center; font-size: 0.8rem; color: #888; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; }
        </style>
        </head><body>`);
    printWindow.document.write(printRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleExport = () => {
    if (!aggregatedResults.length) {
        toast({ variant: 'destructive', title: 'Cannot Export', description: 'No results to export.' });
        return;
    }

    const headers = [
        '#',
        'Roll #',
        'Student Name',
        "Father's Name",
        ...allSubjects,
        'Obtained Marks',
        'Total Marks',
        'Percentage',
    ];
    if (showPosition) {
        headers.push('Position');
    }

    const rows = aggregatedResults.map((student, index) => {
        const rowData = [
            index + 1,
            student.studentId,
            `"${student.studentName.replace(/"/g, '""')}"`,
            `"${student.fatherName.replace(/"/g, '""')}"`,
            ...allSubjects.map(subject => {
                const mark = student.marks[subject];
                return mark ?? '';
            }),
            student.totalMarks,
            totalMaxMarks,
            `${student.percentage.toFixed(2)}%`,
        ];
        if (showPosition) {
            rowData.push(student.position);
        }
        return rowData.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${groupTitle.replace(/ /g, '_')}_master_sheet.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const footerHtml = useMemo(() => {
    return `
        <div class="footer">
            Copyright &copy; ${new Date().getFullYear()} ${settings.name}. Developed by SchoolUP.
        </div>
    `;
  }, [settings.name]);

  return (
    <div className="p-4 bg-muted/50 rounded-lg">
        <div ref={printRef} className="absolute -left-[9999px] top-auto w-[1100px] bg-white text-black p-4">
            <div className="report-container">
                <div className="content-wrap">
                    <div dangerouslySetInnerHTML={{ __html: printableHeaderHtml }} />
                    <table>
                        <thead dangerouslySetInnerHTML={{ __html: printableTableHeaders }} />
                        <tbody dangerouslySetInnerHTML={{ __html: printableTableBody }} />
                    </table>
                </div>
                <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
            </div>
        </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id={`show-position-${groupTitle.replace(/ /g, '-')}`} checked={showPosition} onCheckedChange={setShowPosition} />
            <Label htmlFor={`show-position-${groupTitle.replace(/ /g, '-')}`}>Show Position</Label>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2" />
            Print Master Sheet
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2" />
            Export as CSV
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student</TableHead>
                    {allSubjects.map(sub => <TableHead key={sub} className="text-center">{sub}</TableHead>)}
                    <TableHead className="text-center font-bold">Obtained</TableHead>
                    <TableHead className="text-center font-bold">Total</TableHead>
                    <TableHead className="text-center font-bold">%age</TableHead>
                    {showPosition && <TableHead className="text-center font-bold">Pos.</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {aggregatedResults.map((res, index) => (
                    <TableRow key={res.studentId}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell>
                            <div className="font-medium">{res.studentName}</div>
                            <div className="text-xs text-muted-foreground">{res.studentId}</div>
                        </TableCell>
                        {allSubjects.map(sub => {
                            const mark = res.marks[sub];
                            return <TableCell key={sub} className="text-center font-medium">{mark ?? '-'}</TableCell>
                        })}
                        <TableCell className="text-center font-bold">{res.totalMarks}</TableCell>
                        <TableCell className="text-center">{totalMaxMarks}</TableCell>
                        <TableCell className="text-center font-medium">{res.percentage.toFixed(2)}%</TableCell>
                        {showPosition && <TableCell className="text-center font-bold text-lg">{res.position}</TableCell>}
                    </TableRow>
                ))}
                {aggregatedResults.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={allSubjects.length + 6} className="text-center h-24 text-muted-foreground">
                            No results to display for this group.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
