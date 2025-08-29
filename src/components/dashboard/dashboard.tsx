'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Room, Appliance } from '@/lib/types';
import { DashboardHeader } from './header';
import { AddRoomDialog } from './add-room-dialog';
import RoomCard from './room-card';
import { calculateTotalKWh } from '@/lib/helpers';
import ConsumptionChart from './consumption-chart';
import TopConsumersChart from './top-consumers-chart';
import TotalConsumption from './total-consumption';
import { useAppState } from '@/context/app-state-provider';

export default function Dashboard() {
  const { rooms, setRooms, costPerKWh, setCostPerKWh, isClient } = useAppState();

  if (!isClient) {
    // Render a skeleton or loading state on the server/initial render
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-pulse">
            <div className="h-16 bg-card rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                <div className="lg:col-span-5 h-24 bg-card rounded-lg"></div>
                <div className="bg-card rounded-lg min-h-[300px] lg:col-span-2"></div>
                <div className="bg-card rounded-lg min-h-[300px] lg:col-span-3"></div>
            </div>
            <div className="h-10 bg-card rounded-lg w-48 mb-6"></div>
            <div className="space-y-6">
                <div className="h-64 bg-card rounded-lg"></div>
                <div className="h-64 bg-card rounded-lg"></div>
            </div>
        </div>
    );
  }

  const handleSetCost = (cost: number) => {
    setCostPerKWh(cost);
  };

  const handleAddRoom = (name: string) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name,
      appliances: [],
    };
    setRooms([...rooms, newRoom]);
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter((room) => room.id !== roomId));
  };

  const handleEditRoom = (roomId: string, newName: string) => {
    setRooms(rooms.map((room) => (room.id === roomId ? { ...room, name: newName } : room)));
  };

  const handleAddAppliance = (roomId: string, appliance: Omit<Appliance, 'id'>) => {
    const newAppliance = { ...appliance, id: `app-${Date.now()}` };
    setRooms(
      rooms.map((room) =>
        room.id === roomId ? { ...room, appliances: [...room.appliances, newAppliance] } : room
      )
    );
  };

  const handleEditAppliance = (roomId: string, updatedAppliance: Appliance) => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              appliances: room.appliances.map((app) => (app.id === updatedAppliance.id ? updatedAppliance : app)),
            }
          : room
      )
    );
  };

  const handleDeleteAppliance = (roomId: string, applianceId: string) => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              appliances: room.appliances.filter((app) => app.id !== applianceId),
            }
          : room
      )
    );
  };

  const totalKWh = calculateTotalKWh(rooms);

  return (
    <>
      <DashboardHeader costPerKWh={costPerKWh} setCostPerKWh={handleSetCost} />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <section id="dashboard" className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4 text-center sm:text-left">Dashboard Geral</h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-5">
              <TotalConsumption totalKWh={totalKWh} costPerKWh={costPerKWh} />
            </div>

            <div className="bg-card rounded-lg shadow-lg p-4 transition-all hover:shadow-neon-sm min-h-[300px] lg:col-span-2">
              <h3 className="text-lg font-semibold mb-2 text-center">Consumo por Cômodo</h3>
              <ConsumptionChart rooms={rooms} />
            </div>
            <div className="bg-card rounded-lg shadow-lg p-4 transition-all hover:shadow-neon-sm min-h-[300px] lg:col-span-3">
              <h3 className="text-lg font-semibold mb-2 text-center">Top 5 Maiores Consumidores</h3>
              <TopConsumersChart rooms={rooms} costPerKWh={costPerKWh} />
            </div>
          </div>
        </section>

        <section id="rooms">
          <div className="flex items-center justify-between mb-6 mt-12">
            <h2 className="text-2xl font-bold tracking-tight">Cômodos</h2>
            <AddRoomDialog onAddRoom={handleAddRoom}>
              <Button className="transition-all hover:shadow-neon-sm">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Cômodo
              </Button>
            </AddRoomDialog>
          </div>

          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  costPerKWh={costPerKWh}
                  onAddAppliance={(appliance) => handleAddAppliance(room.id, appliance)}
                  onEditAppliance={(appliance) => handleEditAppliance(room.id, appliance)}
                  onDeleteAppliance={(applianceId) => handleDeleteAppliance(room.id, applianceId)}
                  onDeleteRoom={() => handleDeleteRoom(room.id)}
                  onEditRoom={(newName) => handleEditRoom(room.id, newName)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
              <h3 className="text-xl font-medium">Nenhum Cômodo Adicionado</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                Clique no botão abaixo para adicionar seu primeiro cômodo e começar a monitorar.
              </p>
              <AddRoomDialog onAddRoom={handleAddRoom}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Primeiro Cômodo
                </Button>
              </AddRoomDialog>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
