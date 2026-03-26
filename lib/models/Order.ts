import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  packageName: {
    type: String,
    required: true,
  },
  durationMonths: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['qr', 'ewallet', 'card', 'cash'],
    default: 'qr',
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
