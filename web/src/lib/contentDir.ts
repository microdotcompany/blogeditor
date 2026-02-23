import type { TreeItem } from "@blogeditor/shared";

const CONTENT_DIR_PATTERNS = [
  "src/content/blog",
  "src/content/posts",
  "src/content/articles",
  "src/content/docs",
  "src/pages/blog",
  "src/pages/posts",
  "content/posts",
  "content/blog",
  "content/articles",
  "content/docs",
  "_posts",
  "posts",
  "blog",
  "articles",
];

const MD_EXTENSIONS = /\.(md|mdx|astro)$/i;

export const detectContentDir = (tree: TreeItem[]): string | null => {
  const dirs = new Set(
    tree.filter((item) => item.type === "tree").map((item) => item.path)
  );
  const files = tree.filter(
    (item) => item.type === "blob" && MD_EXTENSIONS.test(item.path)
  );

  // Check known patterns first
  for (const pattern of CONTENT_DIR_PATTERNS) {
    if (!dirs.has(pattern)) continue;
    const hasFiles = files.some(
      (f) => f.path.startsWith(pattern + "/") && !f.path.slice(pattern.length + 1).includes("/")
    );
    if (hasFiles) return pattern;
  }

  // Fallback: find the directory with the most md/mdx files (direct children only)
  const dirCounts = new Map<string, number>();
  for (const file of files) {
    const lastSlash = file.path.lastIndexOf("/");
    if (lastSlash === -1) continue;
    const dir = file.path.slice(0, lastSlash);
    dirCounts.set(dir, (dirCounts.get(dir) || 0) + 1);
  }

  let bestDir: string | null = null;
  let bestCount = 0;
  for (const [dir, count] of dirCounts) {
    if (count > bestCount) {
      bestCount = count;
      bestDir = dir;
    }
  }

  return bestCount >= 2 ? bestDir : null;
};

export const getExpandedPaths = (contentDir: string): Set<string> => {
  const paths = new Set<string>();
  const parts = contentDir.split("/");
  for (let i = 1; i <= parts.length; i++) {
    paths.add(parts.slice(0, i).join("/"));
  }
  return paths;
};
