import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:3001/api";

type Workout = {
  _id: string;
  name: string;
  exercises: { muscleGroup: string; exerciseName: string }[];
};

export default function Library() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get<Workout[]>(`${API}/workouts`)
      .then((res) => setWorkouts(res.data))
      .catch(() => setError("Could not load workouts."))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    try {
      await axios.delete(`${API}/workouts/${id}`);
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
    } catch {
      setError("Could not delete workout.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Library</h1>
      {error && <p>{error}</p>}
      {workouts.length === 0 && (
        <p>
          No workouts yet. <Link to="/builder">Build one</Link>.
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {workouts.map((w) => {
          const groups = [...new Set(w.exercises.map((e) => e.muscleGroup.replace("_", " ")))];
          return (
            <div key={w._id} style={{ border: "1px solid gray", padding: "1rem" }}>
              <h3>{w.name}</h3>
              <p>{w.exercises.length} exercises</p>
              <p>{groups.join(", ")}</p>
              <Link to={`/library/${w._id}/edit`}>Edit</Link>{" "}
              <button onClick={() => remove(w._id)}>Delete</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}