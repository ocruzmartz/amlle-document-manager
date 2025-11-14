import TableRow from "@tiptap/extension-table-row";

export const ExtendedTableRow = TableRow.extend({
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
