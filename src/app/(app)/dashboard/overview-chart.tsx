'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
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
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart accessibilityLayer data={feeCollectionData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={(value) => `${value / 1000}k`}
        />
         <Tooltip 
            cursor={false}
            content={<ChartTooltipContent indicator='dot' />}
            wrapperClassName="bg-card/80 backdrop-blur-sm"
        />
        <Bar
          dataKey="collected"
          fill="var(--color-collected)"
          radius={8}
        />
        <Bar
          dataKey="pending"
          fill="var(--color-pending)"
          radius={8}
        />
      </BarChart>
    </ChartContainer>
  );
}
