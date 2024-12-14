import express from "express";
import { changePassword, chatWithAI, editUser, getAllInstructors, getCoursesForStudent, getUser, googleSignUP, sendOtp, signUpUser, testRoute, userLogin } from "../controllers/userControllers";
import jwtAuthMiddleware from "../middlewares/jwtAuth";
import { getCourses, ratingToCourse } from "../controllers/courseController";
const router = express.Router();


//test route 
router.get("/", testRoute);

//valid email 
router.post("/api/valid/email", sendOtp);

//Route to SignUp user
router.post("/api/user/signUp", signUpUser);

//Route to Login user
router.post("/api/user/login", userLogin);

//Route to get user profile
router.get("/api/user/profile", jwtAuthMiddleware, getUser);

//Route to edit user profile 
router.put("/api/user/profile/update", jwtAuthMiddleware,editUser);

//Route to get only buy courses
router.get("/api/student/courses", jwtAuthMiddleware, getCoursesForStudent);

//Route to get all courses
router.get("/api/all/courses", getCourses);

//Route to get all users
router.get("/api/all/instructors", getAllInstructors);

//Route to chat user with AI
router.post("/api/ai/chat", chatWithAI);

//Route to handle change password 
router.put("/api/change/password/:email", changePassword);

//Route to rating course 
router.post("/api/course/:courseId/rate", jwtAuthMiddleware, ratingToCourse);

//test google signup login 
router.post('/api/google/signup', googleSignUP);

export default router;
