'use client';

import { useState } from 'react';
import type { Appliance } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Zap,
  Clock,
  Pencil,
  Trash2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { AddApplianceDialog } from './add-appliance-dialog';
import { calculateApplianceKWh, formatCurrency, formatKWh } from '@/lib/helpers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getSavingsSuggestion } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { SuggestSavingsOutput } from '@/ai/flows/suggest-savings';

interface ApplianceCardProps {
  appliance: Appliance;
  costPerKWh: number;
  onEdit: (appliance: Appliance) => void;
  onDelete: () => void;
}

export default function ApplianceCard({ appliance, costPerKWh, onEdit, onDelete }: ApplianceCardProps) {
  const { dailyKWh, monthlyKWh } = calculateApplianceKWh(
    appliance.power,
    appliance.dailyUsageHours
  );
  const { toast } = useToast();
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestSavingsOutput | null>(null);

  const handleSuggestion = async () => {
    setIsLoadingSuggestion(true);
    setSuggestion(null);
    try {
      const result = await getSavingsSuggestion({
        applianceName: appliance.name,
        power: appliance.power,
        dailyUsageHours: appliance.dailyUsageHours,
        costPerKWh: costPerKWh,
      });
      if (result.applicable) {
        setSuggestion(result);
      } else {
         toast({
          title: "No obvious savings",
          description: "This appliance's usage seems optimized already.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get savings suggestion.',
      });
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  return (
    <Card className="bg-secondary/30 p-3 sm:p-4 rounded-lg shadow-md transition-all duration-300 hover:bg-secondary/50 hover:scale-[1.01]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-grow">
          <h4 className="font-semibold text-lg">{appliance.name}</h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1.5" title="Power">
              <Zap className="h-4 w-4 text-primary" />
              <span>{appliance.power} W</span>
            </div>
            <div className="flex items-center gap-1.5" title="Daily Usage">
              <Clock className="h-4 w-4 text-primary" />
              <span>{appliance.dailyUsageHours}h / day</span>
            </div>
          </div>
        </div>
        <div className="flex w-full sm:w-auto items-center justify-between gap-2">
           <div className="text-right">
            <p className="font-semibold text-primary">{formatKWh(monthlyKWh)}</p>
            <p className="text-xs text-accent">{formatCurrency(monthlyKWh * costPerKWh)} / month</p>
          </div>
          <div className="flex items-center gap-1">
            <AlertDialog open={!!suggestion} onOpenChange={(open) => !open && setSuggestion(null)}>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSuggestion}
                disabled={isLoadingSuggestion}
                title="Get Savings Suggestion"
                className="hover:text-primary transition-colors"
              >
                {isLoadingSuggestion ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
               <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary"/> Savings Suggestion
                    </AlertDialogTitle>
                  <AlertDialogDescription>
                    {suggestion?.suggestion || "Loading suggestion..."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Got it!</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AddApplianceDialog onSave={(data) => onEdit({ ...data, id: appliance.id })} editAppliance={appliance}>
              <Button size="icon" variant="ghost" title="Edit Appliance" className="hover:text-primary transition-colors">
                <Pencil className="h-4 w-4" />
              </Button>
            </AddApplianceDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" title="Delete Appliance" className="text-destructive/80 hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the <strong>{appliance.name}</strong> from this room.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
  );
}
