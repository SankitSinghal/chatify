import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { ENV }  from "../lib/env.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import { maxSatisfying } from "semver"; 
import cloudinary from "../lib/cloudinary.js";

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

export const login  = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email })
        if(!user) return res.status(400).json({ message: "Invalid credentials" });
        // never tell the client which one is inccorrect: password or email

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        generateToken (user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.log("Error in login controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = (_, res) => {
    res.cookie("jwt", "", {maxAge: 0 })
    res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        if (!profilePic) return res.status(400).json({ message: "Profile picture is required" });

        const userId = req.user._id; 

        const uploadedResponse = await cloudinary.uploader.upload(profilePic) 
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { profilePic: uploadedResponse.secure_url }, 
            { new: true }
        );

        res.status(200).json(updatedUser);      
            
    } catch (error) {
        console.log("Error in updateProfile:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
};
