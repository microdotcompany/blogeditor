import { useState, useEffect } from "react";
import type { GitHubOrg } from "@blogeditor/shared";
import { apiClient } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";
import { useGitHubRepos } from "@/hooks/useGitHubRepos";
import { useStarredRepos } from "@/hooks/useStarredRepos";
import { RepoList } from "@/components/repo/RepoList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const DashboardPage = () => {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<GitHubOrg[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | undefined>(
    () => localStorage.getItem("lastOrg") ?? undefined
  );
  const { repos, isLoading, error } = useGitHubRepos(selectedOrg);
  const { starred, toggle } = useStarredRepos();

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data = await apiClient<GitHubOrg[]>("/api/github/orgs");
        setOrgs(data);
      } catch {
        // Orgs are optional, don't block the page
      }
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      localStorage.setItem("lastOrg", selectedOrg);
    } else {
      localStorage.removeItem("lastOrg");
    }
  }, [selectedOrg]);

  const currentLabel = selectedOrg || user?.username || "Personal";
  const currentAvatar = selectedOrg
    ? orgs.find((o) => o.login === selectedOrg)?.avatar_url
    : user?.avatarUrl;

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Repositories</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={currentAvatar} />
                <AvatarFallback>{currentLabel[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              {currentLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedOrg(undefined)}>
              <Avatar className="mr-2 h-5 w-5">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              {user?.username}
            </DropdownMenuItem>
            {orgs.length > 0 && <DropdownMenuSeparator />}
            {orgs.map((org) => (
              <DropdownMenuItem key={org.id} onClick={() => setSelectedOrg(org.login)}>
                <Avatar className="mr-2 h-5 w-5">
                  <AvatarImage src={org.avatar_url} />
                  <AvatarFallback>{org.login[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                {org.login}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-xl border bg-card p-4">
              <div className="mb-auto space-y-2.5">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 border-t pt-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted" />
                  <div className="h-3 w-14 animate-pulse rounded bg-muted" />
                </div>
                <div className="ml-auto h-3 w-10 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-destructive">{error}</p>}
      {!isLoading && !error && repos.length === 0 && (
        <p className="text-muted-foreground">No repositories found.</p>
      )}
      {!isLoading && repos.length > 0 && (
        <RepoList repos={repos} starred={starred} onToggleStar={toggle} />
      )}
    </div>
  );
};
