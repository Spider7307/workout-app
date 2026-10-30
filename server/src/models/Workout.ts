import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bookmarked: { type: Boolean, default: false },
    exercises: [
      {
        muscleGroup: { type: String, required: true },
        exerciseName: { type: String, required: true },
        exerciseId: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Workout", workoutSchema);