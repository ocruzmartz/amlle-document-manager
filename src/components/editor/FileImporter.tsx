import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { removeWordEndOfCellMarkers } from "./utils/removeWordEndOfCellMarkers";
import { elevateCellInlineStyles } from "./utils/elevateCellInLineStyles";

interface DocxBorder {
  "@_val"?: string;
  "@_sz"?: string;
  "@_color"?: string;
}

interface DocxNode {
  tbl?: DocxNode | DocxNode[];
  tr?: DocxNode | DocxNode[];
  tc?: DocxNode | DocxNode[];
  tcPr?: {
    tcW?: { "@_w"?: string; "@_type"?: string };
    shd?: { "@_fill"?: string };
    vAlign?: { "@_val"?: string };
    tcBorders?: {
      top?: DocxBorder;
      left?: DocxBorder;
      bottom?: DocxBorder;
      right?: DocxBorder;
      [key: string]: DocxBorder | undefined;
    };
    gridSpan?: { "@_val"?: string };
  };
  p?: DocxNode | DocxNode[];
  r?: DocxNode | DocxNode[];
  rPr?: {
    sz?: { "@_val"?: string };
    rFonts?: { "@_ascii"?: string };
  };
  pPr?: {
    jc?: { "@_val"?: string };
  };
  [key: string]: unknown;
}

interface TableCellStyle {
  width: { value: number; type: string } | null;
  shading: string | null;
  vAlign: string | null;
  borders: Record<string, { val: string; sz: number; color: string }>;
  colspan: number;
  rowspan: number;
  fontSizePt: number | null;
  fontFamily: string | null;
  textAlign: string | null;
}

interface ExtendedWorkBook extends XLSX.WorkBook {
  Styles?: {
    CellXf?: Array<{
      alignment?: { horizontal?: string };
      fill?: { fgColor?: { rgb?: string } };
    }>;
  };
}

interface MammothImageElement {
  read: (encoding: string) => Promise<string>;
  contentType?: string;
}

// ... (extractDocxTableStyles se mantiene igual)
async function extractDocxTableStyles(arrayBuffer: ArrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docXml = await zip.file("word/document.xml")?.async("text");
  if (!docXml) return null;

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: true,
    allowBooleanAttributes: true,
  });
  const json = parser.parse(docXml);
  const body = json.document?.body;
  if (!body) return null;

  const findTbls = (node: unknown): DocxNode[] => {
    const out: DocxNode[] = [];
    if (!node || typeof node !== "object") return out;
    const typedNode = node as DocxNode;
    for (const key of Object.keys(typedNode)) {
      const val = typedNode[key];
      if (key === "tbl") {
        if (Array.isArray(val)) out.push(...(val as DocxNode[]));
        else out.push(val as DocxNode);
      } else if (Array.isArray(val)) {
        val.forEach((el) => out.push(...findTbls(el)));
      } else if (typeof val === "object") {
        out.push(...findTbls(val));
      }
    }
    return out;
  };

  const tbls = findTbls(body);
  const tablesStyles: TableCellStyle[][][] = [];

  tbls.forEach((tbl) => {
    const rows = tbl.tr ? (Array.isArray(tbl.tr) ? tbl.tr : [tbl.tr]) : [];
    const table: TableCellStyle[][] = [];

    rows.forEach((tr) => {
      const tcs = tr.tc ? (Array.isArray(tr.tc) ? tr.tc : [tr.tc]) : [];
      const rowArr = tcs.map((tc) => {
        const tcPr = tc.tcPr || {};
        let width = null;
        if (tcPr.tcW && tcPr.tcW["@_w"]) {
          const w = tcPr.tcW["@_w"];
          const type = tcPr.tcW["@_type"] || "dxa";
          width = { value: parseFloat(w), type };
        }
        let shading = null;
        if (tcPr.shd && tcPr.shd["@_fill"]) {
          shading = tcPr.shd["@_fill"];
        }
        let vAlign = null;
        if (tcPr.vAlign && tcPr.vAlign["@_val"]) vAlign = tcPr.vAlign["@_val"];

        const borders: Record<
          string,
          { val: string; sz: number; color: string }
        > = {};
        if (tcPr.tcBorders) {
          const b = tcPr.tcBorders;
          ["top", "left", "bottom", "right"].forEach((side) => {
            const el = b[side];
            if (el && (el["@_val"] || el["@_sz"])) {
              borders[side] = {
                val: el["@_val"] || "single",
                sz: el["@_sz"] ? parseInt(el["@_sz"], 10) / 8 : 1,
                color: el["@_color"] || "#000000",
              };
            }
          });
        }

        let colspan = 1;
        if (tcPr.gridSpan && tcPr.gridSpan["@_val"])
          colspan = parseInt(tcPr.gridSpan["@_val"], 10);

        let fontSizePt: number | null = null;
        let fontFamily: string | null = null;
        try {
          const paragraphs = tc.p ? (Array.isArray(tc.p) ? tc.p : [tc.p]) : [];
          for (const p of paragraphs) {
            const runs = p.r ? (Array.isArray(p.r) ? p.r : [p.r]) : [];
            if (runs.length > 0) {
              const firstRun = runs[0];
              const rPr = firstRun.rPr || {};
              if (rPr.sz && rPr.sz["@_val"]) {
                const val = parseFloat(rPr.sz["@_val"]);
                if (!Number.isNaN(val) && val > 0) fontSizePt = val / 2;
              }
              if (rPr.rFonts && rPr.rFonts["@_ascii"])
                fontFamily = rPr.rFonts["@_ascii"];
              break;
            }
          }
        } catch {}

        let textAlign: string | null = null;
        try {
          const paragraphs = tc.p ? (Array.isArray(tc.p) ? tc.p : [tc.p]) : [];
          for (const p of paragraphs) {
            const pPr = p.pPr || {};
            if (pPr.jc && pPr.jc["@_val"]) {
              textAlign = pPr.jc["@_val"];
              break;
            }
          }
        } catch {}

        return {
          width,
          shading,
          vAlign,
          borders,
          colspan,
          rowspan: 1,
          fontSizePt,
          fontFamily,
          textAlign,
        };
      });
      table.push(rowArr);
    });
    tablesStyles.push(table);
  });
  return tablesStyles;
}

