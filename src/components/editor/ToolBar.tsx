import { type Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table,
  ChevronDown,
  Trash2,
  Columns,
  Rows,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

interface ToolBarProps {
  editor: Editor | null;
}

// ✅ Tamaños de fuente como en Word
const FONT_SIZES = [
  { label: "8", value: "8px" },
  { label: "9", value: "9px" },
  { label: "10", value: "10px" },
  { label: "11", value: "11px" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "22", value: "22px" },
  { label: "24", value: "24px" },
  { label: "26", value: "26px" },
  { label: "28", value: "28px" },
  { label: "36", value: "36px" },
  { label: "48", value: "48px" },
  { label: "72", value: "72px" },
];

export const ToolBar = ({ editor }: ToolBarProps) => {
  const [isTableActive, setIsTableActive] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const updateTableState = () => {
      setIsTableActive(editor.isActive("table"));
    };

    // ✅ Actualizar cuando cambie la selección
    editor.on("selectionUpdate", updateTableState);
    editor.on("transaction", updateTableState);

    // Estado inicial
    updateTableState();

    return () => {
      editor.off("selectionUpdate", updateTableState);
      editor.off("transaction", updateTableState);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  // ✅ Obtener el tamaño actual de fuente
  const getCurrentFontSize = () => {
    const fontSize = editor.getAttributes("textStyle").fontSize;
    if (!fontSize) return "11"; // Default
    return fontSize.replace("px", "");
  };

  return (
    <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
      {/* Selector de tamaño de fuente */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-20 justify-between">
            <span>{getCurrentFontSize()}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-[300px] overflow-y-auto"
        >
          {FONT_SIZES.map((size) => (
            <DropdownMenuItem
              key={size.value}
              onClick={() =>
                editor.chain().focus().setFontSize(size.value).run()
              }
              className={getCurrentFontSize() === size.label ? "bg-accent" : ""}
            >
              <span style={{ fontSize: size.value }}>{size.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-8" />

      {/* Formato de texto */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-8" />

      {/* Alineación */}
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "left" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("left").run()
        }
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "center" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("center").run()
        }
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "right" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("right").run()
        }
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "justify" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("justify").run()
        }
      >
        <AlignJustify className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-8" />

      {/* Listas */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("romanOrderedList")}
        onPressedChange={() =>
          editor.chain().focus().toggleRomanOrderedList().run()
        }
      >
        <span className="text-xs font-semibold">I.</span>
      </Toggle>

      <Separator orientation="vertical" className="h-8" />

      {/* ✅ Controles de Tabla */}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        disabled={isTableActive}
      >
        <Table className="h-4 w-4 mr-1" />
        <span className="text-xs">Insertar</span>
      </Button>

      {isTableActive && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            <Columns className="h-4 w-4 mr-1" />
            <span className="text-xs">+ Col Izq</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <Columns className="h-4 w-4 mr-1" />
            <span className="text-xs">+ Col Der</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-xs">- Col</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().addRowBefore().run()}
          >
            <Rows className="h-4 w-4 mr-1" />
            <span className="text-xs">+ Fila Arriba</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <Rows className="h-4 w-4 mr-1" />
            <span className="text-xs">+ Fila Abajo</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-xs">- Fila</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().mergeCells().run()}
            disabled={!editor.can().mergeCells()}
            title="Selecciona varias celdas para combinarlas"
          >
            <span className="text-xs">Combinar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().splitCell().run()}
            disabled={!editor.can().splitCell()}
            title="Divide una celda previamente combinada"
          >
            <span className="text-xs">Dividir</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Eliminar Tabla</span>
          </Button>
        </>
      )}

      <div className="flex-1" />
    </div>
  );
};
