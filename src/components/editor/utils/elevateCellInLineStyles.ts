export function unitToNumber(val: string | number | undefined) {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "number") return val;
  const s = String(val).trim();
  if (s.endsWith("pt")) {
    const n = parseFloat(s.replace("pt", ""));
    return Number.isNaN(n) ? undefined : n;
  }
  if (s.endsWith("px")) {
    const n = parseFloat(s.replace("px", ""));
    return Number.isNaN(n) ? undefined : n;
  }
  if (s.endsWith("in")) {
    const n = parseFloat(s.replace("in", ""));
    return Number.isNaN(n) ? undefined : n * 72; // 1in = 72pt
  }
  // fallback numeric
  const n = parseFloat(s);
  return Number.isNaN(n) ? undefined : n;
}

function normalizeColor(raw: string | undefined) {
  if (!raw) return undefined;
  if (/windowtext/i.test(raw)) return "#000000";
  // basic hex or rgb pass-through (react-pdf accepts #rrggbb)
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

function parseInlineStyle(styleText: string | null) {
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

export function elevateCellInlineStyles(html: string) {
  if (!html) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const tables = Array.from(doc.querySelectorAll("table"));
  for (const table of tables) {
    const cells = Array.from(table.querySelectorAll("td, th"));
    for (const cell of cells) {
      // parse cell style attr (existing)
      const cellStyleRaw = cell.getAttribute("style") || "";
      const cellStyle = parseInlineStyle(cellStyleRaw);

      // find first child p/span/div that may contain text-alignment/font-size
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
        const candidateStyleRaw = candidate.getAttribute("style") || "";
        const cand = parseInlineStyle(candidateStyleRaw);

        // Promote text-align
        if (!cellStyle["text-align"] && cand["text-align"]) {
          cellStyle["text-align"] = cand["text-align"];
        }
        // Promote vertical-align (if present on inner element)
        if (!cellStyle["vertical-align"] && cand["vertical-align"]) {
          cellStyle["vertical-align"] = cand["vertical-align"];
        }
        // Promote font-size
        if (!cellStyle["font-size"] && cand["font-size"]) {
          cellStyle["font-size"] = cand["font-size"];
        }
        // Promote font-family
        if (!cellStyle["font-family"] && cand["font-family"]) {
          cellStyle["font-family"] = cand["font-family"];
        }
        // Promote background
        if (!cellStyle["background-color"] && cand["background-color"]) {
          cellStyle["background-color"] = cand["background-color"];
        }
        // Promote padding (if cell doesn't have own)
        if (
          (!cellStyle["padding"] || cellStyle["padding"].trim() === "") &&
          cand["padding"]
        ) {
          cellStyle["padding"] = cand["padding"];
        }
      }

      // Normalize unit values: convert 'width: 198.15pt' etc into a consistent format
      if (cellStyle["width"] && cellStyle["width"].includes("pt")) {
        const n = unitToNumber(cellStyle["width"]);
        if (n !== undefined) cellStyle["width"] = `${n}pt`;
      }

      // Normalize border colors like "windowtext"
      if (cellStyle["border"]) {
        // e.g. "1pt solid windowtext"
        const parts = cellStyle["border"].split(/\s+/);
        const colorPart = parts[parts.length - 1];
        const colorNorm = normalizeColor(colorPart);
        if (colorNorm) {
          // replace color token with hex
          parts[parts.length - 1] = colorNorm;
          cellStyle["border"] = parts.join(" ");
        }
      }

      // Rebuild style string and set it on the cell
      const newStyleParts: string[] = [];
      for (const k of Object.keys(cellStyle)) {
        newStyleParts.push(`${k}: ${cellStyle[k]}`);
      }
      const newStyle = newStyleParts.join("; ");
      if (newStyle) cell.setAttribute("style", newStyle);
    }
  }

  return doc.body.innerHTML;
}
