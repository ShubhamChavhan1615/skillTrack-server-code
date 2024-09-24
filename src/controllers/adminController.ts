import { Request, Response } from "express";
import { CustomizedRequest } from "./userControllers";
import User from "../models/User";

export const getAllUsers = async (req: CustomizedRequest, res: Response) => {
    try {
        const users = await User.find({ role: { $in: ['instructor', 'student'] } });

        if (!users || users.length === 0) {
            return res.status(404).json({ msg: "No users found" });
        }

        res.status(200).json({ users });
    } catch (error) {
        console.error("Internal server error:", error); // Detailed error log for debugging
        res.status(500).json({ msg: "Internal server error" });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId: string = req.params.userId; 
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) res.status(404).json({ msg: "No user found" });

        res.status(200).json({ msg: "User deleted successfully" });
    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
};
