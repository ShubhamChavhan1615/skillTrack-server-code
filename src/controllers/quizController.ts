import { Request, Response } from "express";
import { CustomizedRequest } from "./userControllers";
import Quiz from "../models/Quiz";
import Course from "../models/Course";

// Handle creating a quiz
export const createQuize = async (req: CustomizedRequest, res: Response) => {
    try {
        const { title, questions } = req.body;
        const { courseId } = req.params;
        const findCourse = await Course.findById(courseId);

        if (!findCourse) {
            return res.status(404).json({ msg: "Course not found" });
        }
        const quiz = new Quiz({
            title,
            questions,
            course: courseId
        });

        await quiz.save();
        findCourse.quizzes.push(quiz.id);
        await findCourse.save();

        res.status(201).json({ msg: "Quiz created successfully", quiz });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

// Handle deleting a quiz
export const deleteQuiz = async (req: Request, res: Response) => {
    try {
        const { quizId } = req.params;

        // Find the quiz by ID
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ msg: "Quiz not found" });
        }

        // Find the associated course and remove the quiz reference
        const course = await Course.findById(quiz.course);
        if (course) {
            course.quizzes = course.quizzes.filter(id => id.toString() !== quizId);
            await course.save();
        }

        // Delete the quiz
        await Quiz.findByIdAndDelete(quizId);

        res.status(200).json({ msg: "Quiz deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}