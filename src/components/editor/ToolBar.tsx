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
  Palette,
  X,
  Baseline,
  Grid2X2,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Input } from "../ui/input";
import { parseInlineStyle } from "../editor/utils/elevateCellInLineStyles";

interface ToolBarProps {
  editor: Editor | null;
}

const FONT_SIZES = [
  { label: "8", value: "8pt" },
  { label: "9", value: "9pt" },
  { label: "10", value: "10pt" },
  { label: "11", value: "11pt" },
  { label: "12", value: "12pt" },
  { label: "14", value: "14pt" },
  { label: "16", value: "16pt" },
  { label: "18", value: "18pt" },
  { label: "20", value: "20pt" },
  { label: "24", value: "24pt" },
  { label: "36", value: "36pt" },
  { label: "48", value: "48pt" },
  { label: "72", value: "72pt" },
];

const BORDER_WIDTHS = [
  { label: "1/4 pto", value: 0.25 },
  { label: "1/2 pto", value: 0.5 },
  { label: "3/4 pto", value: 0.75 },
  { label: "1 pto", value: 1 },
  { label: "1 1/2 pto", value: 1.5 },
  { label: "2 1/4 pto", value: 2.25 },
  { label: "3 pto", value: 3 },
  { label: "4 1/2 pto", value: 4.5 },
  { label: "6 pto", value: 6 },
];

