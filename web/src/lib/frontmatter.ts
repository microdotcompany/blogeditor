import { parse, stringify } from "yaml";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export interface ParsedContent {
  frontmatter: Record<string, unknown>;
  body: string;
}

export const parseFrontmatter = (raw: string): ParsedContent => {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  try {
    const frontmatter = parse(match[1]) as Record<string, unknown>;
    const body = raw.slice(match[0].length);
    return { frontmatter: frontmatter ?? {}, body };
  } catch {
    return { frontmatter: {}, body: raw };
  }
};

export const serializeFrontmatter = (
  frontmatter: Record<string, unknown>,
  body: string
): string => {
  if (Object.keys(frontmatter).length === 0) return body;

  const yaml = stringify(frontmatter, { lineWidth: 0 }).trimEnd();
  return `---\n${yaml}\n---\n${body}`;
};
