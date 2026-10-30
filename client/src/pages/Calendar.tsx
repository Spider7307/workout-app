import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../api";

type Workout = { _id: string; name: string };
type Scheduled = {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  workoutId: Workout | null; // null if the workout was deleted
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTime = (t: string) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)}${h >= 12 ? "pm" : "am"}`;
};

export default function Calendar() {
  const today = new Date();
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(toKey(today));
  const [entries, setEntries] = useState<Scheduled[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutId, setWorkoutId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [message, setMessage] = useState("");

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Blank cells before the 1st, then the days, then blanks to finish the last row
  const cells: (number | null)[] = [
    ...Array.from({ length: view.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  useEffect(() => {
    axios.get<Workout[]>(`${API}/workouts`).then((res) => setWorkouts(res.data));
  }, []);

  useEffect(() => {
    const from = toKey(new Date(year, month, 1));
    const to = toKey(new Date(year, month, daysInMonth));
    axios
      .get<Scheduled[]>(`${API}/schedule`, { params: { from, to } })
      .then((res) => setEntries(res.data))
      .catch(() => setMessage("Could not load schedule."));
  }, [year, month, daysInMonth, refresh]);

  const byDate: Record<string, Scheduled[]> = {};
  for (const e of entries) (byDate[e.date] ??= []).push(e);

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setView(next);
    setSelected(toKey(next));
  };

  const schedule = async () => {
    if (!workoutId) {
      setMessage("Pick a workout first.");
      return;
    }
    try {
      await axios.post(`${API}/schedule`, { date: selected, workoutId, startTime, endTime });
      setWorkoutId("");
      setStartTime("");
      setEndTime("");
      setMessage("");
      setRefresh((r) => r + 1);
    } catch {
      setMessage("Could not schedule workout.");
    }
  };

  const unschedule = async (id: string) => {
    try {
      await axios.delete(`${API}/schedule/${id}`);
      setRefresh((r) => r + 1);
    } catch {
      setMessage("Could not remove workout.");
    }
  };

  const selectedLabel = new Date(`${selected}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <h1>Calendar</h1>

      <div>
        <button onClick={() => changeMonth(-1)}>←</button>{" "}
        <strong>
          {view.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </strong>{" "}
        <button onClick={() => changeMonth(1)}>→</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {WEEKDAYS.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.8rem" }}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = toKey(new Date(year, month, day));
          const dayEntries = byDate[key] ?? [];
          return (
            <button
              key={i}
              onClick={() => setSelected(key)}
              style={{
                minHeight: "4.5rem",
                textAlign: "left",
                verticalAlign: "top",
                border: key === selected ? "2px solid royalblue" : "1px solid gray",
                fontWeight: key === toKey(today) ? "bold" : "normal",
              }}
            >
              <div>{day}</div>
              {dayEntries.map((e) => (
                <div key={e._id} style={{ fontSize: "0.7rem" }}>
                  {e.workoutId?.name ?? "(deleted)"}
                </div>
              ))}
            </button>
          );
        })}
      </div>

      <h2>{selectedLabel}</h2>
      {(byDate[selected] ?? []).length === 0 && <p>Nothing scheduled.</p>}
      <ul>
        {(byDate[selected] ?? []).map((e) => (
          <li key={e._id}>
            {e.workoutId?.name ?? "(deleted workout)"}
            {e.startTime && ` — ${fmtTime(e.startTime)}–${fmtTime(e.endTime)}`}{" "}
            {e.workoutId && (
              <Link to={`/record?workout=${e.workoutId._id}&date=${selected}`}>Record</Link>
            )}{" "}
            <button onClick={() => unschedule(e._id)}>Remove</button>
          </li>
        ))}
      </ul>

      <h3>Schedule a workout</h3>
      <select value={workoutId} onChange={(e) => setWorkoutId(e.target.value)}>
        <option value="">Choose from library</option>
        {workouts.map((w) => (
          <option key={w._id} value={w._id}>
            {w.name}
          </option>
        ))}
      </select>
      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      <button onClick={schedule}>Add to {selected}</button>
      <p>{message}</p>
    </div>
  );
}