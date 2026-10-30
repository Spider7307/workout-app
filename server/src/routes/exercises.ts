import { Router } from "express";
import axios from "axios";

const router = Router();

const MUSCLES = [
  "abdominals", "abductors", "adductors", "biceps", "calves", "chest",
  "forearms", "glutes", "hamstrings", "lats", "lower_back", "middle_back",
  "neck", "quadriceps", "traps", "triceps",
];
const DIFFICULTIES = ["beginner", "intermediate", "expert"];

// In-memory cache so repeated dropdown changes don't burn your API quota
const cache = new Map<string, unknown[]>();

router.get("/muscles", (_req, res) => {
  res.json(MUSCLES);
});

router.get("/", async (req, res) => {
  const muscle = String(req.query.muscle ?? "");
  if (!MUSCLES.includes(muscle)) {
    return res.status(400).json({ error: "Invalid muscle" });
  }
  if (cache.has(muscle)) return res.json(cache.get(muscle));

  try {
    const responses = await Promise.all(
      DIFFICULTIES.map((difficulty) =>
        axios.get("https://api.api-ninjas.com/v1/exercises", {
          params: { muscle, difficulty },
          headers: { "X-Api-Key": process.env.API_NINJAS_KEY },
        })
      )
    );

    const seen = new Set<string>();
    const exercises = responses
      .flatMap((r) => r.data)
      .filter((e: { name: string }) => {
        if (seen.has(e.name)) return false;
        seen.add(e.name);
        return true;
      })
      .map((e: { name: string; type: string; difficulty: string; muscle: string }) => ({
        name: e.name,
        type: e.type,
        difficulty: e.difficulty,
        muscle: e.muscle,
      }));

    cache.set(muscle, exercises);
    res.json(exercises);
  } catch {
    res.status(502).json({ error: "Exercise API request failed" });
  }
});

export default router;