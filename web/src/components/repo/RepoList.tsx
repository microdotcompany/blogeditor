import { useMemo, useState } from "react";
import type { GitHubRepo } from "@blogeditor/shared";
import { ChevronRight } from "lucide-react";
import { RepoCard } from "./RepoCard";

const BLOG_FRAMEWORKS = ["astro", "gatsby", "hugo", "jekyll", "eleventy", "nextjs"];

const isBlogFramework = (repo: GitHubRepo) =>
  repo.topics?.some((t) => BLOG_FRAMEWORKS.includes(t.toLowerCase()));

interface RepoListProps {
  repos: GitHubRepo[];
  starred: Set<string>;
  onToggleStar: (fullName: string) => void;
}

export const RepoList = ({ repos, starred, onToggleStar }: RepoListProps) => {
  const [othersOpen, setOthersOpen] = useState(false);

  const { primary, others } = useMemo(() => {
    const primary: GitHubRepo[] = [];
    const others: GitHubRepo[] = [];

    for (const repo of repos) {
      if (starred.has(repo.full_name) || isBlogFramework(repo)) {
        primary.push(repo);
      } else {
        others.push(repo);
      }
    }

    primary.sort((a, b) => {
      const aStarred = starred.has(a.full_name);
      const bStarred = starred.has(b.full_name);
      if (aStarred !== bStarred) return aStarred ? -1 : 1;
      return 0;
    });

    return { primary, others };
  }, [repos, starred]);

  return (
    <div className="space-y-6">
      {primary.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {primary.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isStarred={starred.has(repo.full_name)}
              onToggleStar={onToggleStar}
            />
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setOthersOpen((prev) => !prev)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${othersOpen ? "rotate-90" : ""}`}
            />
            Other repositories ({others.length})
          </button>

          {othersOpen && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((repo) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  isStarred={starred.has(repo.full_name)}
                  onToggleStar={onToggleStar}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
