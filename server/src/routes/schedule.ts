import { Router } from "express";
import ScheduledWorkout from "../models/ScheduledWorkout.js";

const router = Router();

// GET /api/schedule?from=2026-10-01&to=2026-10-31
router.get("/", async (req, res) => {
  const { from, to } = req.query;
  const filter: Record<string, unknown> = {};
  if (typeof from === "string" && typeof to === "string") {
    filter.date = { $gte: from, $lte: to };
  }
  const entries = await ScheduledWorkout.find(filter)
    .sort({ date: 1, startTime: 1 })
    .populate("workoutId", "name");
  res.json(entries);
});

router.post("/", async (req, res) => {
  try {
    const { date, workoutId, startTime, endTime } = req.body;
    const entry = await ScheduledWorkout.create({ date, workoutId, startTime, endTime });
    res.status(201).json(entry);
  } catch {
    res.status(400).json({ error: "Invalid schedule entry" });
  }
});

router.delete("/:id", async (req, res) => {
  await ScheduledWorkout.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;