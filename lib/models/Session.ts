import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  tableId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  status: string; // 'active', 'completed'
  orders: {
    _id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount?: number;
}

const SessionSchema: Schema = new Schema({
  tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date },
  status: { type: String, required: true, enum: ['active', 'completed'], default: 'active' },
  orders: [{
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 }
  }],
  totalAmount: { type: Number }
}, { timestamps: true });

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
