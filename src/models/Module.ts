import { Schema, model, Document } from 'mongoose';

interface IModule extends Document {
  title: string;
  content: string;
  course: Schema.Types.ObjectId;
}

const ModuleSchema = new Schema<IModule>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
});

const Module = model<IModule>('Module', ModuleSchema);
export default Module;
