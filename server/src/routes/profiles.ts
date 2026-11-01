import { Router } from "express";
import Profile from "../models/Profile.js";
import Workout from "../models/Workout.js";
import ScheduledWorkout from "../models/ScheduledWorkout.js";
import Session from "../models/Session.js";

const router = Router();

router.get("/", async (_req, res) => {
  res.json(await Profile.find().sort({ createdAt: 1 }));
});

router.post("/", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (!name || name.length > 30) {
    return res.status(400).json({ error: "Name must be 1-30 characters" });
  }

  const isFirst = (await Profile.countDocuments()) === 0;
  const profile = await Profile.create({ name });

  if (isFirst) {
    // Existing data from before profiles existed goes to the first profile
    const orphans = { profileId: { $exists: false } };
    const assign = { $set: { profileId: profile._id } };
    await Promise.all([
      Workout.updateMany(orphans, assign),
      ScheduledWorkout.updateMany(orphans, assign),
      Session.updateMany(orphans, assign),
    ]);
  }

  res.status(201).json(profile);
});

export default router;