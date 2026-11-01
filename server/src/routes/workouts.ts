import { Router } from "express";
import Workout from "../models/Workout.js";
import ScheduledWorkout from "../models/ScheduledWorkout.js";

const router = Router();

router.get("/", async (_req, res) => {
  const profileId = res.locals.profileId;
  res.json(await Workout.find({ profileId }).sort({ createdAt: -1 }));
});

router.get("/:id", async (req, res) => {
  const workout = await Workout.findOne({ _id: req.params.id, profileId: res.locals.profileId });
  if (!workout) return res.status(404).json({ error: "Not found" });
  res.json(workout);
});

router.post("/", async (req, res) => {
  try {
    const { name, exercises } = req.body;
    const workout = await Workout.create({ name, exercises, profileId: res.locals.profileId });
    res.status(201).json(workout);
  } catch {
    res.status(400).json({ error: "Invalid workout" });
  }
});

router.put("/:id", async (req, res) => {
  const { name, exercises } = req.body;
  const workout = await Workout.findOneAndUpdate(
    { _id: req.params.id, profileId: res.locals.profileId },
    { name, exercises },
    { new: true }
  );
  if (!workout) return res.status(404).json({ error: "Not found" });
  res.json(workout);
});

router.delete("/:id", async (req, res) => {
  const profileId = res.locals.profileId;
  const deleted = await Workout.findOneAndDelete({ _id: req.params.id, profileId });
  if (deleted) await ScheduledWorkout.deleteMany({ workoutId: deleted._id, profileId });
  res.status(204).end();
});

export default router;