import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ExerciseRow, { type Row } from "../components/ExerciseRow";
import { API } from "../api";

type Workout = {
  _id: string;
  name: string;
  exercises: Row[];
};

export default function EditWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [muscles, setMuscles] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get<string[]>(`${API}/exercises/muscles`).then((res) => setMuscles(res.data));
  }, []);

  useEffect(() => {
    axios
      .get<Workout>(`${API}/workouts/${id}`)
      .then((res) => {
        setName(res.data.name);
        setRows(
          res.data.exercises.map((e) => ({
            muscleGroup: e.muscleGroup,
            exerciseName: e.exerciseName,
          }))
        );
      })
      .catch(() => setMessage("Could not load workout."))
      .finally(() => setLoading(false));
  }, [id]);

  const updateRow = (i: number, row: Row) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? row : r)));

  const addRow = () =>
    setRows((prev) => [...prev, { muscleGroup: "", exerciseName: "" }]);

  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    const exercises = rows.filter((r) => r.muscleGroup && r.exerciseName);
    if (!name.trim() || exercises.length === 0) {
      setMessage("Add a name and at least one exercise.");
      return;
    }
    try {
      await axios.put(`${API}/workouts/${id}`, { name, exercises });
      navigate("/library");
    } catch {
      setMessage("Could not save changes.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Edit Workout</h1>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />

      {rows.map((row, i) => (
        <div key={i}>
          <ExerciseRow row={row} muscles={muscles} onChange={(r) => updateRow(i, r)} />
          <button onClick={() => removeRow(i)}>Remove</button>
        </div>
      ))}

      <button onClick={addRow}>Add Exercise +</button>
      <button onClick={save}>Save to Library</button>
      <p>{message}</p>
    </div>
  );
}