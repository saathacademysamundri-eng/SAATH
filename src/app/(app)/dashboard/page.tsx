
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { dashboardStats, recentActivities, type Income, type Expense } from '@/lib/data';
import { getIncome, getExpenses } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, DollarSign, Hourglass, TrendingDown, TrendingUp, UserPlus, Users, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { OverviewChart } from './overview-chart';

const iconMap: { [key: string]: React.ElementType } = {
  Users,
  UserPlus,
  Wallet,
  Hourglass,
  BookUser: Users,
  TrendingUp,
  TrendingDown
};

function getFeeStatusBadge(status: string) {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700';
        case 'pending':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-700';
        case 'partial':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700';
        case 'overdue':
            return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700';
        case 'admission':
             return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-700';
        case 'exam':
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700';
        default:
            return 'bg-secondary text-secondary-foreground';
    }
}

export default function DashboardPage() {
    const [income, setIncome] = useState<Income[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    useEffect(() => {
        async function fetchData() {
            const incomeData = await getIncome();
            const expenseData = await getExpenses();
            setIncome(incomeData);
            setExpenses(expenseData);
        }
        fetchData();
    }, []);

    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    const summaryStats = [
        { title: 'Total Income', value: `${totalIncome.toLocaleString()} PKR`, icon: 'TrendingUp', change: '' },
        { title: 'Total Expenses', value: `${totalExpenses.toLocaleString()} PKR`, icon: 'TrendingDown', change: '' },
        { title: 'Net Profit', value: `${netProfit.toLocaleString()} PKR`, icon: 'Wallet', change: '' },
        ...dashboardStats.slice(0,1)
    ];


  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => {
          const Icon = iconMap[stat.icon];
          const isPositive = stat.change ? stat.change.startsWith('+') : true;
          return (
            <Card key={stat.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                 {stat.change && <p className="flex items-center text-xs text-muted-foreground">
                  <span
                    className={cn(
                      'flex items-center',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {stat.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="col-span-1 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle>Fee Collection Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="col-span-1 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.date}
                  </p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1">
                    <Badge variant="outline" className={cn("text-xs font-normal", getFeeStatusBadge(activity.status))}>{activity.status}</Badge>
                    {activity.amount && <p className="font-medium">{activity.amount}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
