import { useState } from "react";
import type { GitHubBranch } from "@blogeditor/shared";
import { ChevronDown, GitBranch, Plus, Check, Undo2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DiffViewer } from "./DiffViewer";

interface CommitDialogProps {
  open: boolean;
  onClose: () => void;
  onCommit: (message: string, targetBranch: string, isNewBranch: boolean) => Promise<void>;
  filePath: string;
  branch: string;
  branches: GitHubBranch[];
  isCommitting: boolean;
  originalContent: string;
  newContent: string;
  onDiscard: () => void;
}

export const CommitDialog = ({
  open,
  onClose,
  onCommit,
  filePath,
  branch,
  branches,
  isCommitting,
  originalContent,
  newContent,
  onDiscard,
}: CommitDialogProps) => {
  const filename = filePath.split("/").pop() || filePath;
  const [message, setMessage] = useState(`Update ${filename}`);
  const [selectedBranch, setSelectedBranch] = useState(branch);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const targetBranch = isCreatingNew ? newBranchName.trim() : selectedBranch;
    if (!targetBranch) return;

    await onCommit(message.trim(), targetBranch, isCreatingNew);
  };

  const handleSelectBranch = (name: string) => {
    setSelectedBranch(name);
    setIsCreatingNew(false);
    setNewBranchName("");
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setNewBranchName("");
  };

  const displayBranch = isCreatingNew
    ? newBranchName || "new branch..."
    : selectedBranch;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Commit Changes</DialogTitle>
          <DialogDescription>
            Commit to <span className="font-mono text-foreground">{displayBranch}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4">
          <div className="space-y-2 shrink-0">
            <label className="text-sm text-muted-foreground">File</label>
            <div className="rounded-md bg-muted px-3 py-2 font-mono text-sm">{filePath}</div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <label className="shrink-0 text-sm text-muted-foreground">Changes</label>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-md border bg-muted/30">
              <DiffViewer originalContent={originalContent} newContent={newContent} />
            </div>
          </div>

          <div className="shrink-0 space-y-2">
            <label className="text-sm text-muted-foreground">Branch</label>
            {isCreatingNew ? (
              <div className="flex gap-2">
                <Input
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="feature/my-branch"
                  autoFocus
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setSelectedBranch(branch);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent/50"
                  >
                    <span className="flex items-center gap-2 font-mono">
                      <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedBranch}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto">
                  {branches.map((b) => (
                    <DropdownMenuItem
                      key={b.name}
                      onClick={() => handleSelectBranch(b.name)}
                      className="font-mono text-xs"
                    >
                      <Check
                        className={`h-3.5 w-3.5 ${b.name === selectedBranch ? "opacity-100" : "opacity-0"}`}
                      />
                      {b.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCreateNew} className="text-xs">
                    <Plus className="h-3.5 w-3.5" />
                    Create new branch...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="shrink-0 space-y-2">
            <label className="text-sm text-muted-foreground">Commit message</label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your changes..."
              autoFocus={!isCreatingNew}
            />
          </div>

          <div className="flex shrink-0 justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => { onClose(); onDiscard(); }}
            >
              <Undo2 className="mr-1.5 h-3.5 w-3.5" />
              Discard
            </Button>
            <div className="flex-1" />
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !message.trim() ||
                isCommitting ||
                (isCreatingNew && !newBranchName.trim())
              }
            >
              {isCommitting ? "Committing..." : "Commit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
