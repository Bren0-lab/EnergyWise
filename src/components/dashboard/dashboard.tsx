'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Room, Appliance } from '@/lib/types';
import { DashboardHeader } from './header';
import { AddRoomDialog } from './add-room-dialog';
import RoomCard from './room-card';
import { calculateTotalKWh, formatCurrency, formatKWh } from '@/lib/helpers';
import ConsumptionChart from './consumption-chart';
import TopConsumersChart from './top-consumers-chart';
import TotalConsumption from './total-consumption';

const initialRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Sala de Estar',
    appliances: [
      { id: 'app-1', name: 'TV 60"', power: 150, dailyUsageHours: 5 },
      { id: 'app-2', name: 'Videogame', power: 200, dailyUsageHours: 2 },
      { id: 'app-3', name: 'Ar Condicionado', power: 1500, dailyUsageHours: 8 },
    ],
  },
  {
    id: 'room-2',
    name: 'Cozinha',
    appliances: [
      { id: 'app-4', name: 'Geladeira', power: 100, dailyUsageHours: 24 },
      { id: 'app-5', name: 'Micro-ondas', power: 1200, dailyUsageHours: 0.5 },
    ],
  },
];

const LOCAL_STORAGE_KEY = 'energywise_data';

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [costPerKWh, setCostPerKWh] = useState<number>(0.75);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setRooms(parsedData.rooms || initialRooms);
        setCostPerKWh(parsedData.costPerKWh || 0.75);
      } else {
        setRooms(initialRooms);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      setRooms(initialRooms);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const dataToSave = JSON.stringify({ rooms, costPerKWh });
        localStorage.setItem(LOCAL_STORAGE_KEY, dataToSave);
      } catch (error) {
        console.error('Failed to save data to localStorage', error);
      }
    }
  }, [rooms, costPerKWh, isClient]);

  if (!isClient) {
    return null; // ou um spinner/skeleton de loading
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
