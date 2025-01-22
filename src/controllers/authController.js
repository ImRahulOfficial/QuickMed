const User = require("../models/User.js")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../services/emailService");
const { request } = require("express");
/* 
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        // console.log(req.body);

        const user = new User(req.body);
        await user.save();

        // // Check if user exists
        // const existingUser = await User.findOne({ email });
        // if (existingUser) return res.status(400).json({ message: "Email already exists" });

        // // Hash password
        // const hashedPassword = await bcrypt.hash(password);
        // console.log(hashedPassword);

        // // Create user
        // const user = await User.create({
        //     name,
        //     email,
        //     password: hashedPassword,
        //     phone
        // });

        // console.log(user);

        //Send email confirmation
        // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        //const link = `${process.env.CLIENT_URL}/verify/${token}`;
        //await sendEmail(email, "Verify Your Email", `Click here to verify: ${link}`);



        
        res.status(201).json({ message: "Registration successful. Verify your email." });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};
 */

const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validation
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            isVerified: false,
        });

        // Save the user to the database
        await user.save();

        // Generate a verification token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Generate a verification link
        const verificationLink = `${process.env.CLIENT_URL}/verify/${token}`;

        // Send verification email
        await sendEmail(
            email,
            "Verify Your Email",
            `<p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>This link will expire in 1 hour.</p>`
        );

        res.status(201).json({
            message: "Registration successful. Please verify your email.",
        });
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(500).json({
            message: "Error registering user",
            error: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        // Check if verified
        if (!user.isVerified) return res.status(403).json({ message: "Please verify your email" });

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", token, { httpOnly: true });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(400).json({ message: "Invalid token" });

        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error verifying email", error });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
        await sendEmail(email, "Reset Password", `Click here to reset: ${link}`);

        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        res.status(500).json({ message: "Error sending reset email", error });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(400).json({ message: "Invalid token" });

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password", error });
    }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword };
