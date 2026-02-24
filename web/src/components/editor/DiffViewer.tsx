import { useMemo } from "react";
import { diffLines } from "diff";

interface DiffViewerProps {
  originalContent: string;
  newContent: string;
}

const CONTEXT_LINES = 3;

interface DiffLine {
  type: "added" | "removed" | "context";
  content: string;
}

export const DiffViewer = ({ originalContent, newContent }: DiffViewerProps) => {
  const diffResult = useMemo(() => {
    return diffLines(originalContent, newContent);
  }, [originalContent, newContent]);

  const hasChanges = diffResult.some((part) => part.added || part.removed);

  const displayLines = useMemo(() => {
    const allLines: DiffLine[] = [];

    diffResult.forEach((part) => {
      const lines = part.value.split("\n");
      if (lines[lines.length - 1] === "") {
        lines.pop();
      }

      const type: DiffLine["type"] = part.added
        ? "added"
        : part.removed
          ? "removed"
          : "context";

      lines.forEach((line) => {
        allLines.push({ type, content: line });
      });
    });

    const linesToShow = new Set<number>();

    allLines.forEach((line, index) => {
      if (line.type === "added" || line.type === "removed") {
        for (let i = Math.max(0, index - CONTEXT_LINES); i <= Math.min(allLines.length - 1, index + CONTEXT_LINES); i++) {
          linesToShow.add(i);
        }
      }
    });

    const result: (DiffLine | "separator")[] = [];
    let lastIndex = -1;

    Array.from(linesToShow)
      .sort((a, b) => a - b)
      .forEach((index) => {
        if (lastIndex !== -1 && index > lastIndex + 1) {
          result.push("separator");
        }
        result.push(allLines[index]);
        lastIndex = index;
      });

    return result;
  }, [diffResult]);

  if (!hasChanges) {
    return (
      <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
        No changes to commit
      </div>
    );
  }

  return (
    <div className="font-mono text-xs">
      {displayLines.map((item, index) => {
        if (item === "separator") {
          return (
            <div
              key={`sep-${index}`}
              className="border-y border-dashed border-muted-foreground/30 bg-muted/50 px-2 py-1 text-center text-muted-foreground"
            >
              ...
            </div>
          );
        }

        let bgColor = "";
        let textColor = "";
        let prefix = " ";

        if (item.type === "added") {
          bgColor = "bg-green-500/10";
          textColor = "text-green-700 dark:text-green-400";
          prefix = "+";
        } else if (item.type === "removed") {
          bgColor = "bg-red-500/10";
          textColor = "text-red-700 dark:text-red-400";
          prefix = "-";
        } else {
          textColor = "text-muted-foreground";
        }

        return (
          <div
            key={index}
            className={`overflow-hidden text-ellipsis whitespace-nowrap px-2 py-0.5 ${bgColor} ${textColor}`}
            title={item.content}
          >
            <span className="mr-2 inline-block w-3 shrink-0 select-none opacity-60">
              {prefix}
            </span>
            {item.content || " "}
          </div>
        );
      })}
    </div>
  );
};
