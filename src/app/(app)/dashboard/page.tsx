

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
import { recentActivities } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, DollarSign, BookUser, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { OverviewChart } from './overview-chart';
import { useAppContext } from '@/hooks/use-app-context';

const iconMap: { [key: string]: React.ElementType } = {
  Users,
  BookUser,
  TrendingUp,
  TrendingDown,
  Wallet,
};

function getFeeStatusBadge(status: string) {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700';
        case 'admission':
             return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-700';
        default:
            return 'bg-secondary text-secondary-foreground';
    }
}

export default function DashboardPage() {
    const { income, expenses, students, teachers } = useAppContext();

    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    const summaryStats = [
        { title: 'Total Students', value: students.length.toLocaleString(), icon: 'Users', color: 'bg-sky-500' },
        { title: 'Total Teachers', value: teachers.length.toLocaleString(), icon: 'BookUser', color: 'bg-amber-500' },
        { title: 'Total Income', value: `${totalIncome.toLocaleString()}`, unit: 'PKR', icon: 'TrendingUp', color: 'bg-emerald-500' },
        { title: 'Net Profit', value: `${netProfit.toLocaleString()}`, unit: 'PKR', icon: 'Wallet', color: 'bg-rose-500' },
    ];


  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => {
          const Icon = iconMap[stat.icon];
          return (
            <Card key={stat.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={cn("flex items-center justify-center h-8 w-8 rounded-lg text-white", stat.color)}>
                    <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                {stat.unit && <p className="text-xs text-muted-foreground">{stat.unit}</p>}
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
        <Card className="col-span-1 flex flex-col shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="animate-scroll-up-slow">
              {[...recentActivities, ...recentActivities].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 py-3">
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
                      {activity.amount && <p className="font-medium text-sm">{activity.amount}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
