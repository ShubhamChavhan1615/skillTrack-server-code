import mongoose from "mongoose";

const dbUrl = process.env.DB_URL  || '';

const db = async (): Promise<void> => {
    try {
        await mongoose.connect(dbUrl);
        console.log("connected to MongoDB");
    } catch (error) {
        console.log("error in DB ", error);
        
    }
}
export default db;