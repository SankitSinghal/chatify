import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generaeToken.js";
import { ENV }  from "../lib/env.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;


    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        // check if email exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        //persist user first, then issue auth cookie
        const savedUser = await newUser.save();
        generateToken(savedUser._id, res);

        
        // Send welcome email
        try {
            await sendWelcomeEmail(email, fullName, ENV.CLIENT_URL);
        } catch (error) {
            console.log("Error sending welcome email 123:", error);
        }

        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        });

    } catch (error) {
        console.log("Error in signup controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

