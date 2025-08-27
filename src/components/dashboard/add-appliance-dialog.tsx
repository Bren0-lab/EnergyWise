'use client';

import { useState, type ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Appliance } from '@/lib/types';

const applianceSchema = z.object({
  name: z.string().min(1, 'O nome do aparelho é obrigatório.'),
  power: z.coerce.number().min(1, 'A potência deve ser maior que 0.'),
  dailyUsageHours: z.coerce
    .number()
    .min(0, 'O uso não pode ser negativo.')
    .max(24, 'O uso não pode exceder 24 horas.'),
});

type ApplianceFormData = z.infer<typeof applianceSchema>;

interface AddApplianceDialogProps {
  children: ReactNode;
  onSave: (appliance: Omit<Appliance, 'id'>) => void;
  editAppliance?: Appliance;
}

export function AddApplianceDialog({ children, onSave, editAppliance }: AddApplianceDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<ApplianceFormData>({
    resolver: zodResolver(applianceSchema),
    defaultValues: {
      name: editAppliance?.name || '',
      power: editAppliance?.power || 0,
      dailyUsageHours: editAppliance?.dailyUsageHours || 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editAppliance
          ? {
              name: editAppliance.name,
              power: editAppliance.power,
              dailyUsageHours: editAppliance.dailyUsageHours,
            }
          : { name: '', power: 0, dailyUsageHours: 0 }
      );
    }
  }, [open, editAppliance, form]);

  const onSubmit = (data: ApplianceFormData) => {
    onSave(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{editAppliance ? 'Editar Aparelho' : 'Adicionar Aparelho'}</DialogTitle>
              <DialogDescription>
                {editAppliance ? 'Atualize os detalhes deste aparelho.' : 'Insira os detalhes do novo aparelho.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Aparelho</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: TV LED" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="power"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potência (Watts)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 65" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dailyUsageHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uso Diário Médio (Horas)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Ex: 4.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">{editAppliance ? 'Salvar Alterações' : 'Adicionar Aparelho'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
