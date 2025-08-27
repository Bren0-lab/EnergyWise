'use client';

import type { Room } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { calculateRoomKWh } from '@/lib/helpers';
import type { ChartConfig } from '@/components/ui/chart';

interface ConsumptionChartProps {
  rooms: Room[];
}

export default function ConsumptionChart({ rooms }: ConsumptionChartProps) {
  const chartData = rooms.map((room) => ({
    room: room.name,
    consumption: calculateRoomKWh(room.appliances).monthlyKWh,
    fill: `hsl(var(--chart-${(rooms.indexOf(room) % 5) + 1}))`,
  }));

  const chartConfig = rooms.reduce((acc, room, index) => {
    acc[room.name] = {
      label: room.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return acc;
  }, {} as ChartConfig);

  const totalConsumption = chartData.reduce((acc, curr) => acc + curr.consumption, 0);

  if (totalConsumption === 0) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center text-center text-muted-foreground">
            <p className="text-sm">No consumption data to display.</p>
            <p className="text-xs">Add some appliances to see the chart.</p>
        </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="consumption"
          nameKey="room"
          innerRadius={60}
          strokeWidth={5}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
            content={<ChartLegendContent nameKey="room" />}
            className="-translate-y-[2px] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
