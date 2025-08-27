import type { Appliance, Room } from './types';

const AVG_DAYS_IN_MONTH = 30.44;
const DAYS_IN_YEAR = 365.25;

export function calculateApplianceKWh(power: number, dailyUsageHours: number) {
  const dailyKWh = (power * dailyUsageHours) / 1000;
  const monthlyKWh = dailyKWh * AVG_DAYS_IN_MONTH;
  const yearlyKWh = dailyKWh * DAYS_IN_YEAR;
  return { dailyKWh, monthlyKWh, yearlyKWh };
}

export function calculateRoomKWh(appliances: Appliance[]) {
  return appliances.reduce(
    (acc, appliance) => {
      const { dailyKWh, monthlyKWh, yearlyKWh } = calculateApplianceKWh(
        appliance.power,
        appliance.dailyUsageHours
      );
      acc.dailyKWh += dailyKWh;
      acc.monthlyKWh += monthlyKWh;
      acc.yearlyKWh += yearlyKWh;
      return acc;
    },
    { dailyKWh: 0, monthlyKWh: 0, yearlyKWh: 0 }
  );
}

export function calculateTotalKWh(rooms: Room[]) {
    return rooms.reduce(
      (acc, room) => {
        const roomTotals = calculateRoomKWh(room.appliances);
        acc.dailyKWh += roomTotals.dailyKWh;
        acc.monthlyKWh += roomTotals.monthlyKWh;
        acc.yearlyKWh += roomTotals.yearlyKWh;
        return acc;
      },
      { dailyKWh: 0, monthlyKWh: 0, yearlyKWh: 0 }
    );
  }

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatKWh(kwh: number) {
    return `${kwh.toFixed(2)} kWh`;
}
