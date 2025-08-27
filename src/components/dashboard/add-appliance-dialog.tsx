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
  name: z.string().min(1, 'Appliance name is required.'),
  power: z.coerce.number().min(1, 'Power must be greater than 0.'),
  dailyUsageHours: z.coerce
    .number()
    .min(0, 'Usage cannot be negative.')
    .max(24, 'Usage cannot exceed 24 hours.'),
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
              <DialogTitle>{editAppliance ? 'Edit Appliance' : 'Add Appliance'}</DialogTitle>
              <DialogDescription>
                {editAppliance ? 'Update the details for this appliance.' : 'Enter the details for the new appliance.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appliance Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., LED TV" {...field} />
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
                    <FormLabel>Power (Watts)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 65" {...field} />
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
                    <FormLabel>Average Daily Usage (Hours)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 4.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">{editAppliance ? 'Save Changes' : 'Add Appliance'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
