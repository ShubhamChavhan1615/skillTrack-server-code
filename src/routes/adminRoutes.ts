import express from "express";
import jwtAuthMiddleware from "../middlewares/jwtAuth";
import { deleteUser, getAllUsers } from "../controllers/adminController";

const router = express.Router();


//Route to show all users 
router.route("/api/view/all/users").get(jwtAuthMiddleware, getAllUsers);

//Route to delete user 
router.route("/api/delete/user/:userId").delete(deleteUser);

export default router;