function mergeDocxStylesIntoHtml(
  mammothHtml: string,
  tablesStyles: TableCellStyle[][][] | null
) {
  if (!tablesStyles || tablesStyles.length === 0) return mammothHtml;

  const parser = new DOMParser();
  const doc = parser.parseFromString(mammothHtml, "text/html");

  const htmlTables = Array.from(doc.querySelectorAll("table"));

  for (let t = 0; t < Math.min(htmlTables.length, tablesStyles.length); t++) {
    const tableEl = htmlTables[t];
    const stylesTable = tablesStyles[t];

    // 🔥 FORZAR ANCHO 100%: Esto es crucial para que ocupe toda la ventana
    const currentTableStyle = tableEl.getAttribute("style") || "";
    tableEl.setAttribute(
      "style",
      currentTableStyle + "; width: 100%; border-collapse: collapse;"
    );

    // Calcular ancho total para convertir píxeles de Word a Porcentajes
    let maxTableWidthTwips = 0;
    for (const row of stylesTable) {
      const rowWidth = row.reduce(
        (acc, cell) => acc + (cell.width?.value || 0),
        0
      );
      if (rowWidth > maxTableWidthTwips) maxTableWidthTwips = rowWidth;
    }
    if (maxTableWidthTwips === 0) maxTableWidthTwips = 1;

    const trEls = Array.from(tableEl.querySelectorAll("tr"));

    for (let r = 0; r < Math.min(trEls.length, stylesTable.length); r++) {
      const trEl = trEls[r];
      const styleRow = stylesTable[r] || [];
      const cellEls = Array.from(trEl.querySelectorAll("th,td"));

      for (let c = 0; c < Math.min(cellEls.length, styleRow.length); c++) {
        const cellEl = cellEls[c] as HTMLElement;
        const info = styleRow[c];
        if (!info) continue;

        const inlineParts: string[] = [];

        // 1. Font Size (y Span Wrapper abajo)
        let fontSizeString = "";
        if (info.fontSizePt) {
          fontSizeString = `${info.fontSizePt}pt`;
          inlineParts.push(`font-size: ${fontSizeString}`);
        }

        // 2. Shading
        if (info.shading) {
          const hex = info.shading.startsWith("#")
            ? info.shading
            : `#${info.shading}`;
          inlineParts.push(`background-color: ${hex}`);
        }

        // 3. Width
        if (info.width) {
          if (info.width.type === "pct") {
            inlineParts.push(`width: ${info.width.value}%`);
          } else {
            const percent = (info.width.value / maxTableWidthTwips) * 100;
            inlineParts.push(`width: ${percent.toFixed(2)}%`);
          }
        }

        // 4. Vertical Align
        if (info.vAlign) {
          const map: Record<string, string> = {
            top: "top",
            center: "middle",
            bottom: "bottom",
          };
          inlineParts.push(`vertical-align: ${map[info.vAlign] || "top"}`);
        }

        // 5. Borders
        const sides = ["top", "right", "bottom", "left"];
        let hasAnyBorder = false;
        sides.forEach((side) => {
          const b = info.borders && info.borders[side];
          if (b) {
            hasAnyBorder = true;
            const color = b.color || "#000";
            const size = b.sz || 1;
            inlineParts.push(`border-${side}: ${size}px solid ${color}`);
          }
        });
        if (!hasAnyBorder) inlineParts.push(`border: 1px solid #ddd`);

        // 6. Align
        if (info.textAlign) {
          const map: Record<string, string> = {
            left: "left",
            center: "center",
            right: "right",
            both: "justify",
          };
          inlineParts.push(`text-align: ${map[info.textAlign] || "left"}`);
        }

        if (info.colspan && info.colspan > 1) {
          cellEl.setAttribute("colspan", String(info.colspan));
        }
        const existing = cellEl.getAttribute("style") || "";
        const newStyle =
          (existing ? existing + ";" : "") + inlineParts.join(";");
        if (newStyle.trim()) cellEl.setAttribute("style", newStyle);

        if (fontSizeString) {
          const childParagraphs = Array.from(cellEl.querySelectorAll("p"));
          childParagraphs.forEach((p) => {
            const span = doc.createElement("span");
            span.setAttribute("style", `font-size: ${fontSizeString}`);
            while (p.firstChild) span.appendChild(p.firstChild);
            p.appendChild(span);
          });
        }
      }
    }

    let colgroup = tableEl.querySelector("colgroup");
    if (!colgroup && stylesTable.length > 0) {
      colgroup = doc.createElement("colgroup");
      tableEl.insertBefore(colgroup, tableEl.firstChild);
    }

    if (colgroup && stylesTable.length > 0) {
      const firstRowStyles = stylesTable[0];
      colgroup.innerHTML = "";
      for (let c = 0; c < firstRowStyles.length; c++) {
        const cellInfo = firstRowStyles[c];
        const colspan = cellInfo.colspan || 1;
        let widthValue = "auto";
        if (cellInfo.width) {
          const divisor = colspan > 1 ? colspan : 1;
          let percent = 0;
          if (cellInfo.width.type === "pct") {
            percent = cellInfo.width.value / divisor;
          } else {
            percent =
              ((cellInfo.width.value / maxTableWidthTwips) * 100) / divisor;
          }
          widthValue = `${percent.toFixed(2)}%`;
        }

        for (let span = 0; span < colspan; span++) {
          const col = doc.createElement("col");
          col.setAttribute("style", `width: ${widthValue};`);
          colgroup.appendChild(col);
        }
      }
    }
  }
  return doc.body.innerHTML;
}

