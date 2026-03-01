
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { getTodaysAttendanceSummary, getTodaysMessagesCount, getExams, createNotification, getDashboardStats, getRecentActivities, checkAndGenerateMonthlyFees } from '@/lib/firebase/firestore';
import { TodaysAttendance } from './todays-attendance';
import { RecentActivities } from './recent-activities';
import { TodaysTeacherAttendance } from './todays-teacher-attendance';
import { ClassDistribution } from './class-distribution';
import { ADMIN_UID, Activity } from '@/lib/data';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

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
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [attendance, setAttendance] = useState({ present: 0, absent: 0 });
    const [messagesSent, setMessagesSent] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadDashboard = async () => {
        setLoading(true);
        const [statsData, activitiesData, attendanceData, messagesData] = await Promise.all([
            getDashboardStats(),
            getRecentActivities(10),
            getTodaysAttendanceSummary(),
            getTodaysMessagesCount()
        ]);
        setStats(statsData);
        setActivities(activitiesData);
        setAttendance(attendanceData);
        setMessagesSent(messagesData);
        setLoading(false);
    };

    useEffect(() => {
        const runMonthlyMaintenance = async () => {
            // 1. Trigger Automatic Monthly Fee Generation
            // Note: The function itself handles the "run only once per month" logic via Firestore.
            try {
                await checkAndGenerateMonthlyFees();
            } catch (e) {
                console.error("Monthly fee generation failed:", e);
            }
        };

        runMonthlyMaintenance();
        loadDashboard();

        const checkMissedDeadlines = async () => {
            const lastCheck = localStorage.getItem('lastDeadlineCheck');
            const today = new Date().toISOString().split('T')[0];

            if (lastCheck === today) {
                return;
            }

            const allExams = await getExams();
            const now = new Date();
            const notifiedExams = JSON.parse(localStorage.getItem('notifiedMissedDeadlines') || '[]');
            const newNotifiedExams = [...notifiedExams];

            for (const exam of allExams) {
                if (exam.submissionDeadline && new Date(exam.submissionDeadline) < now && exam.status === 'approved') {
                    const isIncomplete = !exam.results || exam.results.length === 0;
                    if (isIncomplete && !notifiedExams.includes(exam.id)) {
                        await createNotification(
                            ADMIN_UID,
                            `Marks for "${exam.name}" (${exam.className}) by ${exam.teacherName} are overdue. The deadline was ${format(new Date(exam.submissionDeadline), 'PPP')}.`,
                            `/exams/${exam.id}`
                        );
                        newNotifiedExams.push(exam.id);
                    }
                }
            }
            localStorage.setItem('lastDeadlineCheck', today);
            localStorage.setItem('notifiedMissedDeadlines', JSON.stringify(newNotifiedExams));
        };

        checkMissedDeadlines();
    }, []);

    const topRowStats = useMemo(() => [
        { title: 'Total Students', value: stats?.totalStudents || 0, icon: 'Users', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
        { title: 'Students Present', value: attendance.present, subtitle: 'Attendance for today', icon: 'UserCheck', color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' },
        { title: 'Students Absent', value: attendance.absent, subtitle: 'Attendance for today', icon: 'UserX', color: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' },
        { title: 'Pending Dues', value: stats?.pendingDues.toLocaleString() || 0, subtitle: 'Live outstanding balance', icon: 'Scale', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
        { title: 'New Admissions', value: stats?.newAdmissions || 0, subtitle: 'In the last 30 days', icon: 'UserPlus', color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
    ], [stats, attendance]);
    
    const bottomRowStats = useMemo(() => [
        { title: 'Income (This Month)', value: `${stats?.incomeThisMonth.toLocaleString() || 0}`, unit: 'PKR', icon: 'TrendingUp', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' },
        { title: 'Expenses (This Month)', value: `${stats?.expensesThisMonth.toLocaleString() || 0}`, unit: 'PKR', icon: 'TrendingDown', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
        { title: 'Net Profit / Loss', value: `${((stats?.incomeThisMonth || 0) - (stats?.expensesThisMonth || 0)).toLocaleString()}`, unit: 'PKR', icon: 'Scale', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    ], [stats]);

  if (loading) {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <Skeleton className="lg:col-span-3 h-[400px]" />
                <Skeleton className="lg:col-span-2 h-[400px]" />
            </div>
        </div>
    );
  }

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
                <RecentActivities initialActivities={activities} />
            </div>
       </div>

       <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TodaysTeacherAttendance />
          </div>
          <div className="lg:col-span-2">
            <ClassDistribution />
          </div>
       </div>
    </div>
  );
}