const capitalize = (s: string) => {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const ToolBar = ({ editor }: ToolBarProps) => {
  const [isTableActive, setIsTableActive] = useState(false);
  const [sizeInput, setSizeInput] = useState("11");
  const colorInputRef = useRef<HTMLInputElement>(null);
  const textColorInputRef = useRef<HTMLInputElement>(null);

  const [borderSide, setBorderSide] = useState("all");
  const [borderWidth, setBorderWidth] = useState(0.75);
  const [borderColor, setBorderColor] = useState("#000000");

  const [activeAlignment, setActiveAlignment] = useState("left");

  useEffect(() => {
    if (!editor) return;

    const updateStates = () => {
      setIsTableActive(editor.isActive("table"));

      if (editor.isActive({ textAlign: "center" })) {
        setActiveAlignment("center");
      } else if (editor.isActive({ textAlign: "right" })) {
        setActiveAlignment("right");
      } else if (editor.isActive({ textAlign: "justify" })) {
        setActiveAlignment("justify");
      } else {
        setActiveAlignment("left");
      }

      const fontSize = editor.getAttributes("textStyle").fontSize;
      if (fontSize && fontSize.endsWith("pt")) {
        setSizeInput(fontSize.replace("pt", ""));
      } else {
        setSizeInput("11");
      }
    };

    editor.on("selectionUpdate", updateStates);
    editor.on("transaction", updateStates);
    updateStates();

    return () => {
      editor.off("selectionUpdate", updateStates);
      editor.off("transaction", updateStates);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const AlignmentIcon = () => {
    if (activeAlignment === "center")
      return <AlignCenter className="h-4 w-4" />;
    if (activeAlignment === "right") return <AlignRight className="h-4 w-4" />;
    if (activeAlignment === "justify")
      return <AlignJustify className="h-4 w-4" />;
    return <AlignLeft className="h-4 w-4" />;
  };

  const applyFontSize = (sizeStr: string) => {
    const size = parseInt(sizeStr, 10);
    if (size > 0 && size <= 100) {
      if (size === 11) {
        editor.chain().focus().unsetFontSize().run();
      } else {
        editor.chain().focus().setFontSize(`${size}pt`).run();
      }
    } else if (sizeStr === "") {
      editor.chain().focus().unsetFontSize().run();
      setSizeInput("11");
    }
  };

  const handleSizeInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFontSize(e.currentTarget.value);
      editor.commands.focus();
    }
  };

  const handleSizeInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    applyFontSize(e.currentTarget.value);
  };

  const setTextColor = (color: string) => {
    if (!editor) return;
    if (color === "" || color === "#000000") {
      editor.chain().focus().unsetColor().run();
      if (textColorInputRef.current)
        textColorInputRef.current.value = "#000000";
    } else {
      editor.chain().focus().setColor(color).run();
    }
  };

  const mergeCellStyle = (newStyles: Record<string, string | null>) => {
    if (!editor) return;
    const currentAttributes = editor.getAttributes("tableCell");
    const styleObject = parseInlineStyle(currentAttributes.style || "");
    const updatedStyle = { ...styleObject, ...newStyles };
    for (const key in updatedStyle) {
      if (
        updatedStyle[key] === null ||
        updatedStyle[key] === undefined ||
        updatedStyle[key] === ""
      ) {
        delete updatedStyle[key];
      }
    }
    const newStyleString = Object.entries(updatedStyle)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
    editor
      .chain()
      .focus()
      .updateAttributes("tableCell", { style: newStyleString })
      .run();
  };

  const setCellBackgroundColor = (color: string) => {
    if (color === "" || color === "#000000") {
      mergeCellStyle({ "background-color": null });
      if (colorInputRef.current) colorInputRef.current.value = "#000000";
    } else {
      mergeCellStyle({ "background-color": color });
    }
  };

  const handleApplyBorder = (
    side = borderSide,
    width = borderWidth,
    color = borderColor
  ) => {
    const borderValue = `${width}pt solid ${color}`;

    const currentStyles = parseInlineStyle(
      editor.getAttributes("tableCell").style || ""
    );

    currentStyles["border"] = "";
    currentStyles["border-top"] = "";
    currentStyles["border-right"] = "";
    currentStyles["border-bottom"] = "";
    currentStyles["border-left"] = "";

    if (side === "all") {
      currentStyles["border"] = borderValue;
    } else {
      currentStyles[`border-${side}`] = borderValue;
    }

    mergeCellStyle(currentStyles);
  };

  const handleClearBorders = () => {
    mergeCellStyle({
      border: null,
      "border-top": null,
      "border-right": null,
      "border-bottom": null,
      "border-left": null,
    });
  };

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5">
        <div className="flex items-center h-8 w-20 border rounded-md overflow-hidden shadow-none">
          <Input
            type="number"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={handleSizeInputKeyDown}
            onBlur={handleSizeInputBlur}
            className="h-full w-12 border-none shadow-none focus-visible:ring-0 px-1.5 text-xs"
            min="1"
            max="100"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-full w-8 p-0 border-l rounded-l-none rounded-r-md"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-[300px] overflow-y-auto w-20"
            >
              {FONT_SIZES.map((size) => (
                <DropdownMenuItem
                  key={size.value}
                  onClick={() => applyFontSize(size.label)}
                  className={sizeInput === size.label ? "bg-accent" : ""}
                >
                  {size.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            className="h-8 w-8 p-0"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            title="Negrita (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            className="h-8 w-8 p-0"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            title="Cursiva (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            className="h-8 w-8 p-0"
            pressed={editor.isActive("underline")}
            onPressedChange={() =>
              editor.chain().focus().toggleUnderline().run()
            }
            title="Subrayado (Ctrl+U)"
          >
            <Underline className="h-3.5 w-3.5" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex items-center gap-0.5">
          <div
            className="flex items-center gap-0.5 ml-1"
            title="Color de texto"
          >
            <Baseline className="h-4 w-4 text-muted-foreground" />
            <Input
              type="color"
              ref={textColorInputRef}
              className="h-6 w-10 ml-1 p-1 rounded-sm cursor-pointer shadow-none"
              value={editor.getAttributes("textStyle").color || "#000000"}
              onInput={(e) => setTextColor(e.currentTarget.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              title="Restablecer color de texto"
              onClick={() => setTextColor("")}
            >
              <X className="h-2 w-2" />
            </Button>
          </div>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Alineación"
            >
              <AlignmentIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              value={activeAlignment}
              onValueChange={(value) =>
                editor.chain().focus().setTextAlign(value).run()
              }
            >
              <DropdownMenuRadioItem value="left">
                <AlignLeft className="mr-2 h-4 w-4" />
                Izquierda
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="center">
                <AlignCenter className="mr-2 h-4 w-4" />
                Centro
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="right">
                <AlignRight className="mr-2 h-4 w-4" />
                Derecha
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="justify">
                <AlignJustify className="mr-2 h-4 w-4" />
                Justificado
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Listas"
            >
              <List className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onSelect={() => editor.chain().focus().toggleBulletList().run()}
              data-active={editor.isActive("bulletList")}
            >
              <List className="mr-2 h-4 w-4" />
              Lista de viñetas
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => editor.chain().focus().toggleOrderedList().run()}
              data-active={editor.isActive("orderedList")}
            >
              <ListOrdered className="mr-2 h-4 w-4" />
              Lista numerada
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                editor.chain().focus().toggleRomanOrderedList().run()
              }
              data-active={editor.isActive("romanOrderedList")}
            >
              <Hash className="mr-2 h-4 w-4" />
              Lista romana
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1"
              disabled={isTableActive}
              title="Insertar tabla"
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
      </div>

      {isTableActive && (
        <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-t bg-muted/30">
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
                editor
                  .chain()
                  .focus()
                  .setCellAttribute("valign", "middle")
                  .run()
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
                editor
                  .chain()
                  .focus()
                  .setCellAttribute("valign", "bottom")
                  .run()
              }
            >
              <AlignEndVertical className="h-4 w-4" />
            </Toggle>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div
            className="flex items-center gap-1"
            title="Color de fondo de celda"
          >
            <Palette className="h-4 w-4 text-muted-foreground ml-1" />
            <Input
              type="color"
              ref={colorInputRef}
              className="h-7 w-10 p-1 rounded-sm cursor-pointer"
              defaultValue="#000000"
              onInput={(e) => setCellBackgroundColor(e.currentTarget.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Limpiar color de fondo"
              onClick={() => setCellBackgroundColor("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Configurar bordes"
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Lado: {capitalize(borderSide)}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {[
                    { label: "Todos", value: "all" },
                    { label: "Superior", value: "top" },
                    { label: "Derecho", value: "right" },
                    { label: "Inferior", value: "bottom" },
                    { label: "Izquierdo", value: "left" },
                  ].map((side) => (
                    <DropdownMenuItem
                      key={side.value}
                      onSelect={() => {
                        setBorderSide(side.value);
                        handleApplyBorder(side.value, borderWidth, borderColor);
                      }}
                    >
                      {side.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>
                    Grosor:{" "}
                    {BORDER_WIDTHS.find((w) => w.value === borderWidth)
                      ?.label || `${borderWidth}pt`}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {BORDER_WIDTHS.map((width) => (
                    <DropdownMenuItem
                      key={width.value}
                      onSelect={() => {
                        setBorderWidth(width.value);
                        handleApplyBorder(borderSide, width.value, borderColor);
                      }}
                    >
                      {width.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <div
                className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none"
                onSelect={(e) => e.preventDefault()}
              >
                <span>Color:</span>
                <Input
                  type="color"
                  className="h-6 w-10 p-0.5 rounded-sm cursor-pointer ml-auto"
                  value={borderColor}
                  onInput={(e) => {
                    const newColor = e.currentTarget.value;
                    setBorderColor(newColor);
                    handleApplyBorder(borderSide, borderWidth, newColor);
                  }}
                />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={handleClearBorders}
              >
                <X className="mr-2 h-4 w-4" />
                <span>Quitar Bordes</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Grupo: Estructura de Tabla */}
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
        </div>
      )}
    </div>
  );
};
