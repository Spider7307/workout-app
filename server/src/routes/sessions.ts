import { Router } from "express";
import Session from "../models/Session.js";

const router = Router();

// GET /api/sessions?from=2026-10-01&to=2026-10-31&limit=50
router.get("/", async (req, res) => {
  const { from, to } = req.query;
  const filter: Record<string, unknown> = { profileId: res.locals.profileId };
  if (typeof from === "string" && typeof to === "string") {
    filter.date = { $gte: from, $lte: to };
  }
  const limit = Math.min(Number(req.query.limit) || 100, 1000);
  const sessions = await Session.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .limit(limit);
  res.json(sessions);
});

router.post("/", async (req, res) => {
  try {
    const { date, workoutId, workoutName, sets } = req.body;
    if (!Array.isArray(sets) || sets.length === 0) {
      return res.status(400).json({ error: "At least one set is required" });
    }
    const session = await Session.create({
      date,
      workoutId,
      workoutName,
      sets,
      profileId: res.locals.profileId,
    });
    res.status(201).json(session);
  } catch {
    res.status(400).json({ error: "Invalid session" });
  }
});

router.delete("/:id", async (req, res) => {
  await Session.findOneAndDelete({ _id: req.params.id, profileId: res.locals.profileId });
  res.status(204).end();
});

export default router;