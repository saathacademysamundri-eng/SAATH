'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { feeCollectionData } from '@/lib/data';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  collected: {
    label: 'Collected',
    color: 'hsl(var(--chart-1))',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-2))',
  },
};

export function OverviewChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={feeCollectionData}>
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
          fill="var(--color-collected)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="pending"
          fill="var(--color-pending)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
