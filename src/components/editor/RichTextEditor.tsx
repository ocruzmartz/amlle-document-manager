// filepath: c:\Users\mosca\Escritorio\HS v2\amlle-document-manager\src\components\editor\RichTextEditor.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { RomanOrderedList } from "./extensions/RomanOrderedList"; // ✅ Importar extensión personalizada
import { Toolbar } from "./ToolBar";

const cleanPastedHtml = (html: string): string => {
  // Elimina clases y estilos específicos de Word/Office
  let cleanedHtml = html.replace(/class="[^"]*"/g, ""); // Elimina todas las clases

  // Elimina atributos de estilo en línea, excepto los de alineación de texto
  cleanedHtml = cleanedHtml.replace(/style="((?!text-align)[^"]*)"/g, "");

  // Elimina etiquetas vacías que no aportan nada, comunes en Word
  cleanedHtml = cleanedHtml.replace(/<o:p>&nbsp;<\/o:p>/g, "");
  cleanedHtml = cleanedHtml.replace(/<o:p><\/o:p>/g, "");

  // Elimina espacios de nombres de XML de Office
  cleanedHtml = cleanedHtml.replace(/<\/?\w+:[^>]*>/g, "");

  // Elimina comentarios de HTML
  cleanedHtml = cleanedHtml.replace(/<!--[^>]*-->/g, "");

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
      }),
      RomanOrderedList, // ✅ Agregar extensión personalizada
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
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
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "max-w-none min-h-[400px] w-full rounded-b-md border-r border-b border-l border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none",
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

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden">
      <Toolbar editor={editor} />
      <div className="tiptap-editor flex-1 overflow-hidden">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
