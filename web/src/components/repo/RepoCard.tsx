import { useNavigate } from "react-router";
import type { GitHubRepo } from "@blogeditor/shared";
import { Star } from "lucide-react";

interface RepoCardProps {
  repo: GitHubRepo;
  isStarred: boolean;
  onToggleStar: (fullName: string) => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  HTML: "bg-orange-500",
  CSS: "bg-purple-500",
  SCSS: "bg-pink-500",
  Ruby: "bg-red-500",
  Go: "bg-cyan-500",
  Rust: "bg-orange-700",
  Java: "bg-amber-700",
  PHP: "bg-indigo-400",
  Astro: "bg-orange-400",
};

const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const days = Math.floor(seconds / 86400);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

export const RepoCard = ({ repo, isStarred, onToggleStar }: RepoCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="group flex cursor-pointer flex-col rounded-xl border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
      onClick={() => navigate(`/repos/${repo.owner.login}/${repo.name}`)}
    >
      <div className="mb-auto">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold group-hover:text-primary">
            {repo.name}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            {repo.private && (
              <span className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
                Private
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(repo.full_name);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-amber-500"
            >
              <Star
                className={`h-3.5 w-3.5 ${isStarred ? "fill-amber-400 text-amber-400" : ""}`}
              />
            </button>
          </div>
        </div>
        {repo.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {repo.description}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${LANGUAGE_COLORS[repo.language] || "bg-gray-400"}`}
            />
            {repo.language}
          </span>
        )}
        <span className="ml-auto">{timeAgo(repo.updated_at)}</span>
      </div>
    </div>
  );
};
