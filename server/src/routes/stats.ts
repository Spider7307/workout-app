import { Router } from "express";
import mongoose from "mongoose";
import Session from "../models/Session.js";
import ScheduledWorkout from "../models/ScheduledWorkout.js";

const router = Router();

// Date math in UTC so daylight saving can't skip or repeat a day
const prevDay = (key: string) =>
  new Date(new Date(`${key}T00:00:00Z`).getTime() - 86_400_000).toISOString().slice(0, 10);

// GET /api/stats?today=2026-10-31
// The client sends its own local date, since the server may be in another timezone
router.get("/", async (req, res) => {
  const today = String(req.query.today ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) {
    return res.status(400).json({ error: "today must be YYYY-MM-DD" });
  }

  // Set by the requireProfile middleware
  const profileId = res.locals.profileId;

  // Streak
  const dates = new Set<string>(await Session.distinct("date", { profileId }));
  const recordedToday = dates.has(today);
  let cursor = recordedToday ? today : prevDay(today);
  let streak = 0;
  while (dates.has(cursor)) {
    streak++;
    cursor = prevDay(cursor);
  }

  // Exercises in today's scheduled workouts
  const scheduled = await ScheduledWorkout.find({ date: today, profileId }).populate(
    "workoutId",
    "exercises"
  );
  const names = new Set<string>();
  for (const entry of scheduled) {
    const workout = entry.workoutId as unknown as {
      exercises: { exerciseName: string }[];
    } | null; // null if the workout was deleted
    workout?.exercises.forEach((e) => names.add(e.exerciseName));
  }

  // Best set ever recorded for each of those exercises:
  // heaviest weight, and for ties, the most reps
  const best = await Session.aggregate([
    // Aggregation doesn't cast strings to ObjectIds like find() does, so convert here
    { $match: { profileId: new mongoose.Types.ObjectId(profileId) } },
    { $unwind: "$sets" },
    { $match: { "sets.exerciseName": { $in: [...names] } } },
    { $sort: { "sets.weight": -1, "sets.reps": -1 } },
    {
      $group: {
        _id: "$sets.exerciseName",
        weight: { $first: "$sets.weight" },
        reps: { $first: "$sets.reps" },
      },
    },
  ]);
  const bestByName = new Map<string, { weight: number; reps: number }>(
    best.map((b) => [b._id, { weight: b.weight, reps: b.reps }])
  );

  const prs = [...names].map((exerciseName) => {
    const pr = bestByName.get(exerciseName);
    return { exerciseName, weight: pr?.weight ?? null, reps: pr?.reps ?? null };
  });

  res.json({ streak, recordedToday, prs });
});

export default router;