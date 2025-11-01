// filepath: src/components/editor/RichTextEditor.tsx
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useEditor, EditorContent } from "@tiptap/react";
import { Table } from "@tiptap/extension-table";
import { Color } from "@tiptap/extension-color";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import { RomanOrderedList } from "./extensions/RomanOrderedList";
import { Toolbar } from "./ToolBar";
import { useEffect } from "react";

const cleanPastedHtml = (html: string): string => {
  let cleanedHtml = html.replace(/class="[^"]*"/g, "");
  cleanedHtml = cleanedHtml.replace(
    /style="((?!(text-align|border|width|background-color))[^"]*)"/g,
    ""
  );
  cleanedHtml = cleanedHtml.replace(/<o:p>&nbsp;<\/o:p>/g, "");
  cleanedHtml = cleanedHtml.replace(/<o:p><\/o:p>/g, "");
  cleanedHtml = cleanedHtml.replace(/<\/?\w+:[^>]*>/g, "");
  cleanedHtml = cleanedHtml.replace(/<!--[\s\S]*?-->/g, "");

  return cleanedHtml;
};

interface RichTextEditorProps {
  content: string;
  onChange: (newContent: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "bullet-list",
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "ordered-list",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "list-item",
          },
        },
        paragraph: {
          HTMLAttributes: {
            style: "text-align: justify",
          },
        },
      }),
      RomanOrderedList,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "justify",
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
        protocols: ["http", "https", "mailto"],
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Color.configure({
        types: ["textStyle"],
      }),
      TextStyle,
      FontSize,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "prose prose-lg focus:outline-none w-full",
      },
      transformPastedHTML(html) {
        return cleanPastedHtml(html);
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // ✅ 2. Añadir el hook useEffect para sincronizar el editor
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const editorContent = editor.getHTML();
      // Comparamos el contenido actual del editor con el que viene de las props.
      // Si son diferentes, actualizamos el editor para reflejar el cambio externo (como la importación).
      if (content !== editorContent) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col border-t w-full overflow-hidden">
      <Toolbar editor={editor} />
      <div className="tiptap-editor overflow-hidden w-full">
        <EditorContent editor={editor} className="w-full" />
      </div>
    </div>
  );
};
