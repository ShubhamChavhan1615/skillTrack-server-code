import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { generateToken } from "../middlewares/jwtToken";
import Course from "../models/Course";
import nodeMailer from "nodemailer";
import { model } from "../app";

// Extend the Request interface and add custom properties
export interface CustomizedRequest extends Request {
    user?: {
        id: string;
    };
}

//test 
export const testRoute = (req: Request, res: Response) => {
    try {
        res.status(200).json({ msg: "hello world" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "internal server error" });
    }
}

//handle send otp
export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ msg: "Email is required" });

        const transport = nodeMailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MY_EMAIL,
                pass: process.env.MY_PASS
            }
        });

        const otp = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit OTP
        const subject = "Email Validation for SkillTrack";
        const message = `Your OTP for email verification is: ${otp}`;

        const mailOptions = {
            from: process.env.MY_EMAIL,
            to: email,
            subject: subject,
            text: message
        };

        transport.sendMail(mailOptions, (err, info) => {
            if (err) return res.status(400).json({ msg: "Mail sending failed." });

            return res.status(200).json({ msg: "Mail sent successfully", otp });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}

//handle user SignUp
export const signUpUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, courses } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "The fields name, email, and password are required." });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists with this email." });
        }
        const hashPassword = await bcrypt.hash(password, 11);
        const user = new User({
            name,
            email,
            password: hashPassword,
            role: role || 'student',
            courses: courses || [],
        });

        await user.save();
        const token = generateToken(user.id);
        res.cookie("authToken", token, { httpOnly: true });
        res.status(201).json({ msg: "User registered successfully.", user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}

//handle user login
export const userLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required." });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ msg: "Email or password are incorrect." });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Email or password are incorrect." });
        }

        const token = generateToken(existingUser.id);
        res.cookie("authToken", token, { httpOnly: true });
        res.status(200).json({ msg: "User login successfully.", user: existingUser, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}



export const getUser = async (req: CustomizedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId).populate('courses', 'title');
        if (!user) return res.status(404).json({ msg: "User not found" });

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}


//handle edit user profile 
export const editUser = async (req: CustomizedRequest, res: Response) => {
    try {
        const dataToUpdate = { ...req.body };
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({ msg: "User not authenticated." });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found." });
        }

        if (dataToUpdate.password) {
            const hashedPassword = await bcrypt.hash(dataToUpdate.password, 11);
            dataToUpdate.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, dataToUpdate, { new: true });
        res.status(200).json({ msg: "User updated successfully.", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}

// Handle getting courses for a student
export const getCoursesForStudent = async (req: CustomizedRequest, res: Response) => {
    try {
        const studentId = req.user?.id;

        const courses = await Course.find({ students: studentId });

        res.status(200).json({ courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

export const getAllInstructors = async (req: Request, res: Response) => {
    try {
        const instructors = await User.find({ role: 'instructor' }).populate('courses');

        if (instructors.length === 0) {
            return res.status(404).json({ msg: "No instructors found" });
        }

        res.status(200).json({ instructors });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

export const chatWithAI = async (req: Request, res: Response) => {
    try {
        // Extract the prompt from the request body
        const { prompt } = req.body;
        const result = await model.generateContent(prompt);
        res.json({ response: result.response.text() });

    } catch (error) {
        // Handle any errors
        console.error("Error handling request:", error);
        res.status(500).json({ response: "Sorry, something went wrong on the server." });
    }
}