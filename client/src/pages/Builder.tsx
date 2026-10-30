import { useEffect, useState } from "react";
import axios from "axios";
import ExerciseRow, { type Exercise, type Row } from "../components/ExerciseRow";
import { API } from "../api";

type PlanSet = {
  id: number;
  name: string;
  exercises: Row[];
  bookmarked: boolean;
  saved: boolean;
};

const emptyRow = (): Row => ({ muscleGroup: "", exerciseName: "" });
const pickRandom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export default function Builder() {
  const [muscles, setMuscles] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [sets, setSets] = useState<PlanSet[]>(() => {
  try {
    const stored = localStorage.getItem("bookmarkedSets");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
});
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get<string[]>(`${API}/exercises/muscles`).then((res) => setMuscles(res.data));
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "bookmarkedSets",
        JSON.stringify(sets.filter((s) => s.bookmarked))
      );
    } catch {
      // storage unavailable, ignore
    }
  }, [sets]);

  const updateRow = (i: number, row: Row) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? row : r)));

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const generate = async () => {
    const chosen = rows.filter((r) => r.muscleGroup);
    if (chosen.length === 0) {
      setMessage("Pick at least one muscle group.");
      return;
    }
    try {
      // Exercises the user picked by hand stay fixed; the rest are randomized
      const used = new Set(chosen.map((r) => r.exerciseName).filter(Boolean));
      const exercises: Row[] = [];
      for (const row of chosen) {
        if (row.exerciseName) {
          exercises.push(row);
          continue;
        }
        const res = await axios.get<Exercise[]>(`${API}/exercises`, {
          params: { muscle: row.muscleGroup },
        });
        const pool = res.data.filter((e) => !used.has(e.name));
        if (pool.length === 0) throw new Error("No exercises available");
        const pick = pickRandom(pool);
        used.add(pick.name);
        exercises.push({ ...row, exerciseName: pick.name });
      }
      const newSet: PlanSet = { id: Date.now(), name: "", exercises, bookmarked: false, saved: false };
      // New set goes on top; only bookmarked sets survive
      setSets((prev) => [newSet, ...prev.filter((s) => s.bookmarked)]);
      setMessage("");
    } catch {
      setMessage("Could not generate a plan.");
    }
  };

  const updateSet = (id: number, changes: Partial<PlanSet>) =>
    setSets((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)));

  const saveSet = async (set: PlanSet) => {
    if (!set.name.trim()) {
      setMessage("Name your workout first.");
      return;
    }
    try {
      await axios.post(`${API}/workouts`, { name: set.name, exercises: set.exercises });
      updateSet(set.id, { saved: true });
      setMessage(`Added "${set.name}" to your workouts.`);
    } catch {
      setMessage("Could not save workout.");
    }
  };

  return (
    <div>
      <h1>Workout Builder</h1>

      {rows.map((row, i) => (
        <ExerciseRow key={i} row={row} muscles={muscles} onChange={(r) => updateRow(i, r)} />
      ))}
      <button onClick={addRow}>Add Exercise +</button>
      <button onClick={generate}>Generate Plan</button>
      <p>{message}</p>

      {sets.map((set) => (
        <div key={set.id}>
          <input
            placeholder="Name"
            value={set.name}
            onChange={(e) => updateSet(set.id, { name: e.target.value })}
          />
          <ul>
            {set.exercises.map((ex, i) => (
              <li key={i}>
                {ex.muscleGroup.replace("_", " ")}: {ex.exerciseName}
              </li>
            ))}
          </ul>
          <button onClick={() => saveSet(set)} disabled={set.saved}>
            {set.saved ? "Added" : "Add to Workouts"}
          </button>
          <label>
            <input
              type="checkbox"
              checked={set.bookmarked}
              onChange={() => updateSet(set.id, { bookmarked: !set.bookmarked })}
            />
            Bookmark?
          </label>
        </div>
      ))}
    </div>
  );
}