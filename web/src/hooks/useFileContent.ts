import { useState, useEffect, useCallback } from "react";
import type { FileContent } from "@blogeditor/shared";
import { apiClient } from "@/api/client";

export const useFileContent = (owner: string, repo: string, branch: string, path: string) => {
  const [content, setContent] = useState<string>("");
  const [sha, setSha] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    if (!owner || !repo || !path) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient<FileContent>(
        `/api/github/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
      );
      const raw = data.content.replace(/\n/g, "");
      setContent(decodeURIComponent(escape(atob(raw))));
      setSha(data.sha);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch file content");
    } finally {
      setIsLoading(false);
    }
  }, [owner, repo, branch, path]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { content, sha, setSha, isLoading, error, refetch: fetchContent };
};
