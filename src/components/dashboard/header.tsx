'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';

interface HeaderProps {
  costPerKWh: number;
  setCostPerKWh: (cost: number) => void;
}

export function DashboardHeader({ costPerKWh, setCostPerKWh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-background/50 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            EnergyWise
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="cost-kwh" className="text-sm text-muted-foreground whitespace-nowrap">
            R$ / kWh
          </Label>
          <Input
            id="cost-kwh"
            type="number"
            value={costPerKWh}
            onChange={(e) => setCostPerKWh(parseFloat(e.target.value) || 0)}
            className="w-24 bg-card"
            step="0.01"
            aria-label="Custo por KWh"
          />
        </div>
      </div>
    </header>
  );
}