const excelToHtml = (
  worksheet: XLSX.WorkSheet,
  wb?: ExtendedWorkBook
): string => {
  const ref = worksheet["!ref"] || "A1";
  const range = XLSX.utils.decode_range(ref);
  const cols = worksheet["!cols"] || [];
  const colPxWidths = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const colInfo = cols[c - range.s.c];
    colPxWidths.push(colInfo?.wpx || 80);
  }
  const totalPx =
    colPxWidths.reduce((a, b) => a + b, 0) || colPxWidths.length * 80;
  const merges = worksheet["!merges"] || [];
  const mergeMap = new Map<
    string,
    { colspan: number; rowspan: number; skip: boolean }
  >();

  merges.forEach((m) => {
    const startAddr = XLSX.utils.encode_cell({ r: m.s.r, c: m.s.c });
    const colspan = m.e.c - m.s.c + 1;
    const rowspan = m.e.r - m.s.r + 1;
    mergeMap.set(startAddr, { colspan, rowspan, skip: false });
    for (let r = m.s.r; r <= m.e.r; r++) {
      for (let c = m.s.c; c <= m.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (addr === startAddr) continue;
        mergeMap.set(addr, { colspan: 1, rowspan: 1, skip: true });
      }
    }
  });

  let html = `<table style="border-collapse: collapse; width: 100%;">`;
  html += `<colgroup>`;
  for (let i = 0; i < colPxWidths.length; i++) {
    const px = colPxWidths[i] || 80;
    const pct = ((px / totalPx) * 100).toFixed(2);
    html += `<col style="width: ${pct}%;"/>`;
  }
  html += `</colgroup>`;

  for (let r = range.s.r; r <= range.e.r; r++) {
    html += `<tr>`;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const mInfo = mergeMap.get(addr);
      if (mInfo?.skip) continue;

      const cell = worksheet[addr];
      let text = "";
      if (cell) {
        try {
          text = XLSX.utils.format_cell(cell);
        } catch {
          text = String(cell.v ?? "");
        }
      }
      text = String(text).replace(/\n/g, "<br/>");

      const colspan = mInfo?.colspan || 1;
      const rowspan = mInfo?.rowspan || 1;
      let widthPct = 0;
      for (let i = c; i < c + colspan; i++) {
        const idx = i - range.s.c;
        widthPct += ((colPxWidths[idx] || 80) / totalPx) * 100;
      }

      const isHeader = r === range.s.r;
      const tag = isHeader ? "th" : "td";
      const colspanAttr = colspan > 1 ? ` colspan="${colspan}"` : "";
      const rowspanAttr = rowspan > 1 ? ` rowspan="${rowspan}"` : "";

      let baseStyle = `padding: 6px; vertical-align: top; width: ${widthPct.toFixed(
        2
      )}%;`;
      if (isHeader)
        baseStyle += " font-weight: bold; background-color: #f8f9fa;";
      baseStyle += " border: 1px solid #ddd;";

      if (cell && cell.s && wb && wb.Styles && wb.Styles.CellXf) {
        const styleIndex =
          typeof cell.s === "number" ? cell.s : parseInt(cell.s as string, 10);
        if (!isNaN(styleIndex)) {
          const xf = wb.Styles.CellXf[styleIndex];
          if (xf && xf.alignment && xf.alignment.horizontal)
            baseStyle += ` text-align: ${xf.alignment.horizontal};`;
          if (xf && xf.fill && xf.fill.fgColor && xf.fill.fgColor.rgb)
            baseStyle += ` background-color: #${xf.fill.fgColor.rgb.slice(2)};`;
        }
      }

      const content = text ? `<p>${text}</p>` : `<p>&nbsp;</p>`;
      html += `<${tag}${colspanAttr}${rowspanAttr} style="${baseStyle}">${content}</${tag}>`;
    }
    html += `</tr>`;
  }
  html += `</table>`;
  return html;
};

