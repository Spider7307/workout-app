import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    // Optional link back to the library workout, plus a name snapshot so history
    // still reads correctly if the workout is later renamed or deleted
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Workout" },
    workoutName: { type: String, default: "" },
    sets: [
      {
        exerciseName: { type: String, required: true },
        reps: { type: Number, required: true, min: 0 },
        weight: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);