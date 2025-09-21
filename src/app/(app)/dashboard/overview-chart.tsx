'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { feeCollectionData } from '@/lib/data';
import { ChartTooltipContent } from '@/components/ui/chart';

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={feeCollectionData}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value / 1000}k`}
        />
         <Tooltip 
            cursor={{ fill: 'hsl(var(--accent) / 0.3)' }}
            content={<ChartTooltipContent />}
        />
        <Bar
          dataKey="collected"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="pending"
          fill="hsl(var(--primary) / 0.3)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
