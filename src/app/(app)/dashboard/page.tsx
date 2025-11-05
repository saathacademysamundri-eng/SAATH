

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
import { useMemo } from 'react';

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
    
    // Mock data for new cards, as the logic is not yet implemented
    const studentsPresent = 0;
    const studentsAbsent = 0;
    const messagesSent = 0;
    const newAdmissions = 0;


    const topRowStats = [
        { title: 'Total Students', value: students.length.toLocaleString(), subtitle: '+2% from last month', icon: 'Users', color: 'bg-purple-600' },
        { title: 'Students Present', value: studentsPresent, subtitle: 'Attendance for today', icon: 'UserCheck', color: 'bg-green-600' },
        { title: 'Students Absent', value: studentsAbsent, subtitle: 'Attendance for today', icon: 'UserX', color: 'bg-red-600' },
        { title: 'Messages Sent Today', value: messagesSent, subtitle: 'WhatsApp messages delivered', icon: 'MessageSquare', color: 'bg-blue-600' },
        { title: 'New Admissions', value: newAdmissions, subtitle: 'In the last 30 days', icon: 'UserPlus', color: 'bg-indigo-600' },
    ];
    
    const bottomRowStats = [
        { title: 'Income (This Month)', value: `${totalIncome.toLocaleString()}`, unit: 'PKR', icon: 'TrendingUp', color: 'bg-green-700/20 text-green-500 border-green-500/30' },
        { title: 'Expenses (This Month)', value: `${totalExpenses.toLocaleString()}`, unit: 'PKR', icon: 'TrendingDown', color: 'bg-red-700/20 text-red-500 border-red-500/30' },
        { title: 'Net Profit / Loss', value: `${netProfit.toLocaleString()}`, unit: 'PKR', icon: 'Scale', color: 'bg-purple-700/20 text-purple-400 border-purple-500/30' },
    ];


  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {topRowStats.map((stat) => {
          const Icon = iconMap[stat.icon];
          return (
            <Card key={stat.title} className={cn("shadow-sm text-white", stat.color)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-white/80">
                  {stat.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stat.value}</div>
                {stat.subtitle && <p className="text-xs text-white/70">{stat.subtitle}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {bottomRowStats.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
                 <Card key={stat.title} className={cn("shadow-sm", stat.color)}>
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
