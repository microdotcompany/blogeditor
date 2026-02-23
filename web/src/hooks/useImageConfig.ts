import { useState, useEffect } from "react";
import type { TreeItem } from "@blogeditor/shared";
import { apiClient } from "@/api/client";
import { type ImageConfig, detectImageConfig } from "@/lib/imageConfig";

interface TreeResponse {
  sha: string;
  tree: TreeItem[];
  truncated: boolean;
}

export const useImageConfig = (owner: string, repo: string, branch: string) => {
  const [config, setConfig] = useState<ImageConfig | null>(null);

  useEffect(() => {
    if (!owner || !repo || !branch) return;

    apiClient<TreeResponse>(`/api/github/repos/${owner}/${repo}/tree/${branch}`)
      .then((data) => setConfig(detectImageConfig(data.tree)))
      .catch(() => setConfig({ uploadDir: "public/images", urlPrefix: "/images" }));
  }, [owner, repo, branch]);

  return config;
};
