import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { ToolBar } from "./ToolBar";
import { FontSize } from "./extensions/FontSize";
import { RomanOrderedList } from "./extensions/RomanOrderedList";

const cleanPastedHtml = (html: string): string => {
  // ... (función sin cambios)
  let cleanedHtml = html.replace(/class="[^"]*"/g, "");
  cleanedHtml = cleanedHtml.replace(
    /style="((?!(text-align|border|width|background-color))[^"]*)"/g,
    ""
  );
  cleanedHtml = cleanedHtml.replace(/<o:p>&nbsp;<\/o:p>/g, "");
  cleanedHtml = cleanedHtml.replace(/<o:p><\/o:p>/g, "");
  cleanedHtml = cleanedHtml.replace(/<\/?\w+:[^>]*>/g, "");

  return cleanedHtml;
};

interface RichTextEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  placeholder?: string;
  isReadOnly?: boolean; // ✅ AÑADIR PROP
}

export const RichTextEditor = ({
  content,
  onChange,
  isReadOnly = false, // ✅ RECIBIR PROP
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: {},
      }),
      TextStyle,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      Table.configure({
        resizable: true,
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
    
    // ✅ --- INICIO DE CAMBIOS ---
    editable: !isReadOnly, // El editor se bloquea si isReadOnly es true
    // ✅ --- FIN DE CAMBIOS ---

    editorProps: {
      attributes: {
        class:
          "prose mx-auto focus:outline-none min-h-[500px] px-4 py-2 [&_.ProseMirror]:min-h-[500px] [&_.ProseMirror]:outline-none [&_.ProseMirror-focused]:outline-none [&_.ProseMirror]:hyphens-none [&_.ProseMirror]:word-spacing-normal [&_.ProseMirror]:text-align-justify",
        style: "font-size: 11px;",
      },
      transformPastedHTML(html) {
        let cleaned = cleanPastedHtml(html);
        cleaned = cleaned.replace(/^(<p><\/p>|<p>\s*<\/p>)+/, "");
        return cleaned;
      },
    },
    onUpdate({ editor }) {
      if (!isReadOnly) { // Solo notificar cambios si no está bloqueado
        onChange(editor.getHTML());
      }
    },
    immediatelyRender: false,
  });

  // ✅ Actualizar estado de "editable" si la prop cambia
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!isReadOnly);
    }
  }, [isReadOnly, editor]);

  // Sincronizar contenido (sin cambios)
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
    <div className="border rounded-lg overflow-hidden flex flex-col h-full">
      {/* ✅ Ocultar barra de herramientas si es read-only */}
      {!isReadOnly && <ToolBar editor={editor} />}
      <div className="tiptap-editor overflow-y-auto flex-1 w-full">
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
    </div>
  );
};