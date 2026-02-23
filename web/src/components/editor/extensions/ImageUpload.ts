import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

type ImageUploadHandler = (file: File) => Promise<string | null>;

export const createImageUploadPlugin = (uploadHandler: ImageUploadHandler) =>
  new Plugin({
    key: new PluginKey("imageUpload"),
    props: {
      handleDrop(view: EditorView, event: DragEvent) {
        const file = event.dataTransfer?.files[0];
        if (!file?.type.startsWith("image/")) return false;

        event.preventDefault();

        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
        handleImageFile(view, file, uploadHandler, pos?.pos);
        return true;
      },
      handlePaste(view: EditorView, event: ClipboardEvent) {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith("image/"));
        if (!imageItem) return false;

        event.preventDefault();
        const file = imageItem.getAsFile();
        if (file) handleImageFile(view, file, uploadHandler);
        return true;
      },
    },
  });

const handleImageFile = async (
  view: EditorView,
  file: File,
  uploadHandler: ImageUploadHandler,
  insertPos?: number
) => {
  const url = await uploadHandler(file);
  if (!url) return;

  const { schema } = view.state;
  const node = schema.nodes.image.create({ src: url });
  const pos = insertPos ?? view.state.selection.from;
  const tr = view.state.tr.insert(pos, node);
  view.dispatch(tr);
};
