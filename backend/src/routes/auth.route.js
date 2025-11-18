import express from 'express';

const router = express.Router();

router.get("/signup", (req, res) => {
    res.send("Signup API")
});


router.get("/login", (req, res) => {
    res.send("Login API")
});


router.get("/signout", (req, res) => {
    res.send("Signout API")
});

export default router;