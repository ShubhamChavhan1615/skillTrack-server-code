import express from 'express';
import "dotenv/config";
import cors from "cors";
import db from './config/db';
import userRoutes from "./routes/userRoutes";
import courseRoutes from "./routes/courseRoutes";
import quizRoutes from "./routes/quizRoutes";
import paymentRoute from "./routes/create-payment-intent";
import googleMeetRoutes from "./routes/eventRoutes";
import adminRoutes from "./routes/adminRoutes";
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 3000;
const apiKeyAI = process.env.API_KEY_OF_AI || "";
const genAI = new GoogleGenerativeAI(apiKeyAI);
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//connect to DB
db();

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//routes
app.use("/", userRoutes);
app.use("/instructor", courseRoutes);
app.use("/quize", quizRoutes);
app.use("/payment", paymentRoute);
app.use("/google", googleMeetRoutes);
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
