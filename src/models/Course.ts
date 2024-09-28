import mongoose, { Document, Schema } from 'mongoose';

interface ICourse extends Document {
    title: string;
    description: string;
    thumbnail: string;
    instructor: mongoose.Schema.Types.ObjectId;
    modules: mongoose.Schema.Types.ObjectId[];
    quizzes: mongoose.Schema.Types.ObjectId[];
    price: number;
    enrollments: mongoose.Schema.Types.ObjectId[];
    ratings: { userId: any; value: number }[];
    category: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        thumbnail: {
            type: String
        },
        instructor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        modules: [{
            type: Schema.Types.ObjectId,
            ref: 'Module',
            default: [],
        }],
        quizzes: [{
            type: Schema.Types.ObjectId,
            ref: 'Quiz',
            default: [],
        }],
        assignments: [{
            type: Schema.Types.ObjectId,
            ref: 'Assignment',
            default: [],
        }],
        price: {
            type: Number,
            default: 0,
        },
        enrollments: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: [],
        }],
        category: {
            type: String,
            required: true,
        },
        tags: [{
            type: String,
            default: [],
        }],
        ratings: [{
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            value: { type: Number, min: 1, max: 5 },
            default: [],
        }]
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const Course = mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
