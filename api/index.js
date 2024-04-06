import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO);

const app = express();

app.use(express.json());

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});  

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);



