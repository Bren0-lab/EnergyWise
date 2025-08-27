'use client';

import type { Room, Appliance } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil, MoreVertical } from 'lucide-react';
import ApplianceCard from './appliance-card';
import { AddApplianceDialog } from './add-appliance-dialog';
import { calculateRoomKWh, formatCurrency, formatKWh } from '@/lib/helpers';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { Input } from '../ui/input';

interface RoomCardProps {
  room: Room;
  costPerKWh: number;
  onAddAppliance: (appliance: Omit<Appliance, 'id'>) => void;
  onEditAppliance: (appliance: Appliance) => void;
  onDeleteAppliance: (applianceId: string) => void;
  onDeleteRoom: () => void;
  onEditRoom: (newName: string) => void;
}

export default function RoomCard({
  room,
  costPerKWh,
  onAddAppliance,
  onEditAppliance,
  onDeleteAppliance,
  onDeleteRoom,
  onEditRoom,
}: RoomCardProps) {
  const roomTotals = calculateRoomKWh(room.appliances);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(room.name);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(editedName.trim() !== room.name) {
      onEditRoom(editedName.trim());
    }
    setIsEditing(false);
  }

  return (
    <Card className="flex flex-col overflow-hidden border-border bg-card shadow-lg transition-all hover:shadow-neon-sm">
      <CardHeader className="flex flex-row items-start justify-between bg-secondary/30">
        <div>
          {isEditing ? (
            <form onSubmit={handleNameSubmit} className="flex gap-2">
              <Input value={editedName} onChange={e => setEditedName(e.target.value)} className="h-9"/>
              <Button type="submit" size="sm">Save</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            </form>
          ) : (
            <CardTitle className="text-xl font-bold text-primary">{room.name}</CardTitle>
          )}
          <CardDescription>
            Monthly: {formatKWh(roomTotals.monthlyKWh)} / {formatCurrency(roomTotals.monthlyKWh * costPerKWh)}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <AddApplianceDialog onSave={onAddAppliance}>
            <Button size="sm" variant="outline" className="transition-all hover:bg-primary hover:text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Appliance
            </Button>
          </AddApplianceDialog>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Rename Room</span>
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/20 focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Room</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the <strong>{room.name}</strong> room and all its appliances.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDeleteRoom} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 md:p-6">
        {room.appliances.length > 0 ? (
          <div className="space-y-4">
            {room.appliances.map((appliance) => (
              <ApplianceCard
                key={appliance.id}
                appliance={appliance}
                costPerKWh={costPerKWh}
                onEdit={onEditAppliance}
                onDelete={() => onDeleteAppliance(appliance.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>No appliances in this room yet.</p>
            <p className="text-sm">Click "Add Appliance" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
