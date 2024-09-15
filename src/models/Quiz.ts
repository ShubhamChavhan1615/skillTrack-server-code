import { Schema, model, Document } from 'mongoose';

interface IQuiz extends Document {
  title: string;
  questions: { question: string, options: string[], correctAnswer: string }[];
  course: Schema.Types.ObjectId;
}

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }
  }],
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
});

const Quiz = model<IQuiz>('Quiz', QuizSchema);
export default Quiz;
