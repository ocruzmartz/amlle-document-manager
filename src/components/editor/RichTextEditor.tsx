import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TableHeader from "@tiptap/extension-table-header";
import { ToolBar } from "./ToolBar";
import { FontSize } from "./extensions/FontSize";
import { RomanOrderedList } from "./extensions/RomanOrderedList";
import { ExtendedTable } from "./extensions/ExtendedTable";
import { ExtendedTableRow } from "./extensions/ExtendedTableRow";
import { ExtendedTableCell } from "./extensions/ExtendedTableCell";
import { transformTableHtml } from "./utils/transformTableHtml";

interface RichTextEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  placeholder?: string;
  isReadOnly?: boolean;
}

export const RichTextEditor = ({
  content,
  onChange,
  isReadOnly = false,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: {},
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph", "tableCell", "tableHeader"],
        defaultAlignment: "left",
      }),
      ExtendedTable.configure({
        resizable: false,
        HTMLAttributes: {
          class: "tiptap-table",
        },
      }),
      ExtendedTableRow,
      TableHeader,
      ExtendedTableCell.configure({
        HTMLAttributes: {
          class: "tiptap-table-cell",
        },
      }),
      FontSize,
      RomanOrderedList,
    ],
    content,
    editable: !isReadOnly,

    editorProps: {
      attributes: {
        class:
          "prose mx-auto focus:outline-none min-h-[500px] px-4 py-2 [&_.ProseMirror]:min-h-[500px] [&_.ProseMirror]:outline-none [&_.ProseMirror-focused]:outline-none [&_.ProseMirror]:hyphens-none [&_.ProseMirror]:word-spacing-normal [&_.ProseMirror]:text-align-justify",
        style: "font-family: 'MuseoModerno', sans-serif; font-size: 11pt;",
      },
      transformPastedHTML: (html) => {
        return transformTableHtml(html);
      },
    },
    onUpdate({ editor }) {
      if (!isReadOnly) {
        onChange(editor.getHTML());
      }
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!isReadOnly);
    }
  }, [isReadOnly, editor]);

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const editorContent = editor.getHTML();
      if (content !== editorContent) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border-t overflow-hidden flex flex-col h-full">
      {!isReadOnly && <ToolBar editor={editor} />}
      <div className="tiptap-editor overflow-y-auto flex-1 w-full">
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
    </div>
  );
};
