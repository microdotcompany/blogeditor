interface FileIconProps {
  name: string;
  isDirectory: boolean;
  isOpen?: boolean;
}

export const FileIcon = ({ name, isDirectory, isOpen }: FileIconProps) => {
  if (isDirectory) {
    return <span className="text-sm">{isOpen ? "\u{1F4C2}" : "\u{1F4C1}"}</span>;
  }

  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "md" || ext === "mdx") return <span className="text-sm text-blue-500">M</span>;
  if (ext === "html" || ext === "htm") return <span className="text-sm text-orange-500">H</span>;

  return <span className="text-sm text-muted-foreground">F</span>;
};
