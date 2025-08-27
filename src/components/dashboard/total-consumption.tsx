'use client';

import { formatCurrency, formatKWh } from '@/lib/helpers';

interface TotalConsumptionProps {
  totalKWh: {
    dailyKWh: number;
    monthlyKWh: number;
    yearlyKWh: number;
  };
  costPerKWh: number;
}

interface StatCardProps {
    title: string;
    kwh: number;
    cost: number;
    className?: string;
}

const StatCard = ({title, kwh, cost, className}: StatCardProps) => (
    <div className={`p-4 bg-card rounded-lg flex flex-col justify-center items-center shadow-lg transition-all hover:shadow-neon-sm ${className}`}>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-primary">{formatKWh(kwh)}</p>
        <p className="text-sm text-accent">{formatCurrency(cost)}</p>
    </div>
)

export default function TotalConsumption({ totalKWh, costPerKWh }: TotalConsumptionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard 
        title="Consumo Diário" 
        kwh={totalKWh.dailyKWh}
        cost={totalKWh.dailyKWh * costPerKWh}
      />
      <StatCard 
        title="Consumo Mensal" 
        kwh={totalKWh.monthlyKWh}
        cost={totalKWh.monthlyKWh * costPerKWh}
      />
      <StatCard 
        title="Consumo Anual" 
        kwh={totalKWh.yearlyKWh}
        cost={totalKWh.yearlyKWh * costPerKWh}
        className="col-span-2 md:col-span-1"
      />
    </div>
  );
}
