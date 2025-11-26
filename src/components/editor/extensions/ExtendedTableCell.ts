import TableCell from "@tiptap/extension-table-cell";
import { type CommandProps } from "@tiptap/core";

type VerticalAlign = "top" | "middle" | "bottom" | null;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    setCellVerticalAlign: (align: VerticalAlign) => ReturnType;
  }
}

export const ExtendedTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      colwidth: {
        default: null,
        parseHTML: (element) => {
          const colwidth = element.getAttribute("data-colwidth");
          const value = colwidth
            ? colwidth.split(",").map((item) => parseInt(item, 10))
            : null;
          return value;
        },
        renderHTML: (attributes) => {
          if (!attributes.colwidth) {
            return {};
          }
          return {
            "data-colwidth": attributes.colwidth.join(","),
          };
        },
      },

      colspan: {
        default: 1,
        parseHTML: (element) => Number(element.getAttribute("colspan") || 1),
        renderHTML: (attributes) => ({
          colspan: attributes.colspan,
        }),
      },

      rowspan: {
        default: 1,
        parseHTML: (element) => Number(element.getAttribute("rowspan") || 1),
        renderHTML: (attributes) => ({
          rowspan: attributes.rowspan,
        }),
      },

      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) =>
          attributes.width ? { width: attributes.width } : {},
      },

      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) =>
          attributes.height ? { height: attributes.height } : {},
      },

      valign: {
        default: null,
        parseHTML: (element) => {
          const attr = element.getAttribute("valign");
          if (attr) return attr;
          const style = element.style.verticalAlign;
          if (style && ["top", "middle", "bottom"].includes(style))
            return style;

          return null;
        },
        renderHTML: (attributes) => {
          if (!attributes.valign) return {};
          return {
            valign: attributes.valign,
            style: `vertical-align: ${attributes.valign}`,
          };
        },
      },

      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },

      "data-attrs": {
        default: null,
        parseHTML: (element) => {
          const ds = element.dataset || {};
          return Object.keys(ds).length ? ds : null;
        },
        renderHTML: (attributes) => {
          const ds = attributes["data-attrs"];
          if (!ds) return {};
          const out: Record<string, string> = {};
          for (const key in ds) out[`data-${key}`] = ds[key];
          return out;
        },
      },
    };
  },

  addCommands() {
    return {
      setCellVerticalAlign:
        (align: VerticalAlign) =>
        ({ commands }: CommandProps) => {
          return commands.updateAttributes(this.name, { valign: align });
        },
    };
  },
});
