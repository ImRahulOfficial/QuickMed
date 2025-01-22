const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRoutes = require("./src/routers/authRoutes");
const cors = require("cors");

dotenv.config();

const app = express();


// Use CORS middleware
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));


// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

// app.post('/api/auth/register', (req, res) => {
//     // Your registration logic here
//     res.send({ message: 'User registered successfully!' });
// });

// Database and server start
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server running on http://localhost:${process.env.PORT}`);
        });
    }).catch((err) => console.log(err));


