import { Request, Response } from "express";
import Course from "../models/Course";
import User from "../models/User";
import { CustomizedRequest } from "./userControllers";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});

//handle create new course
export const createCourse = async (req: CustomizedRequest, res: Response) => {
    try {
        const { title, description, category, price, tags } = req.body;
        const userId = req.user?.id;

        if (!title || !description || !category || !req.file) {
            console.error("Missing required fields");
            return res.status(400).json({ msg: "Title, description, category, and thumbnail are required" });
        }

        const result = await cloudinary.uploader.upload_stream((error, result) => {
            if (error) {
                console.error("Error uploading to Cloudinary:", error);
                return res.status(500).json({ msg: "Error uploading thumbnail" });
            }

            const newCourse = new Course({
                title,
                description,
                instructor: userId,
                category,
                price: price || 0,
                tags: tags ? JSON.parse(tags) : [],
                thumbnail: result?.secure_url,
            });

            User.findById(userId).then(user => {
                if (user) {
                    user.courses.push(newCourse.id);
                    return user.save();
                }
            }).then(() => {
                return newCourse.save();
            }).then(savedCourse => {
                res.status(201).json({ msg: "Course created successfully", course: savedCourse });
            }).catch(error => {
                console.error("Error saving course or user:", error);
                res.status(500).json({ msg: "Internal server error" });
            });
        }).end(req.file.buffer);

    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
};


//handle edit course 
interface CloudinaryUploadResult {
    secure_url: string;
}
export const editCourse = async (req: CustomizedRequest, res: Response) => {
    try {
        const { title, description, category, price, tags } = req.body;
        const { courseId } = req.params;
        const userId = req.user?.id;

        // Validate required fields
        if (!title || !description || !category) {
            return res.status(400).json({ msg: "Title, description, and category are required" });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ msg: "Course not found" });
        }

        // Check if the user is the instructor of the course
        if (course.instructor.toString() !== userId) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        // Update course details
        course.title = title;
        course.description = description;
        course.category = category;
        course.price = price || 0;
        if (tags) {
            course.tags = JSON.parse(tags);
        }

        // Upload thumbnail if provided
        if (req.file?.buffer) { // Use optional chaining to safely access req.file.buffer
            const result: CloudinaryUploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream((error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result as CloudinaryUploadResult);
                }).end(req.file?.buffer);
            });

            // Ensure result contains the secure_url
            if (result.secure_url) {
                course.thumbnail = result.secure_url; // Store the Cloudinary URL
            }
        }

        const updatedCourse = await course.save();

        res.status(200).json({ msg: "Course updated successfully", course: updatedCourse });
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

//handle delete course 
export const deleteCourse = async (req: CustomizedRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const deletedCourse = await Course.findByIdAndDelete(courseId);
        if (!deletedCourse) {
            return res.status(404).json({ msg: "Course not found" });
        }

        await User.updateMany(
            { courses: courseId },
            { $pull: { courses: courseId } }
        );

        res.status(200).json({ msg: "Course deleted successfully and removed from all users" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}

// Handle getting courses for an instructor
export const getCoursesForInstructor = async (req: CustomizedRequest, res: Response) => {
    try {
        const instructorId = req.user?.id;

        const courses = await Course.find({ instructor: instructorId });

        res.status(200).json({ courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

//handle to get all courses
export const getCourses = async (req: Request, res: Response) => {
    try {
        // Fetch courses and populate the instructor's name and other course details
        const courses = await Course.find().populate({
            path: 'instructor',
            select: 'name' 
        }).populate({
            path: 'quizzes', // Assuming 'quizzes' is an array of quiz IDs
            select: 'title questions',
        });

        if (!courses || courses.length === 0) {
            return res.status(404).json({ msg: "No courses found" });
        }

        // Send all course details along with the instructor's name
        res.status(200).json({ courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

//handle rating course 
export const ratingToCourse = async (req: CustomizedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const courseId = req.params.courseId;

        if (!userId) {
            return res.status(400).json({ msg: "User ID is missing" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ msg: "No course found" });
        }

        const userObjectId = new mongoose.Schema.Types.ObjectId(userId);

        // Prevent duplicate ratings
        if (course.rating.includes(userObjectId)) {
            return res.status(400).json({ msg: "User has already rated this course" });
        }

        course.rating.push(userObjectId);
        await course.save(); // Save the updated course document

        res.status(200).json({ msg: "Course rating was successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}