import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { getAuthorizationUrl, exchangeCodeForToken, fetchGitHubUser } from "../services/githubOAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

authRouter.get("/github", (_req, res) => {
  res.redirect(getAuthorizationUrl());
});

authRouter.get("/github/callback", async (req, res, next) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      res.status(400).json({ message: "Missing authorization code from GitHub." });
      return;
    }

    const accessToken = await exchangeCodeForToken(code);
    const githubUser = await fetchGitHubUser(accessToken);

    const user = await User.findOneAndUpdate(
      { githubId: githubUser.githubId },
      { ...githubUser, accessToken },
      { upsert: true, new: true }
    );

    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: "7d" });

    res.redirect(`${env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, (req, res) => {
  const user = req.user!;
  res.json({
    githubId: user.githubId,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    starredRepos: user.starredRepos ?? [],
  });
});

authRouter.put("/starred/:owner/:repo", requireAuth, async (req, res, next) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    await User.updateOne(
      { _id: req.user!._id },
      { $addToSet: { starredRepos: fullName } }
    );
    res.json({ starred: true });
  } catch (err) {
    next(err);
  }
});

authRouter.delete("/starred/:owner/:repo", requireAuth, async (req, res, next) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    await User.updateOne(
      { _id: req.user!._id },
      { $pull: { starredRepos: fullName } }
    );
    res.json({ starred: false });
  } catch (err) {
    next(err);
  }
});
