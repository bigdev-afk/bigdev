import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from './routes/authRoute.js';
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Enable CORS
app.use(cors()); // ✅ Allows all origins by default

app.use('/api/auth', authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("✅ Backend connected to MongoDB with CORS enabled!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
