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
  Plus,
  Minus,
  Combine,
  SplitSquareHorizontal,
  Hash,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
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

    editor.on("selectionUpdate", updateTableState);
    editor.on("transaction", updateTableState);

    updateTableState();

    return () => {
      editor.off("selectionUpdate", updateTableState);
      editor.off("transaction", updateTableState);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const getCurrentFontSize = () => {
    const fontSize = editor.getAttributes("textStyle").fontSize;
    if (!fontSize) return "11";
    return fontSize.replace("px", "");
  };

  return (
    <div className="border-b bg-background p-1.5 flex items-center gap-0.5 sticky top-0 z-10 ">
      {/* Formato de texto - Más compacto */}
      <div className="flex items-center gap-0.5">
        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-3.5 w-3.5" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Selector de tamaño - Más compacto */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-16 px-2 text-xs">
            {getCurrentFontSize()}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-[300px] overflow-y-auto w-20"
        >
          {FONT_SIZES.map((size) => (
            <DropdownMenuItem
              key={size.value}
              onClick={() => {
                if (size.label === "11") {
                  editor.chain().focus().unsetFontSize().run();
                } else {
                  editor.chain().focus().setFontSize(size.value).run();
                }
              }}
              className={getCurrentFontSize() === size.label ? "bg-accent" : ""}
            >
              {size.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Alineación */}
      <div className="flex items-center gap-0.5">
        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editor.isActive({ textAlign: "left" })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editor.isActive({ textAlign: "center" })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("center").run()
          }
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editor.isActive({ textAlign: "right" })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("right").run()
          }
        >
          <AlignRight className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editor.isActive({ textAlign: "justify" })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("justify").run()
          }
        >
          <AlignJustify className="h-3.5 w-3.5" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />
      {isTableActive && (
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            className="h-8 w-8 p-0"
            title="Alinear Arriba"
            pressed={editor.isActive("tableCell", { valign: "top" })}
            onPressedChange={() =>
              editor.chain().focus().setCellAttribute("valign", "top").run()
            }
          >
            <AlignStartVertical className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            className="h-8 w-8 p-0"
            title="Alinear en Medio"
            pressed={editor.isActive("tableCell", { valign: "middle" })}
            onPressedChange={() =>
              editor.chain().focus().setCellAttribute("valign", "middle").run()
            }
          >
            <AlignCenterVertical className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            className="h-8 w-8 p-0"
            title="Alinear Abajo"
            pressed={editor.isActive("tableCell", { valign: "bottom" })}
            onPressedChange={() =>
              editor.chain().focus().setCellAttribute("valign", "bottom").run()
            }
          >
            <AlignEndVertical className="h-4 w-4" />
          </Toggle>
        </div>
      )}

      {isTableActive && (
        <Separator orientation="vertical" className="h-6 mx-1" />
      )}

      {/* Listas */}
      <div className="flex items-center gap-0.5">
        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0 text-[10px] font-semibold"
          pressed={editor.isActive("romanOrderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleRomanOrderedList().run()
          }
        >
          <Hash className="h-3.5 w-3.5" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Tabla - Menú desplegable */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1"
            disabled={isTableActive}
          >
            <Table className="h-3.5 w-3.5" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            Insertar tabla 3x3
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 2, cols: 2, withHeaderRow: false })
                .run()
            }
          >
            Insertar tabla 2x2
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Controles de tabla cuando está activa */}
      {isTableActive && (
        <>
          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Añadir columna izquierda"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Eliminar columna"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Añadir fila"
            >
              <Plus className="h-3.5 w-3.5 rotate-90" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Eliminar fila"
            >
              <Minus className="h-3.5 w-3.5 rotate-90" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().mergeCells().run()}
              disabled={!editor.can().mergeCells()}
              title="Combinar celdas"
            >
              <Combine className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().splitCell().run()}
              disabled={!editor.can().splitCell()}
              title="Dividir celda"
            >
              <SplitSquareHorizontal className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Eliminar tabla"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
