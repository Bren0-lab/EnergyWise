'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  costPerKWh: number;
  setCostPerKWh: (cost: number) => void;
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Button asChild variant={isActive ? 'default' : 'ghost'} size="sm">
      <Link href={href}>{children}</Link>
    </Button>
  );
};


export function DashboardHeader({ costPerKWh, setCostPerKWh }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/50 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="hidden text-xl font-bold tracking-tight text-foreground sm:block md:text-2xl">
            EnergyWise
          </h1>
        </div>

        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-card/50 p-1">
          <div className="flex items-center gap-1">
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/floorplan">Planta</NavLink>
          </div>
        </nav>

        <div className={cn('flex items-center gap-2', pathname === '/floorplan' && 'invisible')}>
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
