import { useState, useEffect } from "react";
import type { GitHubRepo } from "@blogeditor/shared";
import { apiClient } from "@/api/client";

export const useGitHubRepos = (org?: string) => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const query = org ? `?org=${encodeURIComponent(org)}` : "";
        const data = await apiClient<GitHubRepo[]>(`/api/github/repos${query}`);
        setRepos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch repos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepos();
  }, [org]);

  return { repos, isLoading, error };
};
