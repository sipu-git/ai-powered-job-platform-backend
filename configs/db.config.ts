import mongoose from 'mongoose'
import dotenv from 'dotenv';

dotenv.config();
export const connectDB = async():Promise<void>=>{
 try{
    await mongoose.connect(process.env.MONGO_URL as string)
    console.log("Database connected successfully");
 }
 catch{
    console.error("Database connection failed!");
    process.exit(1)
 }
}

