import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  sessionId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  tableName: string;
  customerName?: string;
  customerId?: mongoose.Types.ObjectId;
  totalAmount: number;
  paymentMethod: string; // 'cash', 'qr', 'card'
  status: string; // 'success', 'refunded'
  items: {
    name: string;
    price: number;
    quantity: number;
    type: string; // 'table_time', 'food', 'service'
  }[];
}

const TransactionSchema: Schema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  tableName: { type: String, required: true },
  customerName: { type: String, default: 'Khách lẻ' },
  customerId: { type: Schema.Types.ObjectId, ref: 'User' },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true, enum: ['cash', 'qr', 'card', 'wallet'] },
  pointsEarned: { type: Number, default: 0 },
  status: { type: String, required: true, enum: ['success', 'refunded'], default: 'success' },
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    type: { type: String, required: true, enum: ['table_time', 'food', 'service'] }
  }]
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
