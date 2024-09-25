import express from "express";
import { testRoute } from "../controllers/userControllers";
import { createCourse, deleteCourse, editCourse, getCoursesForInstructor, getInstructorCourses } from "../controllers/courseController";
import jwtAuthMiddleware from "../middlewares/jwtAuth";
import multer from "multer";

const router = express.Router();

// Multer setup with memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

//test route 
router.get("/", testRoute);

//route to create new course 
router.post("/api/create/course", jwtAuthMiddleware, upload.single("thumbnail"), createCourse);

//route to edit course 
router.put("/api/edit/course/:courseId", jwtAuthMiddleware, upload.single("thumbnail"), editCourse);

//route to delete course also from users
router.delete("/api/delete/course/:courseId", jwtAuthMiddleware, deleteCourse);

//route to get course
router.get("/api/get/course", jwtAuthMiddleware, getCoursesForInstructor);

//Route to get only particuler instructor courses
router.get("/api/get/instructor/courses", jwtAuthMiddleware, getInstructorCourses);


export default router;