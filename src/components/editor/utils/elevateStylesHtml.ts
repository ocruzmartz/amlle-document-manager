// src/editor/utils/elevateStylesHtml.ts
export function parseInlineStyle(styleText: string | null) {
  const out: Record<string, string> = {};
  if (!styleText) return out;
  const parts = styleText.split(";");
  for (let p of parts) {
    p = p.trim();
    if (!p) continue;
    const [k, ...rest] = p.split(":");
    if (!k) continue;
    const key = k.trim().toLowerCase();
    const val = rest.join(":").trim();
    out[key] = val;
  }
  return out;
}

function normalizeColor(raw: string | undefined) {
  if (!raw) return undefined;
  if (/windowtext/i.test(raw)) return "#000000";
  const h = raw.match(/#([0-9a-fA-F]{3,6})/);
  if (h) return `#${h[1]}`;
  const rgb = raw.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgb) {
    const r = parseInt(rgb[1], 10);
    const g = parseInt(rgb[2], 10);
    const b = parseInt(rgb[3], 10);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  return raw;
}

export function elevateStylesHtml(html: string) {
  if (!html) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = Array.from(doc.querySelectorAll("table"));
  for (const table of tables) {
    const cells = Array.from(table.querySelectorAll("td, th"));
    for (const cell of cells) {
      const existing = cell.getAttribute("style") || "";
      const cellStyle = parseInlineStyle(existing);
      const candidate = Array.from(cell.querySelectorAll("p, div, span")).find(
        (el) => {
          const s = el.getAttribute("style");
          return (
            s &&
            /text-align|font-size|vertical-align|font-family|background|padding/i.test(
              s
            )
          );
        }
      );
      if (candidate) {
        const cand = parseInlineStyle(candidate.getAttribute("style") || "");
        if (!cellStyle["text-align"] && cand["text-align"])
          cellStyle["text-align"] = cand["text-align"];
        if (!cellStyle["vertical-align"] && cand["vertical-align"])
          cellStyle["vertical-align"] = cand["vertical-align"];
        if (!cellStyle["font-size"] && cand["font-size"])
          cellStyle["font-size"] = cand["font-size"];
        if (!cellStyle["font-family"] && cand["font-family"])
          cellStyle["font-family"] = cand["font-family"];
        if (!cellStyle["background-color"] && cand["background-color"]) {
          const normalized = normalizeColor(cand["background-color"]);
          if (normalized !== undefined) {
            cellStyle["background-color"] = normalized;
          }
        }
        if (
          (!cellStyle["padding"] || cellStyle["padding"].trim() === "") &&
          cand["padding"]
        )
          cellStyle["padding"] = cand["padding"];
        const newParts: string[] = [];
        for (const k of Object.keys(cellStyle))
          newParts.push(`${k}: ${cellStyle[k]}`);
        const newStyle = newParts.join("; ");
        if (newStyle) cell.setAttribute("style", newStyle);
      }
    }
  }

  let out = doc.body.innerHTML;
  // limpieza leve de markers MS Word
  out = out.replace(/\\x07|\uF0B7|[¶•◦]/g, "");
  return out;
}
