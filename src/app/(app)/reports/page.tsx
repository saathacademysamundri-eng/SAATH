
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  FileText,
  DollarSign,
  BadgeAlert,
  ClipboardCheck,
  Printer,
  FileDown,
} from 'lucide-react';

const reportCards = [
  {
    title: 'All Students Report',
    description: 'Generate a report with a complete list of all students currently enrolled in the academy.',
    icon: Users,
  },
  {
    title: 'Student Financial Report',
    description: 'Detailed financial report for an individual student, including fee history and outstanding dues.',
    icon: FileText,
  },
  {
    title: 'Fee Collection Report',
    description: 'Summary of all fees collected within a specific date range, categorized by class or student.',
    icon: DollarSign,
  },
  {
    title: 'Unpaid Dues Report',
    description: 'A list of all students with pending or overdue fee payments, including balance amounts.',
    icon: BadgeAlert,
  },
  {
    title: 'Attendance Report',
    description: 'Generate attendance reports for a class or student for a specified period.',
    icon: ClipboardCheck,
  },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports Dashboard</h1>
        <p className="text-muted-foreground">
          Generate, view, and export various reports for your academy.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((report, index) => {
          const Icon = report.icon;
          return (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-auto flex gap-2 pt-4">
                <Button variant="outline" className="w-full">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" className="w-full">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
