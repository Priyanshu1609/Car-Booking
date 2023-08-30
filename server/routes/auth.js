const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/signup", async (req, res) => {
    try {
        //check existing user 
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) return res.status(400).json("Email already exists");

        const { fname, lname, email, password, } = req.body;
        //generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        //create new user
        const newUser = new User({
            fname,
            lname,
            email,
            password: hashedPassword,
        });

        //generate token
        const accessToken = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        //save user and respond
        const user = await newUser.save();
        res.status(200).json({ user, accessToken });
    } catch (err) {
        res.status(500).json(err)
    }
});

//LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json("user not found");
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) {
            return res.status(400).json("wrong password");
        }

        //generate token
        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({ user, accessToken });
    } catch (err) {
        res.status(500).json(err)
    }
});


//Authenticate
router.post("/authenticate", async (req, res) => {
    try {
        //check existing user 
        const existingUser = await User.findOne({ email: req.body.email });
        // console.log({existingUser})
        if (existingUser) {

            const validPassword = await bcrypt.compare(req.body.password, existingUser.password)
            if (!validPassword) {
                return res.status(400).json("wrong password");
            }

            //generate token
            const accessToken = jwt.sign(
                { id: existingUser._id, email: existingUser.email },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );
            console.log({ existingUser, accessToken })

            return res.status(200).json({ user: existingUser, accessToken });
        }
        else {

            //generate new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            //create new user
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
            });

            //generate token
            const accessToken = jwt.sign(
                { id: newUser._id, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            //save user and respond
            const user = await newUser.save();

            return res.status(200).json({ user, accessToken });
        }
    } catch (err) {
        return res.status(500).json(err)
    }
});


module.exports = router;