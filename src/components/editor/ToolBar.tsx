import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Code,
  Link,
  Image,
  Table,
  Highlighter,
  Undo,
  Redo,
  Type,
  CheckSquare,
  Minus,
  Hash,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type ToolbarProps = {
  editor: Editor | null;
};

export const Toolbar = ({ editor }: ToolbarProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
    }
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run();
  };

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
  };

  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
  };

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run();
  };

  // ✅ CORREGIDO: Ahora no devuelve un valor por defecto para detectar cuándo no hay estilo
  const getCurrentFontSize = () => {
    return editor.getAttributes("textStyle").fontSize;
  };

  return (
    <div className="bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
      {/* Undo/Redo */}
      <div className="flex gap-1 mr-2 border-r pr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Headings y Tamaño de Fuente */}
      <div className="flex gap-1 mr-2 border-r pr-2 items-center">
        <Select
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
              ? "h3"
              : "paragraph"
          }
          onValueChange={(value) => {
            if (value === "paragraph") {
              editor.chain().focus().setParagraph().run();
            } else if (value === "h1") {
              editor.chain().focus().setHeading({ level: 1 }).run();
            } else if (value === "h2") {
              editor.chain().focus().setHeading({ level: 2 }).run();
            } else if (value === "h3") {
              editor.chain().focus().setHeading({ level: 3 }).run();
            }
          }}
        >
          <SelectTrigger className="w-32 h-8 border-none shadow-none bg-transparent cursor-pointer hover:bg-gray-100">
            <SelectValue placeholder="Formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Párrafo</SelectItem>
            <SelectItem value="h1">Título 1</SelectItem>
            <SelectItem value="h2">Título 2</SelectItem>
            <SelectItem value="h3">Título 3</SelectItem>
          </SelectContent>
        </Select>

        {/* ✅ SELECTOR DE TAMAÑO DE FUENTE MEJORADO */}
        <Select
          value={getCurrentFontSize() || "default"}
          onValueChange={(value) => {
            if (value === "default") {
              editor.chain().focus().unsetFontSize().run();
            } else {
              editor.chain().focus().setFontSize(value).run();
            }
          }}
        >
          <SelectTrigger className="w-28 h-8 border-none shadow-none bg-transparent cursor-pointer hover:bg-gray-100">
            <SelectValue placeholder="Tamaño" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Defecto</SelectItem>
            <SelectItem value="10pt">10 pt</SelectItem>
            <SelectItem value="11pt">11 pt</SelectItem>
            <SelectItem value="12pt">12 pt</SelectItem>
            <SelectItem value="14pt">14 pt</SelectItem>
            <SelectItem value="16pt">16 pt</SelectItem>
            <SelectItem value="18pt">18 pt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* (El resto de la barra de herramientas se mantiene igual) */}
      <div className="flex gap-1 mr-2 border-r pr-2">
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
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("highlight")}
          onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="h-4 w-4" />
        </Toggle>
      </div>
      <div className="flex gap-1 mr-2 border-r pr-2">
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
      </div>
      <div className="flex gap-1 mr-2 border-r pr-2">
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("romanOrderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleRomanOrderedList().run()
          }
          title="Lista con numeración romana (I, II, III...)"
        >
          <Hash className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("taskList")}
          onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
        >
          <CheckSquare className="h-4 w-4" />
        </Toggle>
      </div>
      <div className="flex gap-1 mr-2 border-r pr-2">
        <Toggle
          size="sm"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
        >
          <Quote className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("code")}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </Toggle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-1 mr-2 border-r pr-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={editor.isActive("link") ? "bg-gray-200" : ""}
            >
              <Link className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-2">
              <h4 className="font-medium">
                {editor.isActive("link") ? "Editar enlace" : "Agregar enlace"}
              </h4>
              <Input
                placeholder="https://ejemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={addLink} size="sm">
                  {editor.isActive("link") ? "Actualizar" : "Agregar"}
                </Button>
                {editor.isActive("link") && (
                  <Button onClick={removeLink} variant="outline" size="sm">
                    Quitar
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Image className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-2">
              <h4 className="font-medium">Agregar imagen</h4>
              <Input
                placeholder="URL de la imagen"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button onClick={addImage} size="sm">
                Agregar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={editor.isActive("table") ? "bg-gray-200" : ""}
            >
              <Table className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid gap-2">
              <h4 className="font-medium">Tabla</h4>
              {!editor.isActive("table") ? (
                <Button onClick={addTable} size="sm">
                  Insertar tabla 3x3
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  <Button onClick={addColumnBefore} size="sm" variant="outline">
                    + Col Izq
                  </Button>
                  <Button onClick={addColumnAfter} size="sm" variant="outline">
                    + Col Der
                  </Button>
                  <Button onClick={addRowBefore} size="sm" variant="outline">
                    + Fila Arr
                  </Button>
                  <Button onClick={addRowAfter} size="sm" variant="outline">
                    + Fila Abj
                  </Button>
                  <Button
                    onClick={deleteColumn}
                    size="sm"
                    variant="destructive"
                  >
                    - Columna
                  </Button>
                  <Button onClick={deleteRow} size="sm" variant="destructive">
                    - Fila
                  </Button>
                  <Button
                    onClick={deleteTable}
                    size="sm"
                    variant="destructive"
                    className="col-span-2"
                  >
                    Eliminar tabla
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid gap-2">
              <h4 className="font-medium">Color de texto</h4>
              <div className="grid grid-cols-6 gap-1">
                {[
                  "#000000",
                  "#374151",
                  "#DC2626",
                  "#EA580C",
                  "#D97706",
                  "#65A30D",
                  "#059669",
                  "#0891B2",
                  "#2563EB",
                  "#7C3AED",
                  "#C026D3",
                  "#DC2626",
                ].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                Quitar color
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
