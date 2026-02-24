import { useState, useEffect, useCallback } from "react";
import type { TreeItem } from "@blogeditor/shared";
import { apiClient } from "@/api/client";

interface TreeResponse {
  sha: string;
  tree: TreeItem[];
  truncated: boolean;
}

export const useRepoTree = (owner: string, repo: string, branch: string) => {
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    if (!owner || !repo || !branch) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient<TreeResponse>(
        `/api/github/repos/${owner}/${repo}/tree/${branch}`
      );
      setTree(data.tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch file tree");
    } finally {
      setIsLoading(false);
    }
  }, [owner, repo, branch]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return { tree, isLoading, error, refetch: fetchTree };
};
