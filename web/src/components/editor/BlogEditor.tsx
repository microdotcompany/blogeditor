import { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/react";
import { getExtensions } from "./extensions";
import { EditorToolbar } from "./EditorToolbar";
import { createImageUploadPlugin } from "./extensions/ImageUpload";

interface BlogEditorProps {
  content: string;
  isMarkdown: boolean;
  onImageClick: () => void;
  onAiImageClick: () => void;
  onImageUpload: (file: File) => Promise<string | null>;
  onEditorReady: (editor: ReturnType<typeof useEditor>) => void;
}

export const BlogEditor = ({ content, isMarkdown, onImageClick, onAiImageClick, onImageUpload, onEditorReady }: BlogEditorProps) => {
  const imageUploadExtension = useMemo(
    () =>
      Extension.create({
        name: "imageUploadHandler",
        addProseMirrorPlugins() {
          return [createImageUploadPlugin(onImageUpload)];
        },
      }),
    [onImageUpload]
  );

  const editor = useEditor({
    extensions: [...getExtensions(), imageUploadExtension],
    content,
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    onEditorReady(editor);
  }, [editor, onEditorReady]);

  if (!editor) return null;

  return (
    <>
      <EditorContent editor={editor} />
      <EditorToolbar editor={editor} onImageClick={onImageClick} onAiImageClick={onAiImageClick} />
    </>
  );
};
