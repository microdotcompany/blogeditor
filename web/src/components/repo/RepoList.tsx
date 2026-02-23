import { useMemo } from "react";
import type { GitHubRepo } from "@blogeditor/shared";
import { RepoCard } from "./RepoCard";

interface RepoListProps {
  repos: GitHubRepo[];
  starred: Set<string>;
  onToggleStar: (fullName: string) => void;
}

export const RepoList = ({ repos, starred, onToggleStar }: RepoListProps) => {
  const sorted = useMemo(() => {
    return [...repos].sort((a, b) => {
      const aStarred = starred.has(a.full_name);
      const bStarred = starred.has(b.full_name);
      if (aStarred !== bStarred) return aStarred ? -1 : 1;
      return 0;
    });
  }, [repos, starred]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((repo) => (
        <RepoCard
          key={repo.id}
          repo={repo}
          isStarred={starred.has(repo.full_name)}
          onToggleStar={onToggleStar}
        />
      ))}
    </div>
  );
};
