import Paragraph from "@tiptap/extension-paragraph";

export const ExtendedParagraph = Paragraph.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: el => el.getAttribute("style"),
        renderHTML: attrs => attrs.style ? { style: attrs.style } : {}
      }
    };
  }
});
