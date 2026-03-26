export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  time: string;
  tableType: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

// In-memory store for development
export const reservations: Reservation[] = [
  {
    id: '1',
    customerName: 'Nguyễn Văn A',
    phone: '0901234567',
    time: '19:30 - 04/03/2026',
    tableType: 'Bàn VIP',
    status: 'confirmed',
    createdAt: new Date(),
  }
];

export function addReservation(data: Omit<Reservation, 'id' | 'status' | 'createdAt'>) {
  const newReservation: Reservation = {
    ...data,
    id: Math.random().toString(36).substring(7),
    status: 'pending',
    createdAt: new Date(),
  };
  reservations.push(newReservation);
  return newReservation;
}
