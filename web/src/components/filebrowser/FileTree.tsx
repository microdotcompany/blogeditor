import { useMemo } from "react";
import type { TreeItem } from "@blogeditor/shared";
import { FileTreeNode, type TreeNode } from "./FileTreeNode";
import { detectContentDir, getExpandedPaths } from "@/lib/contentDir";

interface FileTreeProps {
  items: TreeItem[];
  owner: string;
  repo: string;
  branch: string;
  onDuplicate?: () => void;
}

const buildTree = (items: TreeItem[]): TreeNode[] => {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();

  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const item of sorted) {
    const parts = item.path.split("/");
    const name = parts[parts.length - 1];

    const node: TreeNode = {
      name,
      path: item.path,
      type: item.type,
      children: item.type === "tree" ? [] : undefined,
    };

    map.set(item.path, node);

    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = map.get(parentPath);
      parent?.children?.push(node);
    }
  }

  return root;
};

export const FileTree = ({ items, owner, repo, branch, onDuplicate }: FileTreeProps) => {
  const tree = buildTree(items);

  const initialExpanded = useMemo(() => {
    const contentDir = detectContentDir(items);
    return contentDir ? getExpandedPaths(contentDir) : new Set<string>();
  }, [items]);

  return (
    <div className="space-y-0.5">
      {tree.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          owner={owner}
          repo={repo}
          branch={branch}
          initialExpanded={initialExpanded}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
};
