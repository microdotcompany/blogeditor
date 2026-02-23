import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    githubId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    email: { type: String, default: null },
    avatarUrl: { type: String, required: true },
    accessToken: { type: String, required: true },
    starredRepos: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
