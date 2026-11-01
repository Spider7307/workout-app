import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../api";
import { toKey, fmtTime } from "../dates";

type Scheduled = {
  _id: string;
  startTime: string;
  endTime: string;
  workoutId: { _id: string; name: string } | null;
};
type Stats = {
  streak: number;
  recordedToday: boolean;
  prs: { exerciseName: string; weight: number | null; reps: number | null }[];
};

export default function Home() {
  const now = new Date();
  const today = toKey(now);

  const [todays, setTodays] = useState<Scheduled[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get<Scheduled[]>(`${API}/schedule`, { params: { from: today, to: today } }),
      axios.get<Stats>(`${API}/stats`, { params: { today } }),
    ])
      .then(([schedule, statsRes]) => {
        setTodays(schedule.data);
        setStats(statsRes.data);
      })
      .catch(() => setError("Could not load your dashboard."))
      .finally(() => setLoading(false));
  }, [today]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Home</h1>
      {error && <p>{error}</p>}

      <section className="card">
        <h2>
          Today's Workouts {now.getMonth() + 1}/{now.getDate()}
        </h2>
        {todays.length === 0 && <p>Nothing scheduled today.</p>}
        <ul>
          {todays.map((e) => (
            <li key={e._id}>
              {e.workoutId?.name ?? "(deleted workout)"}
              {e.startTime && ` — ${fmtTime(e.startTime)}–${fmtTime(e.endTime)}`}
            </li>
          ))}
        </ul>
      </section>

      <div>
        <Link to="/builder">Create a Plan</Link>{" "}
        <Link to="/record">Record a Workout</Link>
      </div>

      {stats && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <section className="card">
            <h3>{stats.streak} Day Streak! 🔥</h3>
            <p>
              {stats.streak === 0
                ? "Record a workout to start a streak."
                : stats.recordedToday
                  ? "KEEP IT UP"
                  : "Record today to keep it going."}
            </p>
          </section>

          <section className="card">
            <h3>Workout PRs:</h3>
            <p>For today's workouts</p>
            {stats.prs.length === 0 && <p>Nothing scheduled today.</p>}
            <ul>
              {stats.prs.map((p) => (
                <li key={p.exerciseName}>
                  {p.exerciseName}:{" "}
                  {p.weight === null ? "no record yet" : `${p.reps} reps × ${p.weight} kg`}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}