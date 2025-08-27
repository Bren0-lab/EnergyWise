export interface Appliance {
  id: string;
  name: string;
  power: number; // in Watts
  dailyUsageHours: number;
}

export interface Room {
  id: string;
  name: string;
  appliances: Appliance[];
}
