import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Profile from "../models/Profile.js";

export async function requireProfile(req: Request, res: Response, next: NextFunction) {
  const id = req.header("X-Profile-Id");
  if (!id || !mongoose.isValidObjectId(id) || !(await Profile.exists({ _id: id }))) {
    return res.status(401).json({ error: "Unknown profile" });
  }
  res.locals.profileId = id;
  next();
}