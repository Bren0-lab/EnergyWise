'use client';

import type { Room } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect } from 'react';

// Dados iniciais
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

// Tipos para o contexto
interface AppState {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  costPerKWh: number;
  setCostPerKWh: React.Dispatch<React.SetStateAction<number>>;
  isClient: boolean;
}

// Criação do contexto
const AppStateContext = createContext<AppState | undefined>(undefined);

// Provedor do contexto
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [costPerKWh, setCostPerKWh] = useState<number>(0.75);
  const [isClient, setIsClient] = useState(false);

  // Efeito para carregar dados do localStorage (só no cliente)
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

  // Efeito para salvar dados no localStorage sempre que mudarem
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

  const value = {
    rooms,
    setRooms,
    costPerKWh,
    setCostPerKWh,
    isClient,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAppState = (): AppState => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
