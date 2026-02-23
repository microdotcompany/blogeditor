import { env } from "../config/env.js";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_USER_EMAILS_URL = "https://api.github.com/user/emails";

export const getAuthorizationUrl = () => {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${env.SERVER_URL}/api/auth/github/callback`,
    scope: "repo read:user user:email",
  });
  return `${GITHUB_AUTHORIZE_URL}?${params}`;
};

export const exchangeCodeForToken = async (code: string): Promise<string> => {
  const res = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = (await res.json()) as { access_token?: string; error?: string };

  if (!data.access_token) {
    throw new Error(`GitHub token exchange failed: ${data.error || "Unknown error"}`);
  }

  return data.access_token;
};

interface GitHubUserResponse {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

interface GitHubEmailResponse {
  email: string;
  primary: boolean;
  verified: boolean;
}

export const fetchGitHubUser = async (accessToken: string) => {
  const res = await fetch(GITHUB_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch GitHub user: ${res.statusText}`);
  }

  const user = (await res.json()) as GitHubUserResponse;

  let email = user.email;
  if (!email) {
    const emailRes = await fetch(GITHUB_USER_EMAILS_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (emailRes.ok) {
      const emails = (await emailRes.json()) as GitHubEmailResponse[];
      const primary = emails.find((e) => e.primary && e.verified);
      email = primary?.email || null;
    }
  }

  return {
    githubId: user.id,
    username: user.login,
    displayName: user.name || user.login,
    email,
    avatarUrl: user.avatar_url,
  };
};
