
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { useAppContext } from '@/hooks/use-app-context';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, LabelList } from 'recharts';
import { useMemo, useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getClassDistribution } from '@/lib/firebase/firestore';

const chartColors = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-6))'
];

export function ClassDistribution() {
  const { classes, loading: appLoading } = useAppContext();
  const [classData, setClassData] = useState<{name: string, studentCount: number, fill: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistribution = async () => {
        setLoading(true);
        try {
            const data = await getClassDistribution();
            setClassData(data.map((d, index) => ({
                ...d,
                fill: chartColors[index % chartColors.length]
            })).filter(d => d.studentCount > 0));
        } catch (error) {
            console.error("Failed to fetch class distribution:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchDistribution();
  }, []);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    classData.forEach(item => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
    });
    return config;
  }, [classData]);

  if (loading || appLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Class Distribution</CardTitle>
                <CardDescription>Student distribution across classes.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {Array.from({length: 4}).map((_, i) => (
                         <div key={i} className="p-4 bg-muted/50 rounded-lg">
                            <Skeleton className="h-5 w-20 mb-2" />
                            <Skeleton className="h-8 w-12" />
                        </div>
                    ))}
                </div>
                <Skeleton className="h-[250px] w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Users />
            Class Distribution
        </CardTitle>
        <CardDescription>Student distribution across classes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {classData.map(item => (
                <div key={item.name} className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">{item.name}</p>
                    <p className="text-3xl font-bold">{item.studentCount}</p>
                </div>
            ))}
        </div>
        
        {classData.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={classData}
                  dataKey="studentCount"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                    <LabelList dataKey="studentCount" className="fill-foreground text-sm" />
                    {classData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No student data available to display distribution.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
