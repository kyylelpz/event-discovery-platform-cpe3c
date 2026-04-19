import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";

dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// ─── Health Check ─────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running ✅" });
});

// ─── MongoDB ──────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
