import { useEffect } from "react"; // ✅ Agregar import de useEffect
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { ToolBar } from "./ToolBar"; // ✅ Cambiar a named import con llaves
import { FontSize } from "./extensions/FontSize";
import { RomanOrderedList } from "./extensions/RomanOrderedList";

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
  placeholder?: string; // ✅ Agregar placeholder como prop opcional
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: false, // Deshabilitamos la lista ordenada por defecto
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        // ✅ Cambiar de 'justify' a 'left' como predeterminado
        defaultAlignment: "left",
      }),
      Table.configure({
        resizable: true, // ✅ Permitir redimensionar columnas
        HTMLAttributes: {
          class: "tiptap-table",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "tiptap-table-row",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "tiptap-table-header",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "tiptap-table-cell",
        },
      }),
      FontSize,
      RomanOrderedList,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] px-4 py-2 [&_.ProseMirror]:min-h-[500px] [&_.ProseMirror]:outline-none [&_.ProseMirror-focused]:outline-none [&_.ProseMirror]:hyphens-none [&_.ProseMirror]:word-spacing-normal [&_.ProseMirror]:text-align-justify",
      },
      transformPastedHTML(html) {
        return cleanPastedHtml(html);
      },
    },
    // ✅ Eliminar el onUpdate duplicado, solo dejar uno
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // ✅ Sincronizar el editor cuando el contenido cambia desde fuera (importación)
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
    <div className="border rounded-lg overflow-hidden">
      <ToolBar editor={editor} />
      <div className="tiptap-editor overflow-hidden w-full">
        <EditorContent editor={editor} className="w-full" />
      </div>
    </div>
  );
};
