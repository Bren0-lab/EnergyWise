'use client';
import type { Room } from '@/lib/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { calculateApplianceKWh, formatCurrency, formatKWh } from '@/lib/helpers';
import type { ChartConfig } from '@/components/ui/chart';

interface TopConsumersChartProps {
  rooms: Room[];
  costPerKWh: number;
}

export default function TopConsumersChart({ rooms, costPerKWh }: TopConsumersChartProps) {
  const allAppliances = rooms
    .flatMap((room) =>
      room.appliances.map((app) => ({
        ...app,
        monthlyKWh: calculateApplianceKWh(app.power, app.dailyUsageHours).monthlyKWh,
      }))
    )
    .sort((a, b) => b.monthlyKWh - a.monthlyKWh)
    .slice(0, 5);

  const chartData = allAppliances.map((app, index) => ({
    name: app.name,
    consumption: parseFloat(app.monthlyKWh.toFixed(2)),
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  const chartConfig = allAppliances.reduce((acc, app, index) => {
    acc[app.name] = {
      label: app.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return acc;
  }, {} as ChartConfig);

  if (allAppliances.length === 0) {
    return (
      <div className="flex h-full min-h-[250px] w-full flex-col items-center justify-center text-center text-muted-foreground">
        <p className="text-sm">Sem dados de consumo para exibir.</p>
        <p className="text-xs">Adicione alguns aparelhos para ver o gráfico.</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
          }}
        >
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            className="text-xs truncate"
            interval={0}
            width={80}
            tick={{ fill: 'hsl(var(--foreground))' }}
          />
          <XAxis dataKey="consumption" type="number" hide />
          <Tooltip
            cursor={{ fill: 'hsl(var(--background))' }}
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex flex-col">
                    <span className="text-sm capitalize">{name.toString()}</span>
                    <span className="font-bold text-primary">{formatKWh(value as number)}</span>
                    <span className="text-xs text-accent">{formatCurrency((value as number) * costPerKWh)}/mês</span>
                  </div>
                )}
                hideLabel
              />
            }
          />
          <Bar dataKey="consumption" layout="vertical" radius={5} barSize={35}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
