import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";

export const getExtensions = () => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Image.configure({
    HTMLAttributes: {
      class: "rounded-md max-w-full",
    },
  }),
  Table.configure({
    resizable: false,
  }),
  TableRow,
  TableCell,
  TableHeader,
  Placeholder.configure({
    placeholder: "Start writing...",
  }),
  Link.configure({
    openOnClick: false,
  }),
  Markdown.configure({
    html: true,
    transformPastedText: true,
  }),
];
