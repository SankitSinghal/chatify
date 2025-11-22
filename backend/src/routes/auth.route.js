import express from 'express';
import { signup } from '../controllers/auth.controller.js'; 

const router = express.Router();

router.post("/signup", signup);


router.get("/login", (req, res) => {
    res.send("Login API");
});


router.get("/signout", (req, res) => {
    res.send("Signout API");
});

export default router;