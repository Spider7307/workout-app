import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import workoutRoutes from "./routes/workouts.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/workouts", workoutRoutes);

const port = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  })
  .catch((err) => console.error("Mongo connection failed:", err));