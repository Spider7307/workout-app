import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true, maxlength: 30 } },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);