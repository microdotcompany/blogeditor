import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useBlocker } from "react-router";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Settings, Loader2, Eye, Code } from "lucide-react";
import { apiClient, ApiError } from "@/api/client";
import { useFileContent } from "@/hooks/useFileContent";
import { useCommit } from "@/hooks/useCommit";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useImageConfig } from "@/hooks/useImageConfig";
import { useBranches } from "@/hooks/useBranches";
import { useEditorDraft } from "@/hooks/useEditorDraft";
import { BlogEditor } from "@/components/editor/BlogEditor";
import { FrontmatterEditor } from "@/components/editor/FrontmatterEditor";
import { CommitDialog } from "@/components/editor/CommitDialog";
import { ImageUploadModal } from "@/components/editor/ImageUploadModal";
import { ImageGenerateModal } from "@/components/editor/ImageGenerateModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { parseFrontmatter, serializeFrontmatter } from "@/lib/frontmatter";
import type { GitHubRepo } from "@blogeditor/shared";

const CONTENT_PREFIXES = [
  "src/content/",
  "content/",
  "src/pages/",
  "pages/",
  "_posts/",
];

const deriveArticleUrl = (homepage: string, path: string, frontmatter: Record<string, unknown>): string => {
  const slug = frontmatter.slug as string | undefined;
  if (slug) {
    const base = homepage.replace(/\/$/, "");
    const slugPath = slug.startsWith("/") ? slug : `/${slug}`;
    return `${base}${slugPath}`;
  }

  let stripped = path;
  for (const prefix of CONTENT_PREFIXES) {
    if (stripped.startsWith(prefix)) {
      stripped = stripped.slice(prefix.length);
      break;
    }
  }

  stripped = stripped.replace(/\.(md|mdx|astro|html)$/, "");
  stripped = stripped.replace(/\/index$/, "");

  const base = homepage.replace(/\/$/, "");
  const basePath = new URL(base).pathname.replace(/^\//, "");
  if (basePath && stripped.startsWith(basePath + "/")) {
    stripped = stripped.slice(basePath.length + 1);
  }
  return `${base}/${stripped}`;
};

export const EditorPage = () => {
  const { owner, repo, "*": filePath } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const branch = searchParams.get("branch") || "main";

  const { content, sha, setSha, isLoading, error, refetch } = useFileContent(
    owner!,
    repo!,
    branch,
    filePath!
  );
  const { commit, isCommitting } = useCommit();
  const { upload, isUploading } = useImageUpload();
  const imageConfig = useImageConfig(owner!, repo!, branch);
  const { branches, fetchBranches, createBranch } = useBranches();
  const { loadDraft, saveDraft, saveDraftImmediate, clearDraft } = useEditorDraft(
    owner!, repo!, branch, filePath!
  );
  const [homepage, setHomepage] = useState<string | null>(null);

  useEffect(() => {
    if (!owner || !repo) return;
    fetchBranches(owner, repo);
    apiClient<GitHubRepo>(`/api/github/repos/${owner}/${repo}`).then(
      (data) => setHomepage(data.homepage)
    );
  }, [owner, repo, fetchBranches]);

  const [editor, setEditor] = useState<Editor | null>(null);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAiImageModal, setShowAiImageModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<"visual" | "raw">("visual");
  const [rawContent, setRawContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const imageUrlMap = useRef(new Map<string, string>());

  const isMarkdown = filePath?.endsWith(".md") || filePath?.endsWith(".mdx") || false;
  const isAstro = filePath?.endsWith(".astro") || false;
  const hasFrontmatter = isMarkdown || isAstro;

  const parsed = useMemo(() => {
    if (!hasFrontmatter) return { frontmatter: {}, body: content };
    return parseFrontmatter(content);
  }, [content, hasFrontmatter]);

  // Working body: tracks editor body across mode switches and drafts.
  // null = use parsed.body from fetch (no draft / no edits yet)
  const [workingBody, setWorkingBody] = useState<string | null>(null);

  const frontmatterRef = useRef<Record<string, unknown>>(parsed.frontmatter);
  frontmatterRef.current = frontmatterRef.current === parsed.frontmatter
    ? parsed.frontmatter
    : frontmatterRef.current;

  const [lastContent, setLastContent] = useState(content);
  if (content !== lastContent) {
    frontmatterRef.current = parsed.frontmatter;
    setWorkingBody(null);
    setLastContent(content);
  }

  // Load draft from localStorage on mount (once content is fetched)
  const draftLoadedRef = useRef(false);
  useEffect(() => {
    if (isLoading || draftLoadedRef.current) return;
    draftLoadedRef.current = true;
    const draft = loadDraft();
    if (draft && draft !== content) {
      const { frontmatter, body } = parseFrontmatter(draft);
      if (hasFrontmatter && Object.keys(frontmatter).length > 0) {
        frontmatterRef.current = frontmatter;
      }
      setWorkingBody(body);
      setHasChanges(true);
    }
  }, [isLoading, content, loadDraft, hasFrontmatter]);

  const editorBody = workingBody ?? parsed.body;

  const handleFrontmatterChange = useCallback((data: Record<string, unknown>) => {
    frontmatterRef.current = data;
    setFmVersion((v) => v + 1);
    setHasChanges(true);
  }, []);

  const [fmVersion, setFmVersion] = useState(0);

  const rewriteImageUrls = useCallback((text: string) => {
    let result = text;
    for (const [displayUrl, contentUrl] of imageUrlMap.current) {
      result = result.replaceAll(displayUrl, contentUrl);
    }
    return result;
  }, []);

  const getEditorBody = useCallback(() => {
    if (!editor) return "";
    return isMarkdown
      ? editor.storage.markdown.getMarkdown()
      : editor.getHTML();
  }, [editor, isMarkdown]);

  const switchMode = useCallback((next: "visual" | "raw") => {
    if (next === mode) return;
    if (next === "raw") {
      const body = rewriteImageUrls(getEditorBody());
      let raw: string;
      if (hasFrontmatter && Object.keys(frontmatterRef.current).length > 0) {
        raw = serializeFrontmatter(frontmatterRef.current, body);
      } else {
        raw = body;
      }
      setRawContent(raw);
      saveDraftImmediate(raw);
    } else {
      // raw → visual: update workingBody so BlogEditor mounts with correct content
      const { frontmatter, body } = parseFrontmatter(rawContent);
      if (hasFrontmatter && Object.keys(frontmatter).length > 0) {
        frontmatterRef.current = frontmatter;
        setFmVersion((v) => v + 1);
      }
      setWorkingBody(body);
      saveDraftImmediate(rawContent);
      editorMountedRef.current = false;
    }
    setMode(next);
  }, [mode, rawContent, hasFrontmatter, getEditorBody, rewriteImageUrls, saveDraftImmediate]);

  const getFullContent = useCallback(() => {
    if (mode === "raw") return rewriteImageUrls(rawContent);

    const body = getEditorBody();
    const rewritten = rewriteImageUrls(body);

    if (!hasFrontmatter || Object.keys(frontmatterRef.current).length === 0) {
      return rewritten;
    }
    return serializeFrontmatter(frontmatterRef.current, rewritten);
  }, [mode, rawContent, getEditorBody, hasFrontmatter, rewriteImageUrls]);

  // Skip the programmatic setContent onUpdate that fires when BlogEditor mounts
  const editorMountedRef = useRef(false);

  // Save draft to localStorage on visual-mode edits
  const handleEditorUpdate = useCallback(() => {
    if (!editorMountedRef.current) {
      editorMountedRef.current = true;
      return;
    }
    setHasChanges(true);
    const body = getEditorBody();
    if (!body) return;
    const full = hasFrontmatter && Object.keys(frontmatterRef.current).length > 0
      ? serializeFrontmatter(frontmatterRef.current, body)
      : body;
    saveDraft(full);
  }, [getEditorBody, hasFrontmatter, saveDraft]);

  // Save draft to localStorage on raw-mode edits
  const handleRawChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setRawContent(val);
      setHasChanges(true);
      saveDraft(val);
    },
    [saveDraft],
  );

  // Navigation guard: useBlocker
  const blocker = useBlocker(hasChanges);

  // Browser tab close / refresh guard
  useEffect(() => {
    if (!hasChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  const doUpload = useCallback(
    async (file: File) => {
      if (!imageConfig) throw new Error("Image config not ready");
      const { displayUrl, contentUrl } = await upload({
        owner: owner!,
        repo: repo!,
        branch,
        file,
        uploadDir: imageConfig.uploadDir,
        urlPrefix: imageConfig.urlPrefix,
      });
      imageUrlMap.current.set(displayUrl, contentUrl);
      return { displayUrl, contentUrl };
    },
    [upload, owner, repo, branch, imageConfig]
  );

  const handleCommit = async (message: string, targetBranch: string, isNewBranch: boolean) => {
    try {
      let commitSha = sha;

      if (isNewBranch) {
        await createBranch(owner!, repo!, targetBranch, branch);
      } else if (targetBranch !== branch) {
        try {
          const res = await apiClient<{ sha: string }>(
            `/api/github/repos/${owner}/${repo}/contents/${filePath}?ref=${targetBranch}`
          );
          commitSha = res.sha;
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            commitSha = "";
          } else {
            throw err;
          }
        }
      }

      const result = await commit({
        owner: owner!,
        repo: repo!,
        path: filePath!,
        content: getFullContent(),
        message,
        sha: commitSha,
        branch: targetBranch,
      });
      setSha(result!.content.sha);
      clearDraft();
      setHasChanges(false);
      setShowCommitDialog(false);
      toast.success("Changes committed successfully");
      fetchBranches(owner!, repo!);
    } catch {
      toast.error("Failed to commit changes");
    }
  };

  const handleImageUpload = async (file: File, alt: string) => {
    try {
      const { displayUrl } = await doUpload(file);
      editor?.chain().focus().setImage({ src: displayUrl, alt }).run();
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    }
  };

  const handleDropUpload = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        const { displayUrl } = await doUpload(file);
        toast.success("Image uploaded");
        return displayUrl;
      } catch {
        toast.error("Failed to upload image");
        return null;
      }
    },
    [doUpload]
  );

  const handleAiImageInsert = async (imageUrl: string, alt: string) => {
    if (!imageConfig) throw new Error("Image config not ready");

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const filename = `ai-${Date.now()}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    const { displayUrl } = await doUpload(file);
    editor?.chain().focus().setImage({ src: displayUrl, alt }).run();
    toast.success("AI image inserted");
  };

  const getAiImageContext = useCallback((): string => {
    if (!editor) return "";

    const { doc, selection } = editor.state;
    const cursorPos = selection.from;

    let nearestHeading = "";
    let surroundingText = "";

    doc.nodesBetween(0, doc.content.size, (node, pos) => {
      if (node.type.name === "heading" && pos < cursorPos) {
        nearestHeading = node.textContent;
      }
    });

    const $pos = doc.resolve(cursorPos);
    const parentNode = $pos.parent;
    if (parentNode.isTextblock && parentNode.textContent.trim()) {
      surroundingText = parentNode.textContent.trim();
    }

    if (!surroundingText && !nearestHeading) {
      const blockIndex = $pos.index($pos.depth - 1);
      const parentOfBlock = $pos.node($pos.depth - 1);
      for (let i = blockIndex - 1; i >= Math.max(0, blockIndex - 3); i--) {
        const sibling = parentOfBlock.child(i);
        if (sibling.isTextblock && sibling.textContent.trim()) {
          surroundingText = sibling.textContent.trim();
          break;
        }
      }
    }

    if (!nearestHeading && !surroundingText) return "";

    const parts: string[] = [];
    if (nearestHeading) parts.push(`section "${nearestHeading}"`);
    if (surroundingText) {
      const trimmed = surroundingText.length > 200
        ? surroundingText.slice(0, 200) + "..."
        : surroundingText;
      parts.push(`context: "${trimmed}"`);
    }

    return `A blog illustration for a ${parts.join(", ")}. The illustration should be in a clean, minimal, modern style.`;
  }, [editor]);

  const [aiImageDefaultPrompt, setAiImageDefaultPrompt] = useState("");

  const openAiImageModal = useCallback(() => {
    setAiImageDefaultPrompt(getAiImageContext());
    setShowAiImageModal(true);
  }, [getAiImageContext]);

  const handleEditorReady = useCallback((ed: Editor | null) => {
    setEditor(ed);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Navbar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Articles</span>
          </button>
          <span className="text-muted-foreground/40">|</span>
          <span className="max-w-64 truncate text-xs text-muted-foreground">{filePath}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex h-8 items-center rounded-md border bg-muted/50 p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => switchMode("visual")}
                  className={`flex h-7 items-center gap-1.5 rounded-[5px] px-2.5 text-xs transition-colors ${
                    mode === "visual"
                      ? "bg-background font-medium text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Visual
                </button>
              </TooltipTrigger>
              <TooltipContent>WYSIWYG editor</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => switchMode("raw")}
                  className={`flex h-7 items-center gap-1.5 rounded-[5px] px-2.5 text-xs transition-colors ${
                    mode === "raw"
                      ? "bg-background font-medium text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  Raw
                </button>
              </TooltipTrigger>
              <TooltipContent>Edit raw source</TooltipContent>
            </Tooltip>
          </div>

          {homepage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={deriveArticleUrl(homepage, filePath!, frontmatterRef.current)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent>Preview on website</TooltipContent>
            </Tooltip>
          )}

          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={!hasChanges}
            onClick={() => setShowCommitDialog(true)}
          >
            {isCommitting ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : null}
            Commit
          </Button>

          {hasFrontmatter && Object.keys(frontmatterRef.current).length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                    showSettings
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Article Settings</TooltipContent>
            </Tooltip>
          )}
        </div>
      </header>

      {/* Main content area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Editor */}
        <main className="flex-1 overflow-y-auto bg-muted/30 pb-24">
          {mode === "visual" ? (
            <div className="mx-auto max-w-2xl px-6 py-10">
              <BlogEditor
                content={editorBody}
                isMarkdown={isMarkdown}
                onImageClick={() => setShowImageModal(true)}
                onAiImageClick={openAiImageModal}
                aiImageEnabled={owner === "microdotcompany"}
                onImageUpload={handleDropUpload}
                onEditorReady={handleEditorReady}
                onUpdate={handleEditorUpdate}
              />
            </div>
          ) : (
            <div className="mx-auto max-w-4xl px-6 py-6">
              <textarea
                value={rawContent}
                onChange={handleRawChange}
                spellCheck={false}
                className="min-h-[80vh] w-full resize-none rounded-lg border bg-background p-4 font-mono text-sm leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}
        </main>

        {/* Settings sidebar overlay */}
        {showSettings && hasFrontmatter && Object.keys(frontmatterRef.current).length > 0 && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/5"
              onClick={() => setShowSettings(false)}
            />
            <FrontmatterEditor
              key={fmVersion}
              data={frontmatterRef.current}
              onChange={handleFrontmatterChange}
              onClose={() => setShowSettings(false)}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <CommitDialog
        open={showCommitDialog}
        onClose={() => setShowCommitDialog(false)}
        onCommit={handleCommit}
        filePath={filePath!}
        branch={branch}
        branches={branches}
        isCommitting={isCommitting}
      />

      <ImageUploadModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        onUpload={handleImageUpload}
        isUploading={isUploading}
      />

      <ImageGenerateModal
        open={showAiImageModal}
        onClose={() => setShowAiImageModal(false)}
        onInsert={handleAiImageInsert}
        defaultPrompt={aiImageDefaultPrompt}
      />

      {/* Unsaved changes navigation guard */}
      <Dialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => { if (!open) blocker.reset?.(); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have uncommitted edits. Do you want to discard them?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => blocker.reset?.()}>
              Keep editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearDraft();
                blocker.proceed?.();
              }}
            >
              Discard changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
