'use client';

import { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Plus, Trash2, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DashboardHeader } from '@/components/dashboard/header';
import { useAppState } from '@/context/app-state-provider';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
import { Input } from '@/components/ui/input';

const GRID_SIZE = 20;

export default function FloorplanPage() {
  const { costPerKWh, setCostPerKWh } = useAppState();
  const [rooms, setRooms] = useState<{ id: string; name: string; x: number; y: number; width: number; height: number }[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const { toast } = useToast();
  const floorplanRef = useRef<HTMLDivElement>(null);

  const addRoom = () => {
    const newRoom = {
      id: `room-${Date.now()}`,
      name: 'Novo Cômodo',
      x: GRID_SIZE * 2,
      y: GRID_SIZE * 2,
      width: GRID_SIZE * 8,
      height: GRID_SIZE * 6,
    };
    setRooms([...rooms, newRoom]);
    toast({ title: 'Cômodo adicionado!', description: 'Arraste e redimensione como quiser.' });
  };

  const deleteRoom = () => {
    if (selectedRoomId) {
      setRooms(rooms.filter(room => room.id !== selectedRoomId));
      setSelectedRoomId(null);
      toast({ title: 'Cômodo removido.' });
    }
  };
  
  const handleDoubleClick = (room: typeof rooms[0]) => {
    setEditingRoomId(room.id);
    setEditingName(room.name);
  }
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  }
  
  const handleNameSubmit = (e: React.FormEvent, roomId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRooms(rooms.map(room => room.id === roomId ? { ...room, name: editingName } : room));
    setEditingRoomId(null);
    setEditingName('');
  }

  const exportToPdf = () => {
    if (floorplanRef.current) {
        html2canvas(floorplanRef.current, {
            backgroundColor: '#000000',
            useCORS: true,
            onclone: (document) => {
                const grid = document.getElementById('floorplan-grid');
                if(grid) grid.style.display = 'none';
            }
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save("planta-baixa.pdf");
        });
        toast({ title: 'Exportando PDF...' });
    }
  };

  return (
    <>
      <DashboardHeader costPerKWh={costPerKWh} setCostPerKWh={setCostPerKWh} />
      <div className="relative min-h-[calc(100vh-4rem)] bg-black text-white">
        <div id="floorplan-grid" ref={floorplanRef} className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,hsl(var(--primary)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.1)_1px,transparent_1px)] bg-[size:20px_20px]">
          {rooms.map((room) => (
            <Rnd
              key={room.id}
              size={{ width: room.width, height: room.height }}
              position={{ x: room.x, y: room.y }}
              onDragStart={() => setSelectedRoomId(room.id)}
              onDragStop={(e, d) => {
                setRooms(rooms.map(r => r.id === room.id ? { ...r, x: d.x, y: d.y } : r));
              }}
              onResizeStart={() => setSelectedRoomId(room.id)}
              onResizeStop={(e, direction, ref, delta, position) => {
                setRooms(rooms.map(r => r.id === room.id ? {
                  ...r,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  ...position,
                } : r));
              }}
              className={`flex items-center justify-center border-2 bg-card/80 backdrop-blur-sm transition-all duration-200 ${selectedRoomId === room.id ? 'border-primary shadow-neon-sm z-10' : 'border-accent/50'}`}
              onMouseDownCapture={() => setSelectedRoomId(room.id)}
              onDoubleClickCapture={() => handleDoubleClick(room)}
              dragGrid={[GRID_SIZE, GRID_SIZE]}
              resizeGrid={[GRID_SIZE, GRID_SIZE]}
              bounds="parent"
            >
              <div className="flex flex-col items-center justify-center text-center p-2">
                {editingRoomId === room.id ? (
                  <form onSubmit={(e) => handleNameSubmit(e, room.id)}>
                    <Input 
                      type="text" 
                      value={editingName} 
                      onChange={handleNameChange} 
                      onBlur={(e) => handleNameSubmit(e, room.id)}
                      className="w-full text-center bg-transparent border-primary/50"
                      autoFocus
                    />
                  </form>
                ) : (
                  <span className="font-semibold text-primary" style={{ textShadow: '0 0 5px hsl(var(--primary))' }}>{room.name}</span>
                )}
                <span className="text-xs text-muted-foreground mt-1">
                  {((room.width * room.height) / (GRID_SIZE * GRID_SIZE)).toFixed(1)} m²
                </span>
              </div>
            </Rnd>
          ))}
        </div>
        
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <Button onClick={addRoom} className="transition-all hover:shadow-neon-sm">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Cômodo
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={!selectedRoomId}>
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso excluirá o cômodo selecionado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteRoom} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
          
          <Button onClick={exportToPdf} variant="secondary">
            <Download className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>
    </>
  );
}
