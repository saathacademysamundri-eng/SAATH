
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/hooks/use-app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, Printer, Calendar as CalendarIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';

export default function AcademySharePage() {
  const { teachers, allPayouts, loading: isAppLoading } = useAppContext();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();
  const router = useRouter();
  
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const filteredPayouts = useMemo(() => {
    if (!date?.from) return allPayouts;
    const fromDate = date.from;
    const toDate = date.to ? addDays(date.to, 1) : addDays(fromDate, 1);

    return allPayouts.filter(payout => {
      const payoutDate = payout.payoutDate;
      return payoutDate >= fromDate && payoutDate < toDate;
    });
  }, [allPayouts, date]);

  const academyShareData = useMemo(() => {
    if (isAppLoading) return [];

    const shareByTeacher = new Map<string, { teacher: any; totalShare: number }>();

    teachers.forEach(teacher => {
      shareByTeacher.set(teacher.id, { teacher, totalShare: 0 });
    });

    filteredPayouts.forEach(payout => {
      if (shareByTeacher.has(payout.teacherId)) {
        const entry = shareByTeacher.get(payout.teacherId)!;
        const academyShare = payout.report?.academyShare || 0;
        entry.totalShare += academyShare;
      }
    });

    return Array.from(shareByTeacher.values())
      .filter(item => item.totalShare > 0)
      .sort((a, b) => b.totalShare - a.totalShare);

  }, [isAppLoading, teachers, filteredPayouts]);

  const totalAcademyEarnings = useMemo(() => {
    return academyShareData.reduce((acc, curr) => acc + curr.totalShare, 0);
  }, [academyShareData]);

  const handlePrint = () => {
    if (isSettingsLoading) {
      toast({ variant: 'destructive', title: 'Please wait', description: 'Settings are still loading.' });
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Cannot Print', description: 'Please allow popups for this site.' });
      return;
    }

    const reportTitle = 'Academy Share Report';
    const dateRangeString = date?.from ? `${format(date.from, 'PPP')} to ${date.to ? format(date.to, 'PPP') : 'today'}` : 'All Time';
    const tableHeaders = ["Teacher", "Total Academy Share"];
    const tableRows = academyShareData.map(item => `
        <tr>
          <td>${item.teacher.name}</td>
          <td style="text-align: right;">${item.totalShare.toLocaleString()} PKR</td>
        </tr>
      `).join('');

    const printHtml = `
      <html>
        <head>
          <title>${reportTitle}</title>
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
            .report-title p { font-size: 1rem; color: #555; }
            .summary-total { text-align: center; margin: 2rem 0; padding: 1.5rem; background-color: #f8f9fa; border-radius: 8px; }
            .summary-total p { margin: 0; font-size: 1.1rem; color: #555; }
            .summary-total .amount { font-size: 2.5rem; font-weight: bold; color: #28a745; margin-top: 0.5rem; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
            th, td { padding: 8px 10px; border: 1px solid #ddd; }
            th { font-weight: bold; background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
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
              <h2>${reportTitle}</h2>
              <p>${dateRangeString}</p>
            </div>
             <div class="summary-total">
                <p>Total Academy Earnings for Period</p>
                <p class="amount">${totalAcademyEarnings.toLocaleString()} PKR</p>
            </div>
            <table>
              <thead>
                <tr>
                  ${tableHeaders.map(h => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${tableRows.length > 0 ? tableRows : `<tr><td colspan="${tableHeaders.length}" style="text-align: center;">No data for this period.</td></tr>`}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };


  if (isAppLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Academy Share</h1>
            <p className="text-muted-foreground">
                An overview of the academy's revenue share from teacher earnings.
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
            {date && <Button variant="ghost" size="icon" onClick={() => setDate(undefined)}><X /></Button>}
             <Button onClick={handlePrint} disabled={isSettingsLoading}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TrendingUp />
                Total Academy Earnings
            </CardTitle>
            <CardDescription>
                This is the cumulative 30% share the academy has earned from all teacher payouts
                {date?.from && ` between ${format(date.from, 'PPP')} and ${date.to ? format(date.to, 'PPP') : 'today'}`}.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-4xl font-bold text-primary">{totalAcademyEarnings.toLocaleString()} PKR</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share per Teacher</CardTitle>
          <CardDescription>
            The total revenue share generated for the academy by each teacher for the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead className="text-right">Total Academy Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academyShareData.map(({ teacher, totalShare }) => (
                <TableRow key={teacher.id} className="cursor-pointer" onClick={() => router.push(`/teachers/${teacher.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{teacher.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {totalShare.toLocaleString()} PKR
                  </TableCell>
                </TableRow>
              ))}
              {academyShareData.length === 0 && (
                <TableRow>
                    <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                        No payout data available for the selected period.
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
