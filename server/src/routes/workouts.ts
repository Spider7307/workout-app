import { Router } from "express";
import Workout from "../models/Workout.js";
import ScheduledWorkout from "../models/ScheduledWorkout.js";

const router = Router();

router.get("/", async (_req, res) => {
  const workouts = await Workout.find().sort({ createdAt: -1 });
  res.json(workouts);
});

router.get("/:id", async (req, res) => {
  const workout = await Workout.findById(req.params.id);
  if (!workout) return res.status(404).json({ error: "Not found" });
  res.json(workout);
});

router.post("/", async (req, res) => {
  const workout = await Workout.create(req.body);
  res.status(201).json(workout);
});

router.put("/:id", async (req, res) => {
  const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!workout) return res.status(404).json({ error: "Not found" });
  res.json(workout);
});

router.delete("/:id", async (req, res) => {
  await Workout.findByIdAndDelete(req.params.id);
  await ScheduledWorkout.deleteMany({ workoutId: req.params.id });
  res.status(204).end();
});

export default router;