import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import workoutRoutes from "./routes/workouts.js";
import exerciseRoutes from "./routes/exercises.js";
import scheduleRoutes from "./routes/schedule.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/workouts", workoutRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/schedule", scheduleRoutes);

const port = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  })
  .catch((err) => console.error("Mongo connection failed:", err));