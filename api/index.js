import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO);

const app = express();
console.log("point 1");

app.use("/api/user", userRoutes);

console.log("point 2");



app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
