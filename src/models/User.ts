import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor' | 'admin';
  courses: Schema.Types.ObjectId[];
  instructors: [{
    email: string;
    payedAmount: number;
  }];
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course', unique: true }],
  instructors: [{ email: String, payedAmount: Number }]
});

const User = model<IUser>('User', UserSchema);
export default User;
