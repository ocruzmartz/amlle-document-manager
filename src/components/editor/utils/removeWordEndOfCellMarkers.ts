// src/editor/utils/removeWordEndOfCellMarkers.ts
/**
 * Limpieza segura de marcadores/PUA/ZWSP/objetos dejados por Word.
 * - No sustituye caracteres por espacios (evita fragmentar palabras).
 * - Remueve solo los glyphs problemáticos y controla colgroup/cols extras.
 * - Normaliza múltiples espacios en uno solo y deja &nbsp; en celdas vacías.
 */

export function removeWordEndOfCellMarkers(html: string): string {
  if (!html) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Lista de caracteres a eliminar (sin reemplazarlos por espacio)
  // Incluye: object replacement, BOM, zero-width, soft hyphen, LTR/RTL marks,
  // middle dot, bullet, PUA common MS glyphs.
  const REMOVE_CHARS = [
    "\uFFFC", // object replacement
    "\uFEFF", // BOM
    "\u200B", // zero width space
    "\u200C", // zero width non-joiner
    "\u200D", // zero width joiner
    "\u00AD", // soft hyphen
    "\u200E", // left-to-right mark
    "\u200F", // right-to-left mark
    "\u202A", "\u202B", "\u202C", "\u202D", "\u202E", // bidi controls
    "\uF020", "\uF0B7", "\uF0A7", // some PUA used by MS Word
    "\u2219", // bullet-like
    "\u2022", // bullet
    "\u00B7", // middle dot
  ];

  const removeRegex = new RegExp("[" + REMOVE_CHARS.map(c => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")).join("") + "]", "gu");

  // Helper: clean a text node by removing those chars and trimming repeated spaces
  function cleanTextNode(node: Text) {
    if (!node || !node.nodeValue) return;
    // Remove listed problematic chars entirely (no space)
    let s = node.nodeValue.replace(removeRegex, "");
    // Collapse multiple whitespace to single space (but keep single spaces)
    s = s.replace(/[ \t\f\v]{2,}/g, " ");
    // Replace sequences of newline+spaces with single space (avoid breaking words)
    s = s.replace(/[\r\n]+/g, " ");
    node.nodeValue = s;
  }

  // Walk td/th and clean their children nodes conservatively
  const cells = Array.from(doc.querySelectorAll("td, th"));
  for (const cell of cells) {
    // Clean all text nodes in the cell (descendant)
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let current;
    while ((current = walker.nextNode() as Text | null)) {
      textNodes.push(current);
    }
    for (const t of textNodes) {
      cleanTextNode(t);
    }

    // After cleaning, also remove empty nodes (elements that contain only whitespace)
    const childEls = Array.from(cell.children);
    for (const el of childEls) {
      const txt = (el.textContent || "").trim();
      if (txt === "") {
        el.remove();
      }
    }

    // Final trim of leading/trailing whitespace & collapse multiple spaces in innerHTML
    let inner = cell.innerHTML || "";
    // remove lingering isolated glyphs (single punctuation boxes)
    inner = inner.replace(/[\uFFFC\uFEFF\u200B\uF020\uF0B7\uF0A7]/g, "");
    // collapse repeated spaces
    inner = inner.replace(/\s{2,}/g, " ");
    inner = inner.trim();

    if (!inner) inner = "&nbsp;";
    cell.innerHTML = inner;
  }

  // Fix colgroup mismatch (same lógica que antes, pero más conservadora)
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
        // remove only trailing extra cols
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
