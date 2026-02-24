import { useState, useCallback } from "react";
import type { GitHubBranch } from "@blogeditor/shared";
import { apiClient } from "@/api/client";

export const useBranches = () => {
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBranches = useCallback(async (owner: string, repo: string) => {
    setIsLoading(true);
    try {
      const data = await apiClient<GitHubBranch[]>(
        `/api/github/repos/${owner}/${repo}/branches`
      );
      setBranches(data);
      return data;
    } catch {
      setBranches([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBranch = useCallback(
    async (owner: string, repo: string, name: string, sourceBranch: string) => {
      const data = await apiClient<{ ref: string; object: { sha: string } }>(
        `/api/github/repos/${owner}/${repo}/branches`,
        {
          method: "POST",
          body: JSON.stringify({ name, sourceBranch }),
        }
      );
      return data;
    },
    []
  );

  return { branches, isLoading, fetchBranches, createBranch };
};
