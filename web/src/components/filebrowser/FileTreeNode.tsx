import { useState } from "react";
import { useNavigate } from "react-router";
import { Copy, Loader2 } from "lucide-react";
import { FileIcon } from "./FileIcon";
import { apiClient } from "@/api/client";

interface TreeNode {
  name: string;
  path: string;
  type: "blob" | "tree";
  children?: TreeNode[];
}

interface FileTreeNodeProps {
  node: TreeNode;
  owner: string;
  repo: string;
  branch: string;
  depth?: number;
  initialExpanded?: Set<string>;
  onDuplicate?: () => void;
}

const EDITABLE_EXTENSIONS = new Set(["md", "mdx", "html", "htm", "astro"]);
const DUPLICATABLE_EXTENSIONS = new Set(["md", "mdx"]);

const isEditable = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return EDITABLE_EXTENSIONS.has(ext);
};

const isDuplicatable = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return DUPLICATABLE_EXTENSIONS.has(ext);
};

const getDuplicatePath = (path: string) => {
  const lastDot = path.lastIndexOf(".");
  const base = path.slice(0, lastDot);
  const ext = path.slice(lastDot);
  return `${base}-copy${ext}`;
};

export const FileTreeNode = ({ node, owner, repo, branch, depth = 0, initialExpanded, onDuplicate }: FileTreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(initialExpanded?.has(node.path) ?? false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const navigate = useNavigate();
  const isDir = node.type === "tree";
  const canDuplicate = !isDir && isDuplicatable(node.name);

  const handleClick = () => {
    if (isDir) {
      setIsOpen(!isOpen);
      return;
    }
    if (isEditable(node.name)) {
      navigate(`/repos/${owner}/${repo}/edit/${node.path}?branch=${branch}`);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDuplicating) return;

    setIsDuplicating(true);
    try {
      const file = await apiClient<{ content: string }>(
        `/api/github/repos/${owner}/${repo}/contents/${node.path}?ref=${branch}`
      );

      const newPath = getDuplicatePath(node.path);
      await apiClient(`/api/github/repos/${owner}/${repo}/contents/${newPath}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `Duplicate ${node.name}`,
          content: file.content,
          branch,
        }),
      });

      onDuplicate?.();
    } catch (err) {
      console.error("Failed to duplicate file:", err);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div>
      <div
        className={`group flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm transition-colors hover:bg-accent ${
          !isDir && isEditable(node.name) ? "font-medium" : ""
        } ${!isDir && !isEditable(node.name) ? "text-muted-foreground" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button onClick={handleClick} className="flex min-w-0 flex-1 items-center gap-2">
          <FileIcon name={node.name} isDirectory={isDir} isOpen={isOpen} />
          <span className="truncate">{node.name}</span>
        </button>
        {canDuplicate && (
          <button
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-accent-foreground/10 group-hover:opacity-100"
            title="Duplicate file"
          >
            {isDuplicating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {isDir && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              owner={owner}
              repo={repo}
              branch={branch}
              depth={depth + 1}
              initialExpanded={initialExpanded}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export type { TreeNode };
