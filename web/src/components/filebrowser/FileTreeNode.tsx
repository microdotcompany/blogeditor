import { useState } from "react";
import { useNavigate } from "react-router";
import { FileIcon } from "./FileIcon";

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
}

const EDITABLE_EXTENSIONS = new Set(["md", "mdx", "html", "htm", "astro"]);

const isEditable = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return EDITABLE_EXTENSIONS.has(ext);
};

export const FileTreeNode = ({ node, owner, repo, branch, depth = 0, initialExpanded }: FileTreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(initialExpanded?.has(node.path) ?? false);
  const navigate = useNavigate();
  const isDir = node.type === "tree";

  const handleClick = () => {
    if (isDir) {
      setIsOpen(!isOpen);
      return;
    }
    if (isEditable(node.name)) {
      navigate(`/repos/${owner}/${repo}/edit/${node.path}?branch=${branch}`);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm transition-colors hover:bg-accent ${
          !isDir && isEditable(node.name) ? "font-medium" : ""
        } ${!isDir && !isEditable(node.name) ? "text-muted-foreground" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <FileIcon name={node.name} isDirectory={isDir} isOpen={isOpen} />
        <span className="truncate">{node.name}</span>
      </button>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export type { TreeNode };
