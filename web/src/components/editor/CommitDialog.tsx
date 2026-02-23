import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CommitDialogProps {
  open: boolean;
  onClose: () => void;
  onCommit: (message: string) => Promise<void>;
  filePath: string;
  branch: string;
  isCommitting: boolean;
}

export const CommitDialog = ({
  open,
  onClose,
  onCommit,
  filePath,
  branch,
  isCommitting,
}: CommitDialogProps) => {
  const filename = filePath.split("/").pop() || filePath;
  const [message, setMessage] = useState(`Update ${filename}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await onCommit(message.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Commit Changes</DialogTitle>
          <DialogDescription>
            Commit to <span className="font-mono text-foreground">{branch}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">File</label>
            <div className="rounded-md bg-muted px-3 py-2 font-mono text-sm">{filePath}</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Commit message</label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your changes..."
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!message.trim() || isCommitting}>
              {isCommitting ? "Committing..." : "Commit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
