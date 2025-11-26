export function removeWordEndOfCellMarkers(html: string): string {
  if (!html) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const REMOVE_CHARS = [
    "\uFFFC", // object replacement
    "\uFEFF", // BOM
    "\u200B", // zero width space
    "\u200C", // zero width non-joiner
    "\u200D", // zero width joiner
    "\u00AD", // soft hyphen
    "\u200E", // left-to-right mark
    "\u200F", // right-to-left mark
    "\u202A",
    "\u202B",
    "\u202C",
    "\u202D",
    "\u202E", // bidi controls
    "\uF020",
    "\uF0B7",
    "\uF0A7", // some PUA used by MS Word
    "\u2219", // bullet-like
    "\u2022", // bullet
    "\u00B7", // middle dot
  ];

  const removeRegex = new RegExp(
    "[" +
      REMOVE_CHARS.map(
        (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")
      ).join("") +
      "]",
    "gu"
  );

  function cleanTextNode(node: Text) {
    if (!node || !node.nodeValue) return;
    let s = node.nodeValue.replace(removeRegex, "");
    s = s.replace(/[ \t\f\v]{2,}/g, " ");
    s = s.replace(/[\r\n]+/g, " ");
    node.nodeValue = s;
  }
  const cells = Array.from(doc.querySelectorAll("td, th"));
  for (const cell of cells) {
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let current;
    while ((current = walker.nextNode() as Text | null)) {
      textNodes.push(current);
    }
    for (const t of textNodes) {
      cleanTextNode(t);
    }

    const childEls = Array.from(cell.children);
    for (const el of childEls) {
      const txt = (el.textContent || "").trim();
      if (txt === "") {
        el.remove();
      }
    }

    let inner = cell.innerHTML || "";
    inner = inner.replace(/[\uFFFC\uFEFF\u200B\uF020\uF0B7\uF0A7]/g, "");
    inner = inner.replace(/\s{2,}/g, " ");
    inner = inner.trim();

    if (!inner) inner = "&nbsp;";
    cell.innerHTML = inner;
  }

  const tables = Array.from(doc.querySelectorAll("table"));
  for (const table of tables) {
    const rows = Array.from(table.querySelectorAll("tr"));
    let maxCols = 0;
    for (const r of rows) {
      const cellsInRow = Array.from(r.querySelectorAll("th,td"));
      let count = 0;
      for (const c of cellsInRow) {
        const cs = parseInt(c.getAttribute("colspan") || "1", 10) || 1;
        count += cs;
      }
      maxCols = Math.max(maxCols, count);
    }
    const colgroup = table.querySelector("colgroup");
    if (colgroup) {
      const cols = Array.from(colgroup.querySelectorAll("col"));
      if (cols.length > maxCols && maxCols > 0) {
        for (let i = cols.length - 1; i >= maxCols; i--) {
          cols[i].remove();
        }
      } else if (cols.length < maxCols) {
        for (let i = cols.length; i < maxCols; i++) {
          const cEl = doc.createElement("col");
          cEl.setAttribute("style", "width:auto;");
          colgroup.appendChild(cEl);
        }
      }
    } else {
      if (maxCols > 0) {
        const cg = doc.createElement("colgroup");
        for (let i = 0; i < maxCols; i++) {
          const cEl = doc.createElement("col");
          cEl.setAttribute("style", "width:auto;");
          cg.appendChild(cEl);
        }
        table.insertBefore(cg, table.firstChild);
      }
    }
  }

  return doc.body.innerHTML;
}
