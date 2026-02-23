import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { apiClient } from "@/api/client";

export const useStarredRepos = () => {
  const { user } = useAuth();
  const [starred, setStarred] = useState<Set<string>>(
    new Set(user?.starredRepos ?? [])
  );

  const toggle = useCallback(async (fullName: string) => {
    const [owner, repo] = fullName.split("/");
    const isStarred = starred.has(fullName);

    setStarred((prev) => {
      const next = new Set(prev);
      if (isStarred) {
        next.delete(fullName);
      } else {
        next.add(fullName);
      }
      return next;
    });

    try {
      await apiClient(`/api/auth/starred/${owner}/${repo}`, {
        method: isStarred ? "DELETE" : "PUT",
      });
    } catch {
      setStarred((prev) => {
        const next = new Set(prev);
        if (isStarred) {
          next.add(fullName);
        } else {
          next.delete(fullName);
        }
        return next;
      });
    }
  }, [starred]);

  return { starred, toggle };
};
