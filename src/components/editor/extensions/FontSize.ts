import { Extension } from "@tiptap/core";
import "@tiptap/extension-text-style";

export type FontSizeOptions = {
  types: string[];
};

const unitToNumberPt = (
  val: string | number | undefined
): number | undefined => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "number") return val; // Asumir que ya está en pt

  const s = String(val).trim();

  if (s.endsWith("pt")) {
    const n = parseFloat(s.replace("pt", ""));
    return Number.isNaN(n) ? undefined : n;
  }
  if (s.endsWith("px")) {
    const n = parseFloat(s.replace("px", ""));
    if (Number.isNaN(n)) return undefined;
    return n * 0.75; // Convertir px a pt (ej: 16px * 0.75 = 12pt)
  }
  if (s.endsWith("in")) {
    const n = parseFloat(s.replace("in", ""));
    return Number.isNaN(n) ? undefined : n * 72; // 1in = 72pt
  }

  // fallback numeric (asumir 'pt' si no tiene unidad)
  const n = parseFloat(s);
  return Number.isNaN(n) ? undefined : n;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (fontSize: string) => ReturnType;
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const rawSize = element.style.fontSize?.replace(/['"]+/g, "");
              if (!rawSize) return null;

              const sizeInPt = unitToNumberPt(rawSize); // Convierte "16px" a 12
              if (sizeInPt === undefined) return null;

              // Almacenar siempre como string 'pt'
              return `${sizeInPt}pt`; // ej: "12pt"
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
