import type { Editor } from "@tiptap/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Table,
  Image,
  Link,
  Bold,
  Italic,
  Strikethrough,
  Sparkles,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor;
  onImageClick: () => void;
  onAiImageClick: () => void;
  aiImageEnabled: boolean;
}

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
          disabled
            ? "cursor-not-allowed text-muted-foreground/40"
            : isActive
              ? "bg-foreground/10 text-foreground"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        }`}
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" sideOffset={8}>
      {tooltip}
    </TooltipContent>
  </Tooltip>
);

const ToolbarSeparator = () => (
  <div className="mx-1 h-5 w-px bg-border" />
);

export const EditorToolbar = ({ editor, onImageClick, onAiImageClick, aiImageEnabled }: EditorToolbarProps) => (
  <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur-sm">
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      isActive={editor.isActive("heading")}
      tooltip="Heading"
    >
      <Heading2 className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarButton
      onClick={() => editor.chain().focus().toggleBold().run()}
      isActive={editor.isActive("bold")}
      tooltip="Bold"
    >
      <Bold className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarButton
      onClick={() => editor.chain().focus().toggleItalic().run()}
      isActive={editor.isActive("italic")}
      tooltip="Italic"
    >
      <Italic className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarButton
      onClick={() => editor.chain().focus().toggleStrike().run()}
      isActive={editor.isActive("strike")}
      tooltip="Strikethrough"
    >
      <Strikethrough className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarSeparator />

    <ToolbarButton
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      isActive={editor.isActive("bulletList")}
      tooltip="Bullet List"
    >
      <List className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarButton
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      isActive={editor.isActive("orderedList")}
      tooltip="Ordered List"
    >
      <ListOrdered className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarButton
      onClick={() => editor.chain().focus().toggleBlockquote().run()}
      isActive={editor.isActive("blockquote")}
      tooltip="Blockquote"
    >
      <Quote className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarButton
      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      isActive={editor.isActive("codeBlock")}
      tooltip="Code Block"
    >
      <Code2 className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarSeparator />

    <ToolbarButton
      onClick={() => editor.chain().focus().setHorizontalRule().run()}
      tooltip="Divider"
    >
      <Minus className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarButton
      onClick={() =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      }
      tooltip="Table"
    >
      <Table className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarButton onClick={onImageClick} tooltip="Upload Image">
      <Image className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarButton
      onClick={onAiImageClick}
      disabled={!aiImageEnabled}
      tooltip={aiImageEnabled ? "AI Generate Image" : "Coming soon"}
    >
      <Sparkles className="h-4 w-4" />
    </ToolbarButton>

    <ToolbarButton
      onClick={() => {
        const url = window.prompt("Enter URL:");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      }}
      isActive={editor.isActive("link")}
      tooltip="Link"
    >
      <Link className="h-4 w-4" />
    </ToolbarButton>
  </div>
);
