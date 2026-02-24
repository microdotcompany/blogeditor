import { useMemo } from "react";
import { diffLines } from "diff";

interface DiffViewerProps {
  originalContent: string;
  newContent: string;
}

export const DiffViewer = ({ originalContent, newContent }: DiffViewerProps) => {
  const diffResult = useMemo(() => {
    return diffLines(originalContent, newContent);
  }, [originalContent, newContent]);

  const hasChanges = diffResult.some((part) => part.added || part.removed);

  if (!hasChanges) {
    return (
      <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
        No changes to commit
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-auto rounded-md border bg-muted/30 font-mono text-xs">
      {diffResult.map((part, index) => {
        const lines = part.value.split("\n");
        // Remove the last empty line that comes from split
        if (lines[lines.length - 1] === "") {
          lines.pop();
        }

        return lines.map((line, lineIndex) => {
          let bgColor = "";
          let textColor = "";
          let prefix = " ";

          if (part.added) {
            bgColor = "bg-green-500/10";
            textColor = "text-green-700 dark:text-green-400";
            prefix = "+";
          } else if (part.removed) {
            bgColor = "bg-red-500/10";
            textColor = "text-red-700 dark:text-red-400";
            prefix = "-";
          } else {
            textColor = "text-muted-foreground";
          }

          return (
            <div
              key={`${index}-${lineIndex}`}
              className={`whitespace-pre px-2 py-0.5 ${bgColor} ${textColor}`}
            >
              <span className="mr-2 inline-block w-3 select-none opacity-60">
                {prefix}
              </span>
              {line || " "}
            </div>
          );
        });
      })}
    </div>
  );
};
