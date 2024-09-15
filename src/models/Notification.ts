import { Schema, model, Document } from 'mongoose';

interface INotification extends Document {
  user: Schema.Types.ObjectId;
  message: string;
  date: Date;
  read: boolean;
}

const NotificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const Notification = model<INotification>('Notification', NotificationSchema);
export default Notification;
