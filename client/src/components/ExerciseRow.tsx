import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../api";

export type Exercise = { name: string; type: string; difficulty: string; muscle: string };
export type Row = { muscleGroup: string; exerciseName: string };

export default function ExerciseRow({
  row,
  muscles,
  onChange,
}: {
  row: Row;
  muscles: string[];
  onChange: (row: Row) => void;
}) {
  const [options, setOptions] = useState<Exercise[]>([]);

  useEffect(() => {
    if (!row.muscleGroup) {
      setOptions([]);
      return;
    }
    axios
      .get<Exercise[]>(`${API}/exercises`, { params: { muscle: row.muscleGroup } })
      .then((res) => setOptions(res.data))
      .catch(() => setOptions([]));
  }, [row.muscleGroup]);

  return (
    <div>
      <select
        value={row.muscleGroup}
        onChange={(e) => onChange({ muscleGroup: e.target.value, exerciseName: "" })}
      >
        <option value="">Muscle Group</option>
        {muscles.map((m) => (
          <option key={m} value={m}>{m.replace("_", " ")}</option>
        ))}
      </select>

      <select
        value={row.exerciseName}
        onChange={(e) => onChange({ ...row, exerciseName: e.target.value })}
        disabled={!row.muscleGroup}
      >
        <option value="">Exercise?</option>
        {options.map((ex) => (
          <option key={ex.name} value={ex.name}>{ex.name}</option>
        ))}
      </select>
    </div>
  );
}