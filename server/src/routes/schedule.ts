import { Router } from "express";
import ScheduledWorkout from "../models/ScheduledWorkout.js";
import Workout from "../models/Workout.js";

const router = Router();

// GET /api/schedule?from=2026-10-01&to=2026-10-31
router.get("/", async (req, res) => {
  const { from, to } = req.query;
  const filter: Record<string, unknown> = { profileId: res.locals.profileId };
  if (typeof from === "string" && typeof to === "string") {
    filter.date = { $gte: from, $lte: to };
  }
  const entries = await ScheduledWorkout.find(filter)
    .sort({ date: 1, startTime: 1 })
    .populate("workoutId", "name exercises");
  res.json(entries);
});

router.post("/", async (req, res) => {
  const profileId = res.locals.profileId;
  try {
    const { date, workoutId, startTime, endTime } = req.body;
    if (!(await Workout.exists({ _id: workoutId, profileId }))) {
      return res.status(400).json({ error: "Unknown workout" });
    }
    const entry = await ScheduledWorkout.create({ date, workoutId, startTime, endTime, profileId });
    res.status(201).json(entry);
  } catch {
    res.status(400).json({ error: "Invalid schedule entry" });
  }
});

router.delete("/:id", async (req, res) => {
  await ScheduledWorkout.findOneAndDelete({ _id: req.params.id, profileId: res.locals.profileId });
  res.status(204).end();
});

export default router;