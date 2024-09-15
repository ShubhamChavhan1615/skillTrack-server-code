import express from "express";
import { testRoute } from "../controllers/userControllers";
import { createQuize, deleteQuiz } from "../controllers/quizController";
import jwtAuthMiddleware from "../middlewares/jwtAuth";

const router = express.Router();


//test route 
router.get("/", testRoute);

//route to create quizes
router.post("/api/create/quiz/:courseId", jwtAuthMiddleware, createQuize);

//route to delete quizes
router.delete("/api/delete/quiz/:quizId", jwtAuthMiddleware, deleteQuiz);


export default router;