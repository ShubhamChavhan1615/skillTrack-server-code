import { Schema, model, Document } from 'mongoose';

interface IPayment extends Document {
  user: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  status: 'pending' | 'completed' | 'failed';
}

const PaymentSchema = new Schema<IPayment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
});

const Payment = model<IPayment>('Payment', PaymentSchema);
export default Payment;
