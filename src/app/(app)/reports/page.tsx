
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { type Report } from '@/lib/data';
import { getReports } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { useSettings } from '@/hooks/use-settings';

function generatePdf(report: Report, settings: any) {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
    });

    const reportDate = format(report.reportDate, 'dd/MM/yyyy');
    const studentRows = report.studentBreakdown.map((item: any) => `
      <tr>
        <td>${item.studentName} (${item.studentId})</td>
        <td>${item.studentClass}</td>
        <td>${item.subjectName}</td>
        <td style="text-align: right;">${item.feeShare.toLocaleString()} PKR</td>
      </tr>
    `).join('');

    const printHtml = `
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <style>
                body { 
                    font-family: 'Helvetica', 'Arial', sans-serif;
                    margin: 0; 
                    padding: 2rem; 
                    background-color: #fff;
                    color: #000;
                    font-size: 10px;
                }
                .report-container { max-width: 800px; margin: auto; }
                .header-info { display: flex; justify-content: space-between; align-items: flex-start; font-size: 0.8em; color: #333; }
                .academy-details { text-align: center; margin-bottom: 2rem; }
                .academy-details h1 { font-size: 1.5em; font-weight: bold; margin: 0; }
                .academy-details p { font-size: 0.9em; margin: 0.2rem 0; color: #555; }
                .report-title { text-align: center; margin: 2rem 0; }
                .report-title h2 { font-size: 2em; font-weight: bold; margin: 0 0 0.5rem 0; }
                .report-title p { font-size: 1em; color: #555; margin: 0; }
                .stats-grid { display: flex; justify-content: space-between; gap: 1.5rem; margin-bottom: 2rem; }
                .stat-card { border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; text-align: center; width: 30%; }
                .stat-card p { margin: 0; color: #6b7280; font-size: 0.9em; }
                .stat-card .amount { font-size: 1.5em; font-weight: bold; margin-top: 0.5rem; }
                .teacher-share { color: #16a34a; }
                .academy-share { color: #3b82f6; }
                .breakdown-title { font-size: 1.5em; font-weight: bold; margin-bottom: 1rem; border-bottom: 2px solid #f3f4f6; padding-bottom: 0.5rem; }
                table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9em; }
                th, td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
                th { font-weight: bold; color: #6b7280; }
                .footer { text-align: right; margin-top: 2rem; font-size: 0.8rem; color: #6b7280; }
            </style>
        </head>
        <body>
            <div class="report-container">
                <div class="academy-details">
                    <h1>${settings.name}</h1>
                    <p>${settings.address}</p>
                    <p>Phone: ${settings.phone}</p>
                </div>
                <div class="report-title">
                    <h2>Earnings Report</h2>
                    <p>For: ${report.teacherName} | Date: ${reportDate}</p>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <p>Total Gross Earnings</p>
                        <p class="amount">${report.grossEarnings.toLocaleString()} PKR</p>
                    </div>
                    <div class="stat-card">
                        <p>Teacher's Share (70%)</p>
                        <p class="amount teacher-share">${report.teacherShare.toLocaleString()} PKR</p>
                    </div>
                    <div class="stat-card">
                        <p>Academy's Share (30%)</p>
                        <p class="amount academy-share">${report.academyShare.toLocaleString()} PKR</p>
                    </div>
                </div>
                <h3 class="breakdown-title">Student Breakdown</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Class</th>
                            <th>Subject</th>
                            <th style="text-align: right;">Fee Share</th>
                        </tr>
                    </thead>
                    <tbody>${studentRows}</tbody>
                </table>
            </div>
        </body>
        </html>
    `;

    doc.html(printHtml, {
        callback: function (doc) {
            doc.save(`Earnings-Report-${report.teacherName}-${reportDate}.pdf`);
        },
        x: 0,
        y: 0,
        width: 445, // A4 width in px at 72dpi
        windowWidth: 800
    });
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);
    const { settings } = useSettings();
    const { toast } = useToast();

    const fetchReports = useCallback(async () => {
        setLoading(true);
        const reportsData = await getReports();
        setReports(reportsData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDownload = (report: Report) => {
        setDownloading(report.id);
        try {
            generatePdf(report, settings);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: 'There was an error generating the PDF.',
            });
        } finally {
            setTimeout(() => setDownloading(null), 1000);
        }
    };

  return (
    <div className="flex flex-col gap-6">
       <div>
          <h1 className="text-2xl font-bold tracking-tight">Generated Reports</h1>
          <p className="text-muted-foreground">
            Download or review previously generated teacher earnings reports.
          </p>
        </div>
      <Card>
        <CardHeader>
            <CardTitle>Report History</CardTitle>
            <CardDescription>
                A list of all generated earnings reports.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Teacher Name</TableHead>
                        <TableHead className="text-right">Gross Earnings (PKR)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                        </TableRow>
                        ))
                    ) : (
                        reports.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{format(item.reportDate, 'PPP, p')}</TableCell>
                                <TableCell className="font-medium">{item.teacherName}</TableCell>
                                <TableCell className="text-right font-medium">{item.grossEarnings.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownload(item)}
                                        disabled={downloading === item.id}
                                    >
                                        {downloading === item.id ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Download className="mr-2 h-4 w-4" />
                                        )}
                                        Download PDF
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                     {!loading && reports.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                No reports have been generated yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
