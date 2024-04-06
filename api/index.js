import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO);

const app = express();

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
