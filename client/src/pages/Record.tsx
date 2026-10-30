import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API } from "../api";

type Workout = {
  _id: string;
  name: string;
  exercises: { muscleGroup: string; exerciseName: string }[];
};
type SetRow = { exerciseName: string; reps: string; weight: string };
type Session = {
  _id: string;
  date: string;
  workoutName: string;
  sets: { exerciseName: string; reps: number; weight: number }[];
};

const pad = (n: number) => String(n).padStart(2, "0");
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const blankRow = (): SetRow => ({ exerciseName: "", reps: "", weight: "" });

export default function Record() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutId, setWorkoutId] = useState(params.get("workout") ?? "");
  const [date, setDate] = useState(params.get("date") ?? todayKey());
  const [rows, setRows] = useState<SetRow[]>([blankRow()]);
  const [history, setHistory] = useState<Session[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get<Workout[]>(`${API}/workouts`).then((res) => setWorkouts(res.data));
  }, []);

  // Pre-fill one row per exercise whenever a library workout is chosen
  useEffect(() => {
    const workout = workouts.find((w) => w._id === workoutId);
    if (!workout) return;
    setRows(
      workout.exercises.map((e) => ({ exerciseName: e.exerciseName, reps: "", weight: "" }))
    );
  }, [workoutId, workouts]);

  useEffect(() => {
    axios
      .get<Session[]>(`${API}/sessions`, { params: { limit: 10 } })
      .then((res) => setHistory(res.data))
      .catch(() => setMessage("Could not load history."));
  }, [refresh]);

  const updateRow = (i: number, changes: Partial<SetRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...changes } : r)));

  // Duplicate a row's exercise right below it so you can log another set
  const addSet = (i: number) =>
    setRows((prev) => [
      ...prev.slice(0, i + 1),
      { exerciseName: prev[i].exerciseName, reps: "", weight: "" },
      ...prev.slice(i + 1),
    ]);

  const removeRow = (i: number) =>
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));

  const save = async () => {
    const sets = rows
      .filter((r) => r.exerciseName.trim() && r.reps !== "" && r.weight !== "")
      .map((r) => ({
        exerciseName: r.exerciseName.trim(),
        reps: Number(r.reps),
        weight: Number(r.weight),
      }));
    if (sets.length === 0) {
      setMessage("Fill in at least one set (exercise, reps, and weight).");
      return;
    }
    if (sets.some((s) => Number.isNaN(s.reps) || Number.isNaN(s.weight))) {
      setMessage("Reps and weight must be numbers.");
      return;
    }
    const workout = workouts.find((w) => w._id === workoutId);
    try {
      await axios.post(`${API}/sessions`, {
        date,
        workoutId: workout?._id,
        workoutName: workout?.name ?? "",
        sets,
      });
      navigate("/calendar");
    } catch {
      setMessage("Could not save session.");
    }
  };

  const removeSession = async (id: string) => {
    try {
      await axios.delete(`${API}/sessions/${id}`);
      setRefresh((r) => r + 1);
    } catch {
      setMessage("Could not delete session.");
    }
  };

  return (
    <div>
      <h1>Record Workout</h1>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <select value={workoutId} onChange={(e) => setWorkoutId(e.target.value)}>
        <option value="">Load from library (optional)</option>
        {workouts.map((w) => (
          <option key={w._id} value={w._id}>
            {w.name}
          </option>
        ))}
      </select>

      {rows.map((row, i) => (
        <div key={i}>
          <input
            placeholder="Exercise"
            value={row.exerciseName}
            onChange={(e) => updateRow(i, { exerciseName: e.target.value })}
          />
          <input
            type="number"
            min="0"
            placeholder="Reps"
            value={row.reps}
            onChange={(e) => updateRow(i, { reps: e.target.value })}
          />
          <input
            type="number"
            min="0"
            step="any"
            placeholder="Weight (kg)"
            value={row.weight}
            onChange={(e) => updateRow(i, { weight: e.target.value })}
          />
          <button onClick={() => addSet(i)}>Add Set</button>
          <button onClick={() => removeRow(i)}>Remove</button>
        </div>
      ))}

      <button onClick={() => setRows((prev) => [...prev, blankRow()])}>Add Exercise +</button>
      <button onClick={save}>Save</button>
      <p>{message}</p>

      <h2>Recent sessions</h2>
      {history.length === 0 && <p>No sessions recorded yet.</p>}
      <ul>
        {history.map((s) => (
          <li key={s._id}>
            {s.date} — {s.workoutName || "Custom workout"} ({s.sets.length} sets){" "}
            <button onClick={() => removeSession(s._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}