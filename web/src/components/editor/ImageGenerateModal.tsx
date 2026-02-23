import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Download } from "lucide-react";
import { apiClient } from "@/api/client";

const ASPECT_RATIOS = ["1:1", "16:9", "4:3", "3:2", "9:16", "3:4"] as const;

interface ImageGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (imageUrl: string, alt: string) => Promise<void>;
  defaultPrompt?: string;
}

export const ImageGenerateModal = ({ open, onClose, onInsert, defaultPrompt }: ImageGenerateModalProps) => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && defaultPrompt) {
      setPrompt(defaultPrompt);
    }
  }, [open, defaultPrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setPreview(null);

    try {
      const data = await apiClient<{ url: string }>("/api/ai/generate-image", {
        method: "POST",
        body: JSON.stringify({ prompt: prompt.trim(), aspect_ratio: aspectRatio }),
      });
      setPreview(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsert = async () => {
    if (!preview) return;
    setIsInserting(true);
    try {
      await onInsert(preview, prompt.trim());
      reset();
      onClose();
    } catch {
      setError("Failed to insert image");
    } finally {
      setIsInserting(false);
    }
  };

  const reset = () => {
    setPrompt("");
    setPreview(null);
    setError(null);
    setAspectRatio("16:9");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  const busy = isGenerating || isInserting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Image
          </DialogTitle>
          <DialogDescription>
            Describe the image you want to create with AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <textarea
              placeholder="A serene mountain landscape at golden hour with soft clouds..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={busy}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
              }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Aspect Ratio
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  disabled={busy}
                  onClick={() => setAspectRatio(ratio)}
                  className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    aspectRatio === ratio
                      ? "border-foreground bg-foreground text-background"
                      : "text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {isGenerating && (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-muted/30">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs">Generating...</span>
              </div>
            </div>
          )}

          {preview && !isGenerating && (
            <div className="overflow-hidden rounded-lg border">
              <img src={preview} alt={prompt} className="w-full object-contain" />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          {preview && !isGenerating ? (
            <>
              <Button variant="outline" onClick={handleGenerate} disabled={busy}>
                Regenerate
              </Button>
              <Button onClick={handleInsert} disabled={busy}>
                {isInserting ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Insert
              </Button>
            </>
          ) : (
            <Button onClick={handleGenerate} disabled={!prompt.trim() || busy}>
              {isGenerating ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              )}
              Generate
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
