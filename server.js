import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from './routes/authRoute.js';
import profileRoutes from './routes/profileRoute.js';
import quizRoutes from './routes/quizRoutes.js'
dotenv.config();

connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/quizzess', quizRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("✅ Backend connected to MongoDB with CORS enabled!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
