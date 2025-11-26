import { Extension } from "@tiptap/core";
import "@tiptap/extension-text-style";

export type FontSizeOptions = {
  types: string[];
};

const unitToNumberPt = (
  val: string | number | undefined
): number | undefined => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "number") return val;

  const s = String(val).trim();

  if (s.endsWith("pt")) {
    const n = parseFloat(s.replace("pt", ""));
    return Number.isNaN(n) ? undefined : n;
  }
  if (s.endsWith("px")) {
    const n = parseFloat(s.replace("px", ""));
    if (Number.isNaN(n)) return undefined;
    return n * 0.75;
  }
  if (s.endsWith("in")) {
    const n = parseFloat(s.replace("in", ""));
    return Number.isNaN(n) ? undefined : n * 72;
  }
  const n = parseFloat(s);
  return Number.isNaN(n) ? undefined : n;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
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

              const sizeInPt = unitToNumberPt(rawSize);
              if (sizeInPt === undefined) return null;

              return `${sizeInPt}pt`;
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