const normalizeHtml = (html: string): string => {
  if (!html) return html;
  let out = html.replace(/<\/?\w+:[^>]*>/g, "");
  out = out.replace(/<o:p>\s*<\/o:p>/gi, "");
  out = out.replace(/<o:p>[\s\S]*?<\/o:p>/gi, "");
  out = out.replace(/<meta[^>]*>/gi, "");
  return out;
};

export const FileImporter = ({
  onImport,
  acceptedFormats = ".docx, .xlsx, .xls",
  disabled = false,
}: {
  onImport: (html: string) => void;
  acceptedFormats?: string;
  disabled?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setError(null);

    try {
      let html = "";
      if (file.name.match(/\.docx$/i)) {
        const arrayBuffer = await file.arrayBuffer();
        const mammothHtml = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: ["b => strong", "i => em", "u => u"],
            convertImage: mammoth.images.imgElement(function (
              element: MammothImageElement
            ) {
              return element
                .read("base64")
                .then(function (imageBuffer: string) {
                  const contentType = element.contentType || "image/png";
                  return { src: `data:${contentType};base64,${imageBuffer}` };
                });
            }),
          }
        );
        const tablesStyles = await extractDocxTableStyles(arrayBuffer).catch(
          (err) => {
            console.warn("No pudo extraer estilos DOCX:", err);
            return null;
          }
        );
        html = mergeDocxStylesIntoHtml(
          typeof mammothHtml === "string" ? mammothHtml : mammothHtml.value,
          tablesStyles
        );
      } else if (file.name.match(/\.(xlsx|xls)$/i)) {
        const arrayBuffer = await file.arrayBuffer();
        const wb = XLSX.read(arrayBuffer) as ExtendedWorkBook;
        const sheet = wb.Sheets[wb.SheetNames[0]];
        html = excelToHtml(sheet, wb);
      } else {
        setError(`Formato no soportado. Usa: ${acceptedFormats}`);
        setIsLoading(false);
        return;
      }

      let normalized = normalizeHtml(html);
      try {
        normalized = elevateCellInlineStyles(normalized);
      } catch (err) {
        console.warn(err);
      }
      try {
        normalized = removeWordEndOfCellMarkers
          ? removeWordEndOfCellMarkers(normalized)
          : normalized;
      } catch (err) {
        console.warn(err);
      }

      onImport(normalized);
    } catch (err) {
      console.error("Error importando archivo:", err);
      setError(
        "No se pudo procesar el archivo. Revisa el archivo o inténtalo con otra versión."
      );
    } finally {
      setIsLoading(false);
      try {
        const input = document.getElementById(
          "file-importer"
        ) as HTMLInputElement | null;
        if (input) input.value = "";
      } catch {}
    }
  };

  return (
    <div className="float-right">
      <label htmlFor="file-importer" className="cursor-pointer">
        <Button
          asChild
          variant="outline"
          className="w-auto shadow-none"
          disabled={disabled || isLoading}
        >
          <div>
            <UploadCloud className="mr-2 h-4 w-4" />
            {isLoading ? "Procesando..." : "Importar archivo"}
          </div>
        </Button>
      </label>
      <input
        id="file-importer"
        type="file"
        className="hidden"
        accept={acceptedFormats}
        onChange={handleFileChange}
        disabled={isLoading || disabled}
      />
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
};

export default FileImporter;
