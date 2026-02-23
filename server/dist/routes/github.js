import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
export const githubRouter = Router();
githubRouter.use(requireAuth);
const githubApi = (path, token, options) => fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        ...options?.headers,
    },
});
githubRouter.get("/orgs", async (req, res, next) => {
    try {
        const response = await githubApi("/user/orgs?per_page=100", req.user.accessToken);
        const data = await response.json();
        res.json(data);
    }
    catch (err) {
        next(err);
    }
});
githubRouter.get("/repos", async (req, res, next) => {
    try {
        const org = req.query.org;
        const url = org
            ? `/orgs/${org}/repos?sort=updated&per_page=100`
            : "/user/repos?sort=updated&per_page=100&affiliation=owner";
        const response = await githubApi(url, req.user.accessToken);
        const data = await response.json();
        res.json(data);
    }
    catch (err) {
        next(err);
    }
});
githubRouter.get("/repos/:owner/:repo/branches", async (req, res, next) => {
    try {
        const { owner, repo } = req.params;
        const response = await githubApi(`/repos/${owner}/${repo}/branches`, req.user.accessToken);
        const data = await response.json();
        res.json(data);
    }
    catch (err) {
        next(err);
    }
});
githubRouter.get("/repos/:owner/:repo/tree/:branch", async (req, res, next) => {
    try {
        const { owner, repo, branch } = req.params;
        const response = await githubApi(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, req.user.accessToken);
        const data = await response.json();
        res.json(data);
    }
    catch (err) {
        next(err);
    }
});
githubRouter.get("/repos/:owner/:repo/contents/*", async (req, res, next) => {
    try {
        const { owner, repo } = req.params;
        const filePath = req.params[0];
        const branch = req.query.ref;
        const url = `/repos/${owner}/${repo}/contents/${filePath}${branch ? `?ref=${branch}` : ""}`;
        const response = await githubApi(url, req.user.accessToken);
        const data = await response.json();
        res.status(response.status).json(data);
    }
    catch (err) {
        next(err);
    }
});
githubRouter.get("/repos/:owner/:repo/raw/:branch/*", async (req, res, next) => {
    try {
        const { owner, repo, branch } = req.params;
        const filePath = req.params[0];
        const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`, { headers: { Authorization: `Bearer ${req.user.accessToken}` } });
        if (!response.ok) {
            res.status(response.status).end();
            return;
        }
        const contentType = response.headers.get("content-type");
        if (contentType)
            res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=3600");
        const buffer = Buffer.from(await response.arrayBuffer());
        res.send(buffer);
    }
    catch (err) {
        next(err);
    }
});
githubRouter.put("/repos/:owner/:repo/contents/*", async (req, res, next) => {
    try {
        const { owner, repo } = req.params;
        const filePath = req.params[0];
        const response = await githubApi(`/repos/${owner}/${repo}/contents/${filePath}`, req.user.accessToken, {
            method: "PUT",
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        if (!response.ok) {
            res.status(response.status).json(data);
            return;
        }
        res.json(data);
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=github.js.map