import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useRepoTree } from "@/hooks/useRepoTree";
import { FileTree } from "@/components/filebrowser/FileTree";
import { apiClient } from "@/api/client";
import type { GitHubBranch } from "@blogeditor/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const BrowserPage = () => {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [branch, setBranch] = useState("");
  const { tree, isLoading, error, refetch } = useRepoTree(owner!, repo!, branch);

  useEffect(() => {
    if (!owner || !repo) return;

    const fetchBranches = async () => {
      const data = await apiClient<GitHubBranch[]>(
        `/api/github/repos/${owner}/${repo}/branches`
      );
      setBranches(data);
      if (data.length > 0) {
        const main = data.find((b) => b.name === "main" || b.name === "master");
        setBranch(main?.name || data[0].name);
      }
    };

    fetchBranches();
  }, [owner, repo]);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {owner}/{repo}
        </h1>

        {branches.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {branch}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {branches.map((b) => (
                <DropdownMenuItem key={b.name} onClick={() => setBranch(b.name)}>
                  {b.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isLoading && (
        <div className="rounded-lg border p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5">
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              <div
                className="h-3.5 animate-pulse rounded bg-muted"
                style={{ width: `${100 + ((i * 47) % 120)}px` }}
              />
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-destructive">{error}</p>}
      {!isLoading && !error && tree.length > 0 && (
        <div className="rounded-lg border p-2">
          <FileTree items={tree} owner={owner!} repo={repo!} branch={branch} onDuplicate={refetch} />
        </div>
      )}
    </div>
  );
};
