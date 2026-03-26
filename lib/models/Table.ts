import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  name: string;
  type: string; // 'Lỗ (Pool)', 'Phăng (Carom)', '3 Băng'
  pricePerHour: number;
  status: string; // 'empty', 'playing', 'reserved', 'maintenance'
}

const TableSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['empty', 'playing', 'reserved', 'maintenance'],
    default: 'empty'
  },
}, { timestamps: true });

export default mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema);
