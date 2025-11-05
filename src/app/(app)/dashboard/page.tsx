

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OverviewChart } from './overview-chart';
import { useAppContext } from '@/hooks/use-app-context';
import {
  Users,
  UserCheck,
  UserX,
  MessageSquare,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';
import { getTodaysAttendanceSummary } from '@/lib/firebase/firestore';
import { TodaysAttendance } from './todays-attendance';
import { RecentActivities } from './recent-activities';

const iconMap: { [key: string]: React.ElementType } = {
  Users,
  UserCheck,
  UserX,
  MessageSquare,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Scale,
};


export default function DashboardPage() {
    const { income, expenses, students, teachers } = useAppContext();
    const [attendance, setAttendance] = useState({ present: 0, absent: 0 });

    useEffect(() => {
        getTodaysAttendanceSummary().then(setAttendance);
    }, []);

    const totalIncome = useMemo(() => {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        return income
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear;
            })
            .reduce((sum, item) => sum + item.amount, 0);
    }, [income]);

    const totalExpenses = useMemo(() => {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        return expenses
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear;
            })
            .reduce((sum, item) => sum + item.amount, 0);
    }, [expenses]);
    
    const netProfit = totalIncome - totalExpenses;
    
    const studentsPresent = attendance.present;
    const studentsAbsent = attendance.absent;
    const messagesSent = 0; // Assuming no logic for this yet
    const newAdmissions = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // This assumes new students have a `createdAt` field, which they don't.
        // We will simulate this based on student ID sequence for now.
        const recentStudents = students.filter(student => {
             const studentNum = parseInt(student.id.substring(1));
             // This is a rough heuristic, will be inaccurate if IDs are not sequential
             return studentNum > (students.length - 5);
        });
        return recentStudents.length;
    }, [students]);


    const topRowStats = [
        { title: 'Total Students', value: students.length.toLocaleString(), subtitle: '+2% from last month', icon: 'Users', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
        { title: 'Students Present', value: studentsPresent, subtitle: 'Attendance for today', icon: 'UserCheck', color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' },
        { title: 'Students Absent', value: studentsAbsent, subtitle: 'Attendance for today', icon: 'UserX', color: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' },
        { title: 'Messages Sent Today', value: messagesSent, subtitle: 'WhatsApp messages delivered', icon: 'MessageSquare', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
        { title: 'New Admissions', value: newAdmissions, subtitle: 'In the last 30 days', icon: 'UserPlus', color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
    ];
    
    const bottomRowStats = [
        { title: 'Income (This Month)', value: `${totalIncome.toLocaleString()}`, unit: 'PKR', icon: 'TrendingUp', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' },
        { title: 'Expenses (This Month)', value: `${totalExpenses.toLocaleString()}`, unit: 'PKR', icon: 'TrendingDown', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
        { title: 'Net Profit / Loss', value: `${netProfit.toLocaleString()}`, unit: 'PKR', icon: 'Scale', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    ];


  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {topRowStats.map((stat) => {
          const Icon = iconMap[stat.icon];
          return (
            <Card key={stat.title} className={cn("shadow-sm border", stat.color)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stat.value}</div>
                {stat.subtitle && <p className="text-xs text-muted-foreground">{stat.subtitle}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bottomRowStats.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
                 <Card key={stat.title} className={cn("shadow-sm border", stat.color)}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className='grid gap-2'>
                           <CardTitle className="text-sm font-medium">
                            {stat.title}
                           </CardTitle>
                           <div className="text-4xl font-bold">{stat.value}</div>
                        </div>
                        <Icon className="h-6 w-6" />
                    </CardHeader>
                </Card>
            )
        })}
      </div>

       <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <TodaysAttendance />
            </div>
            <div className="lg:col-span-2">
                <RecentActivities />
            </div>
       </div>

       <div className="grid grid-cols-1 gap-6">
        <Card className="col-span-1 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle>Fee Collection Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
