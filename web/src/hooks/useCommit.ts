import { useState } from "react";
import type { CommitResponse } from "@blogeditor/shared";
import { apiClient, ApiError } from "@/api/client";

interface CommitParams {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  sha: string;
  branch: string;
}

export const useCommit = () => {
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commit = async ({ owner, repo, path, content, message, sha, branch }: CommitParams) => {
    setIsCommitting(true);
    setError(null);

    try {
      const encoded = btoa(unescape(encodeURIComponent(content)));
      const data = await apiClient<CommitResponse>(
        `/api/github/repos/${owner}/${repo}/contents/${path}`,
        {
          method: "PUT",
          body: JSON.stringify({ message, content: encoded, sha, branch }),
        }
      );
      return data;
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Conflict: file was modified elsewhere. Reload and try again.");
        throw err;
      }
      setError(err instanceof Error ? err.message : "Commit failed");
      throw err;
    } finally {
      setIsCommitting(false);
    }
  };

  return { commit, isCommitting, error };
};
