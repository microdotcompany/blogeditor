import { useCallback, useRef } from "react";

const DRAFT_PREFIX = "draft:";

function getDraftKey(owner: string, repo: string, branch: string, path: string) {
  return `${DRAFT_PREFIX}${owner}/${repo}/${branch}/${path}`;
}

export const useEditorDraft = (owner: string, repo: string, branch: string, path: string) => {
  const key = getDraftKey(owner, repo, branch, path);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadDraft = useCallback((): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const saveDraft = useCallback(
    (content: string) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(key, content);
        } catch {
          // localStorage full — silently ignore
        }
      }, 500);
    },
    [key],
  );

  const saveDraftImmediate = useCallback(
    (content: string) => {
      clearTimeout(timerRef.current);
      try {
        localStorage.setItem(key, content);
      } catch {
        // localStorage full
      }
    },
    [key],
  );

  const clearDraft = useCallback(() => {
    clearTimeout(timerRef.current);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }, [key]);

  return { loadDraft, saveDraft, saveDraftImmediate, clearDraft };
};
