import { Router } from "express";
import Session from "../models/Session.js";

const router = Router();

// Date math in UTC so daylight saving can't skip or repeat a day
const prevDay = (key: string) =>
  new Date(new Date(`${key}T00:00:00Z`).getTime() - 86_400_000).toISOString().slice(0, 10);

// GET /api/stats?today=2026-10-30
// The client sends its own local date, since the server may be in another timezone
router.get("/", async (req, res) => {
  const today = String(req.query.today ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) {
    return res.status(400).json({ error: "today must be YYYY-MM-DD" });
  }

  const dates = new Set<string>(await Session.distinct("date"));
  const recordedToday = dates.has(today);

  let cursor = recordedToday ? today : prevDay(today);
  let streak = 0;
  while (dates.has(cursor)) {
    streak++;
    cursor = prevDay(cursor);
  }

  const prs = await Session.aggregate([
    { $unwind: "$sets" },
    { $group: { _id: "$sets.exerciseName", weight: { $max: "$sets.weight" } } },
    { $sort: { weight: -1 } },
    { $limit: 5 },
  ]);

  res.json({
    streak,
    recordedToday,
    prs: prs.map((p) => ({ exerciseName: p._id, weight: p.weight })),
  });
});

export default router;