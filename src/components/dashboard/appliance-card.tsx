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
  const { monthlyKWh } = calculateApplianceKWh(
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
          title: "Nenhuma economia óbvia",
          description: "O uso deste aparelho já parece otimizado.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível obter a sugestão de economia.',
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
            <div className="flex items-center gap-1.5" title="Potência">
              <Zap className="h-4 w-4 text-primary" />
              <span>{appliance.power} W</span>
            </div>
            <div className="flex items-center gap-1.5" title="Uso Diário">
              <Clock className="h-4 w-4 text-primary" />
              <span>{appliance.dailyUsageHours}h / dia</span>
            </div>
          </div>
        </div>
        <div className="flex w-full sm:w-auto items-center justify-between gap-2">
           <div className="text-right">
            <p className="font-semibold text-primary">{formatKWh(monthlyKWh)}</p>
            <p className="text-xs text-accent">{formatCurrency(monthlyKWh * costPerKWh)} / mês</p>
          </div>
          <div className="flex items-center gap-1">
            <AlertDialog open={!!suggestion} onOpenChange={(open) => !open && setSuggestion(null)}>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSuggestion}
                disabled={isLoadingSuggestion}
                title="Obter Sugestão de Economia"
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
                    <Sparkles className="h-5 w-5 text-primary"/> Sugestão de Economia
                    </AlertDialogTitle>
                  <AlertDialogDescription>
                    {suggestion?.suggestion || "Carregando sugestão..."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Entendi!</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AddApplianceDialog onSave={(data) => onEdit({ ...data, id: appliance.id })} editAppliance={appliance}>
              <Button size="icon" variant="ghost" title="Editar Aparelho" className="hover:text-primary transition-colors">
                <Pencil className="h-4 w-4" />
              </Button>
            </AddApplianceDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" title="Excluir Aparelho" className="text-destructive/80 hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso excluirá permanentemente o <strong>{appliance.name}</strong> deste cômodo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
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
