'use client';

import type { Room } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { calculateRoomKWh } from '@/lib/helpers';
import type { ChartConfig } from '@/components/ui/chart';

interface ConsumptionChartProps {
  rooms: Room[];
}

export default function ConsumptionChart({ rooms }: ConsumptionChartProps) {
  const chartData = rooms
    .map((room, index) => ({
      room: room.name,
      consumption: parseFloat(calculateRoomKWh(room.appliances).monthlyKWh.toFixed(2)),
      fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    }))
    .filter((data) => data.consumption > 0);

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
      <div className="flex h-full min-h-[250px] w-full flex-col items-center justify-center text-center text-muted-foreground">
        <p className="text-sm">Sem dados de consumo para exibir.</p>
        <p className="text-xs">Adicione aparelhos aos cômodos para ver o gráfico.</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <PieChart>
        <Tooltip
          cursor={{ fill: 'hsl(var(--background))' }}
          content={<ChartTooltipContent hideLabel formatter={(value) => `${value} kWh`} />}
        />
        <Pie data={chartData} dataKey="consumption" nameKey="room" innerRadius={50} strokeWidth={5} paddingAngle={2}>
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
