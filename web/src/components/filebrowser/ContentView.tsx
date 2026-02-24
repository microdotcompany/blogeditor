import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Copy, FileText, FolderOpen, Loader2, Plus } from "lucide-react";
import type { TreeItem } from "@blogeditor/shared";
import { apiClient } from "@/api/client";
import { parseFrontmatter, serializeFrontmatter } from "@/lib/frontmatter";

interface ContentViewProps {
  items: TreeItem[];
  owner: string;
  repo: string;
  branch: string;
  onDuplicate?: () => void;
}

interface ContentFile {
  name: string;
  path: string;
  title: string;
  extension: string;
}

interface ContentGroup {
  directory: string;
  label: string;
  files: ContentFile[];
}

const MD_EXTENSIONS = /\.(md|mdx)$/i;
const IGNORED_FILES = /^readme\.md$/i;

const getDuplicatePath = (path: string): string => {
  const lastDot = path.lastIndexOf(".");
  return `${path.slice(0, lastDot)}-copy${path.slice(lastDot)}`;
};

const toBase64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (b) => String.fromCodePoint(b)).join("");
  return btoa(binString);
};

const generateFilename = (group: ContentGroup): string => {
  const ext = group.files[0]?.extension || "md";
  const existing = new Set(group.files.map((f) => f.name));

  const base = `untitled.${ext}`;
  if (!existing.has(base)) return base;

  for (let i = 1; i < 100; i++) {
    const name = `untitled-${i}.${ext}`;
    if (!existing.has(name)) return name;
  }

  return `untitled-${Date.now()}.${ext}`;
};

const generateDummyFrontmatter = (
  original: Record<string, unknown>
): Record<string, unknown> => {
  const dummy: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(original)) {
    if (typeof value === "string") {
      if (key === "title") {
        dummy[key] = "New Article";
      } else if (
        key.toLowerCase().includes("date") ||
        key === "pubDate" ||
        key === "publishedAt" ||
        key === "createdAt"
      ) {
        dummy[key] = new Date().toISOString().split("T")[0];
      } else if (key === "author") {
        dummy[key] = value;
      } else {
        dummy[key] = "";
      }
    } else if (typeof value === "boolean") {
      dummy[key] = key === "draft" ? true : false;
    } else if (typeof value === "number") {
      dummy[key] = 0;
    } else if (Array.isArray(value)) {
      dummy[key] = [];
    } else if (value instanceof Date) {
      dummy[key] = new Date().toISOString().split("T")[0];
    } else if (typeof value === "object" && value !== null) {
      dummy[key] = {};
    } else {
      dummy[key] = "";
    }
  }

  return dummy;
};

const buildGroups = (items: TreeItem[]): ContentGroup[] => {
  const mdFiles = items.filter(
    (item) =>
      item.type === "blob" &&
      MD_EXTENSIONS.test(item.path) &&
      !IGNORED_FILES.test(item.path.split("/").pop() || "")
  );

  const groupMap = new Map<string, ContentGroup>();

  for (const file of mdFiles) {
    const lastSlash = file.path.lastIndexOf("/");
    const directory = lastSlash === -1 ? "" : file.path.slice(0, lastSlash);
    const filename = lastSlash === -1 ? file.path : file.path.slice(lastSlash + 1);

    if (!groupMap.has(directory)) {
      groupMap.set(directory, {
        directory,
        label: directory || "(root)",
        files: [],
      });
    }

    const ext = filename.split(".").pop() || "";
    groupMap.get(directory)!.files.push({
      name: filename,
      path: file.path,
      title: filename.replace(/\.(md|mdx)$/i, ""),
      extension: ext,
    });
  }

  for (const group of groupMap.values()) {
    group.files.sort((a, b) => b.name.localeCompare(a.name));
  }

  return [...groupMap.values()].sort((a, b) =>
    a.directory.localeCompare(b.directory)
  );
};

const ContentRow = ({
  file,
  owner,
  repo,
  branch,
  onDuplicate,
}: {
  file: ContentFile;
  owner: string;
  repo: string;
  branch: string;
  onDuplicate?: () => void;
}) => {
  const [isDuplicating, setIsDuplicating] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/repos/${owner}/${repo}/edit/${file.path}?branch=${branch}`);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDuplicating) return;
    setIsDuplicating(true);
    try {
      const original = await apiClient<{ content: string }>(
        `/api/github/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`
      );
      const newPath = getDuplicatePath(file.path);
      await apiClient(`/api/github/repos/${owner}/${repo}/contents/${newPath}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `Duplicate ${file.name}`,
          content: original.content,
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
    <div className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50">
      <button
        onClick={handleEdit}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <FileText className="h-4 w-4 shrink-0 text-blue-500" />
        <span className="truncate text-sm font-medium">{file.title}</span>
        <span className="text-xs text-muted-foreground">.{file.extension}</span>
      </button>
      <button
        onClick={handleDuplicate}
        disabled={isDuplicating}
        className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-accent-foreground/10 group-hover:opacity-100"
        title="Duplicate"
      >
        {isDuplicating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
};

const ContentSection = ({
  group,
  owner,
  repo,
  branch,
  onDuplicate,
}: {
  group: ContentGroup;
  owner: string;
  repo: string;
  branch: string;
  onDuplicate?: () => void;
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleNewArticle = async () => {
    if (isCreating || group.files.length === 0) return;
    setIsCreating(true);

    try {
      const templateFile = group.files[0];
      const res = await apiClient<{ content: string }>(
        `/api/github/repos/${owner}/${repo}/contents/${templateFile.path}?ref=${branch}`
      );

      const decoded = decodeURIComponent(
        atob(res.content.replace(/\n/g, ""))
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      );

      const { frontmatter } = parseFrontmatter(decoded);
      const dummyFrontmatter = generateDummyFrontmatter(frontmatter);
      const body = "\nStart writing here...\n";
      const newContent =
        Object.keys(dummyFrontmatter).length > 0
          ? serializeFrontmatter(dummyFrontmatter, body)
          : body;

      const filename = generateFilename(group);
      const newPath = group.directory ? `${group.directory}/${filename}` : filename;

      await apiClient(
        `/api/github/repos/${owner}/${repo}/contents/${newPath}`,
        {
          method: "PUT",
          body: JSON.stringify({
            message: `Create ${filename}`,
            content: toBase64(newContent),
            branch,
          }),
        }
      );

      navigate(`/repos/${owner}/${repo}/edit/${newPath}?branch=${branch}`);
    } catch (err) {
      console.error("Failed to create article:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{group.label}</span>
          <span className="text-xs text-muted-foreground">
            {group.files.length} {group.files.length === 1 ? "file" : "files"}
          </span>
        </div>
        <button
          onClick={handleNewArticle}
          disabled={isCreating}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          {isCreating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          New
        </button>
      </div>
      <div className="divide-y divide-border/50">
        {group.files.map((file) => (
          <ContentRow
            key={file.path}
            file={file}
            owner={owner}
            repo={repo}
            branch={branch}
            onDuplicate={onDuplicate}
          />
        ))}
      </div>
    </div>
  );
};

export const ContentView = ({
  items,
  owner,
  repo,
  branch,
  onDuplicate,
}: ContentViewProps) => {
  const groups = useMemo(() => buildGroups(items), [items]);

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No markdown files found in this repository.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <ContentSection
          key={group.directory}
          group={group}
          owner={owner}
          repo={repo}
          branch={branch}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
};
