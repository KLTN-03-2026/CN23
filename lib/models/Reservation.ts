import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  customerName: string;
  phone: string;
  time: string;
  tableType: string;
  tableId?: string;
  status: string; // 'pending', 'confirmed', 'cancelled'
}

const ReservationSchema: Schema = new Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  time: { type: String, required: true },
  tableType: { type: String, required: true },
  tableId: { type: String },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
}, { timestamps: true });

export default mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);
