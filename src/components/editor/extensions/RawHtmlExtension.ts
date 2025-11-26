import { Extension } from "@tiptap/core";

export const RawHtmlExtension = Extension.create({
  name: "rawHtml",

  addGlobalAttributes() {
    return [
      {
        types: [
          "paragraph",
          "heading",
          "table",
          "tableRow",
          "tableCell",
          "tableHeader",
          "hardBreak",
          "blockquote",
        ],
        attributes: {
          style: {
            default: null,
            parseHTML: (element) => element.getAttribute("style"),
            renderHTML: (attributes) => {
              if (!attributes.style) return {};
              return { style: attributes.style };
            },
          },
          class: {
            default: null,
            parseHTML: (element) => element.getAttribute("class"),
            renderHTML: (attributes) => {
              if (!attributes.class) return {};
              return { class: attributes.class };
            },
          },
          "data-attrs": {
            default: null,
            parseHTML: (element) => {
              const dataset = element.dataset || {};
              return Object.keys(dataset).length ? dataset : null;
            },
            renderHTML: (attributes) => {
              if (!attributes["data-attrs"]) return {};
              const ds = attributes["data-attrs"];
              const out: Record<string, string> = {};
              for (const k in ds) {
                out[`data-${k}`] = ds[k];
              }
              return out;
            },
          },
        },
      },
    ];
  },
});
