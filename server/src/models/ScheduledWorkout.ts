import mongoose from "mongoose";

const scheduledSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    // "YYYY-MM-DD" string instead of a Date, so timezones can't shift a workout to another day
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Workout", required: true },
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ScheduledWorkout", scheduledSchema);