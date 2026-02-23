import type { TreeItem } from "@blogeditor/shared";

export interface ImageConfig {
  uploadDir: string;
  urlPrefix: string;
}

const STRIP_PREFIXES = ["public/", "static/"];

const IMAGE_DIR_CANDIDATES = [
  "public/images",
  "public/blog/images",
  "public/assets/images",
  "static/images",
  "static/assets/images",
  "assets/images",
  "src/assets/images",
  "images",
];

const detectFramework = (paths: string[]): string | null => {
  for (const p of paths) {
    if (/^astro\.config\./.test(p)) return "astro";
    if (/^next\.config\./.test(p)) return "nextjs";
    if (/^svelte\.config\./.test(p)) return "sveltekit";
    if (/^hugo\.(toml|yaml|json)$/.test(p)) return "hugo";
    if (p === "_config.yml" || p === "_config.yaml") return "jekyll";
    if (/^gatsby-config\./.test(p)) return "gatsby";
  }
  return null;
};

const defaultPublicDir = (framework: string | null): string => {
  switch (framework) {
    case "hugo":
    case "sveltekit":
    case "gatsby":
      return "static";
    case "jekyll":
      return "assets";
    default:
      return "public";
  }
};

const toUrlPrefix = (uploadDir: string): string => {
  for (const prefix of STRIP_PREFIXES) {
    if (uploadDir.startsWith(prefix)) {
      return "/" + uploadDir.slice(prefix.length);
    }
  }
  return "/" + uploadDir;
};

export const detectImageConfig = (tree: TreeItem[]): ImageConfig => {
  const paths = tree.map((item) => item.path);
  const framework = detectFramework(paths);

  for (const dir of IMAGE_DIR_CANDIDATES) {
    if (paths.some((p) => p.startsWith(dir + "/"))) {
      return { uploadDir: dir, urlPrefix: toUrlPrefix(dir) };
    }
  }

  const publicDir = defaultPublicDir(framework);
  const uploadDir = `${publicDir}/images`;
  return { uploadDir, urlPrefix: toUrlPrefix(uploadDir) };
};
