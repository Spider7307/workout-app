import "dotenv/config";
import mongoose from "mongoose";
import Profile from "./models/Profile.js";
import Workout from "./models/Workout.js";
import ScheduledWorkout from "./models/ScheduledWorkout.js";
import Session from "./models/Session.js";

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: npx tsx src/adopt.ts "Profile Name"');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI as string);

  const profile = await Profile.findOne({ name });
  if (!profile) {
    console.error(`No profile named "${name}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const orphans = { profileId: { $exists: false } };
  const assign = { $set: { profileId: profile._id } };
  const [w, s, r] = await Promise.all([
    Workout.updateMany(orphans, assign),
    ScheduledWorkout.updateMany(orphans, assign),
    Session.updateMany(orphans, assign),
  ]);

  console.log(
    `Assigned to "${name}": ${w.modifiedCount} workouts, ${s.modifiedCount} schedule entries, ${r.modifiedCount} sessions`
  );
  await mongoose.disconnect();
}

main();