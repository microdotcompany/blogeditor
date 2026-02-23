import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, alt: string) => Promise<void>;
  isUploading: boolean;
}

export const ImageUploadModal = ({ open, onClose, onUpload, isUploading }: ImageUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f?.type.startsWith("image/")) {
        handleFile(f);
      }
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!file) return;
    await onUpload(file, alt);
    setFile(null);
    setAlt("");
    setPreview(null);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFile(null);
      setAlt("");
      setPreview(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>
            Select an image to upload to the repository.
          </DialogDescription>
        </DialogHeader>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragging ? "border-primary bg-accent" : "border-border hover:border-primary/50"
          }`}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-[200px] rounded-md object-contain" />
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              <p>Drop an image here or click to select</p>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        <Input
          placeholder="Alt text (optional)"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
