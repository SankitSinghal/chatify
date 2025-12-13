import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
    try {
        const { Mongo_URI } = ENV;
        if(!Mongo_URI) throw new Error("MONGO_URI is not defined in environment variables");
        
        const conn = await mongoose.connect(ENV.Mongo_URI) 
        console.log("MongoDB connected successfully: ", conn.connection.host);
    }  catch (error) {
        console.error("MongoDB connection failed: ", error);
        process.exit(1); // 1 status code means fail, 0 means success
    }
};