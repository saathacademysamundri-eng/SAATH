
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/hooks/use-app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AcademySharePage() {
  const { teachers, allPayouts, loading: isAppLoading } = useAppContext();
  const router = useRouter();

  const academyShareData = useMemo(() => {
    if (isAppLoading) return [];

    const shareByTeacher = new Map<string, { teacher: any; totalShare: number }>();

    teachers.forEach(teacher => {
      shareByTeacher.set(teacher.id, { teacher, totalShare: 0 });
    });

    allPayouts.forEach(payout => {
      if (shareByTeacher.has(payout.teacherId)) {
        const entry = shareByTeacher.get(payout.teacherId)!;
        const academyShare = payout.report?.academyShare || 0;
        entry.totalShare += academyShare;
      }
    });

    return Array.from(shareByTeacher.values()).sort((a, b) => b.totalShare - a.totalShare);

  }, [isAppLoading, teachers, allPayouts]);

  const totalAcademyEarnings = useMemo(() => {
    return academyShareData.reduce((acc, curr) => acc + curr.totalShare, 0);
  }, [academyShareData]);

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academy Share</h1>
        <p className="text-muted-foreground">
          An overview of the academy's revenue share from teacher earnings.
        </p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TrendingUp />
                Total Academy Earnings
            </CardTitle>
            <CardDescription>This is the cumulative 30% share the academy has earned from all teacher payouts.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-4xl font-bold text-primary">{totalAcademyEarnings.toLocaleString()} PKR</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share per Teacher</CardTitle>
          <CardDescription>
            The total revenue share generated for the academy by each teacher.
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
                        No payout data available to calculate academy share.
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
