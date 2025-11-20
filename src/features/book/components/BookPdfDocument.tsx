import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Museo Sans",
  fonts: [
    { src: "/fonts/MuseoSans-100.otf", fontWeight: 100 },
    {
      src: "/fonts/MuseoSans-100Italic.otf",
      fontWeight: 100,
      fontStyle: "italic",
    },
    { src: "/fonts/MuseoSans-300.otf", fontWeight: 300 },
    {
      src: "/fonts/MuseoSans-300Italic.otf",
      fontWeight: 300,
      fontStyle: "italic",
    },
    { src: "/fonts/MuseoSans_500.otf", fontWeight: 500 },
    {
      src: "/fonts/MuseoSans_500_Italic.otf",
      fontWeight: 500,
      fontStyle: "italic",
    },
    { src: "/fonts/MuseoSans_700.otf", fontWeight: 700 },
    {
      src: "/fonts/MuseoSans-700Italic.otf",
      fontWeight: 700,
      fontStyle: "italic",
    },
    { src: "/fonts/MuseoSans_900.otf", fontWeight: 900 },
    {
      src: "/fonts/MuseoSans-900Italic.otf",
      fontWeight: 900,
      fontStyle: "italic",
    },
  ],
});
import { PdfTable, PdfTableRow, PdfTableCell } from "./PdfTable";
import type { Style, HyphenationCallback } from "@react-pdf/types";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import {
  numberToWords,
  capitalize,
  numberToRoman,
  parseDateSafely,
} from "@/lib/textUtils";
import {
  type Tome,
  type Act,
  type CouncilMember,
  type Agreement,
} from "@/types";
import createHyphenator from "hyphen";
import patternsEs from "hyphen/patterns/es";

const hyphenator = createHyphenator(patternsEs);
const hyphenationCallback: HyphenationCallback = (word) => {
  if (word.length < 8) {
    return [word];
  }
  const result = hyphenator(word);
  return Array.isArray(result) ? result : [word];
};

const parseStyleAttribute = (styleString: string | null): Style => {
  if (!styleString) return {};
  const style: Style = {};
  styleString.split(";").forEach((declaration) => {
    const pair = declaration.split(":");
    if (!pair || pair.length < 2) return;
    const property = pair[0].trim();
    const value = pair.slice(1).join(":").trim();

    if (!property || !value) return;

    switch (property) {
      case "font-size": {
        const s = value.trim();
        if (s.endsWith("pt")) {
          const n = parseFloat(s.replace("pt", ""));
          if (!Number.isNaN(n)) style.fontSize = n;
        } else if (s.endsWith("px")) {
          const n = parseFloat(s.replace("px", ""));
          if (!Number.isNaN(n)) style.fontSize = n;
        } else if (s.endsWith("in")) {
          const n = parseFloat(s.replace("in", ""));
          if (!Number.isNaN(n)) style.fontSize = n * 72; // 1in = 72pt
        } else {
          const n = parseFloat(s);
          if (!Number.isNaN(n)) style.fontSize = n;
        }
        break;
      }

      case "text-align":
        if (
          value === "left" ||
          value === "right" ||
          value === "center" ||
          value === "justify"
        ) {
          style.textAlign = value;
        }
        break;
      case "font-weight":
        if (value === "bold" || value === "700") {
          style.fontWeight = 700;
        } else {
          const v = parseInt(value, 10);
          if (!Number.isNaN(v)) style.fontWeight = v;
        }
        break;
      case "font-style":
        if (value === "italic") style.fontStyle = "italic";
        break;
      case "text-decoration-line":
        if (value.includes("underline")) style.textDecoration = "underline";
        if (value.includes("line-through"))
          style.textDecoration = "line-through";
        break;
      case "font-family":
        style.fontFamily = value.replace(/['"]+/g, "");
        break;
      case "color":
        style.color = value;
        break;
      case "background":
      case "background-color":
        style.backgroundColor = value;
        break;
      case "width": {
        // Keep as provided (could be "100px" or "20%")
        style.width = value;
        break;
      }
      case "padding": {
        // single value -> all sides
        const v = value.trim();
        if (v.endsWith("px")) {
          const n = parseFloat(v.replace("px", ""));
          if (!Number.isNaN(n)) style.padding = n;
        } else {
          const n = parseFloat(v);
          if (!Number.isNaN(n)) style.padding = n;
        }
        break;
      }
      case "padding-left":
      case "padding-right":
      case "padding-top":
      case "padding-bottom": {
        const v = value.trim();
        const n = v.endsWith("px")
          ? parseFloat(v.replace("px", ""))
          : parseFloat(v);
        if (!Number.isNaN(n)) {
          const side = property.split("-")[1];
          (style as any)[
            `padding${side.charAt(0).toUpperCase() + side.slice(1)}`
          ] = n;
        }
        break;
      }
      case "vertical-align":
        // map to alignItems for container heuristics
        if (value === "middle" || value === "center") {
          (style as any).verticalAlign = "middle";
        } else if (value === "bottom") {
          (style as any).verticalAlign = "bottom";
        } else {
          (style as any).verticalAlign = "top";
        }
        break;
      case "border":
      case "border-top":
      case "border-right":
      case "border-bottom":
      case "border-left": {
        // simple parse: "1px solid #ddd"
        const parts = value.split(/\s+/).filter(Boolean);
        let width = undefined;
        let color = undefined;
        parts.forEach((p) => {
          if (p.endsWith("px")) {
            const n = parseFloat(p.replace("px", ""));
            if (!Number.isNaN(n)) width = n;
          } else if (
            p.startsWith("#") ||
            p.startsWith("rgb") ||
            p.startsWith("hsl")
          ) {
            color = p;
          }
        });
        if (width !== undefined) (style as any).borderWidth = width;
        if (color) (style as any).borderColor = color;
        break;
      }
      default:
        // Ignore other properties to avoid unexpected mappings
        break;
    }
  });
  return style;
};

const renderHtmlNodes = (
  html: string,
  baseStyle: Style
): React.ReactElement[] => {
  if (!html) return [];

  const cleanHtml = html.replace(/&nbsp;/g, " ").replace(/\u00A0/g, " ");

  const regex =
    /<(strong|em|u|span|div|p)([^>]*)>([\s\S]*?)<\/\1>|<(br)\s*\/?>|([^<]+)/g;
  let match;
  const nodes = [];
  let key = 0;

  while ((match = regex.exec(cleanHtml)) !== null) {
    const [, tagName, attributes, innerHtml, brTag, plainText] = match;

    if (plainText) {
      nodes.push(
        <Text
          key={key++}
          style={{
            ...baseStyle,
            textAlign: (baseStyle as any).textAlign || "left",
            letterSpacing: 0,
          }}
        >
          {plainText}
        </Text>
      );
      continue;
    }

    if (brTag) {
      nodes.push(<Text key={key++}>{"\n"}</Text>);
      continue;
    }

    if (tagName) {
      let style: Style = { ...baseStyle, letterSpacing: 0 };
      const styleAttr = attributes ? attributes.match(/style="([^"]*)"/) : null;
      const inlineStyle = parseStyleAttribute(styleAttr ? styleAttr[1] : null);

      // normalize keys on inlineStyle too
      if (
        (inlineStyle as any)["text-align"] &&
        !(inlineStyle as any).textAlign
      ) {
        (inlineStyle as any).textAlign = (inlineStyle as any)["text-align"];
      }
      if (
        (inlineStyle as any)["vertical-align"] &&
        !(inlineStyle as any).verticalAlign
      ) {
        (inlineStyle as any).verticalAlign = (inlineStyle as any)[
          "vertical-align"
        ];
      }

      // merge, prefer inlineStyle for alignment specifics
      style = { ...style, ...inlineStyle };

      switch (tagName.toLowerCase()) {
        case "strong":
          style = { ...style, fontWeight: 700 };
          break;
        case "em":
          style = { ...style, fontStyle: "italic" };
          break;
        case "u":
          style = { ...style, textDecoration: "underline" };
          break;
        case "span":
        case "div":
        case "p":
          // keep merged style
          break;
        default:
          break;
      }

      // If innerHtml contains mixed content, call recursively but ensure parent textAlign is applied
      const childNodes = renderHtmlNodes(innerHtml, style);
      // If childNodes are Texts, we can wrap them in one Text to make textAlign work better
      const areAllText = childNodes.every((n) => (n as any).type === Text);

      if (areAllText) {
        nodes.push(
          <Text
            key={key++}
            style={{ ...style, textAlign: (style as any).textAlign || "left" }}
          >
            {childNodes}
          </Text>
        );
      } else {
        // mixed nodes: render as fragment but ensure wrapping Text children get alignment
        nodes.push(
          <Text
            key={key++}
            style={{ ...style, textAlign: (style as any).textAlign || "left" }}
          >
            {childNodes}
          </Text>
        );
      }
    }
  }
  return nodes;
};

const getStyles = (
  fontSize = 11,
  pageNumberPosition: "left" | "center" | "right" = "center",
  margins = { top: 50, bottom: 50, left: 60, right: 60 }
) =>
  StyleSheet.create({
    page: {
      fontFamily: "Museo Sans",
      fontSize: fontSize,
      color: "#000",
      fontWeight: 500,
    },
    coverContainer: { textAlign: "left", flex: 1 },
    coverTitle: {
      fontSize: fontSize + 1,
      fontFamily: "Museo Sans",
      fontWeight: 700,
      marginBottom: 40,
    },
    coverText: { fontSize: fontSize, textAlign: "justify", marginBottom: 12 },
    coverDate: { fontSize: fontSize, marginTop: 40 },
    indexTitle: {
      fontSize: fontSize + 5,
      fontFamily: "Museo Sans",
      fontWeight: 700,
      textAlign: "center",
      marginBottom: 30,
      textTransform: "uppercase",
    },
    indexItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 8,
    },
    indexAgreementItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 8,
      paddingLeft: 20,
    },
    indexItemText: { flexShrink: 1, textAlign: "left" },
    indexItemDots: {
      flexGrow: 1,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      borderBottomStyle: "dotted",
      marginHorizontal: 5,
      marginBottom: 4,
    },
    indexItemPage: { flexShrink: 0, textAlign: "right" },
    actaContainer: { marginBottom: 40 },
    emptyParagraph: { height: 8 },
    listContainer: { paddingLeft: 15, marginBottom: 5 },
    listItem: { flexDirection: "row", marginBottom: 3 },
    listItemBullet: { width: 15, fontSize: fontSize - 1 },
    listItemContent: { flex: 1 },
    table: {},
    tableRow: {},
    tableCell: {},
    tableCellText: {},
    signaturesSection: {
      marginTop: 40,
      fontSize: fontSize,
    },
    mainSignatureName: { fontFamily: "Museo Sans" },
    mainSignatureRole: { fontSize: fontSize - 0.5, marginBottom: 25 },
    signatureColumnsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      textAlign: "left",
    },
    signatureColumn: { width: "48%", flexDirection: "column" },
    signatureName: { marginBottom: 35, fontSize: fontSize },
    secretariaSignature: {
      marginTop: 30,
      paddingTop: 5,
      marginHorizontal: "auto",
      width: "50%",
    },
    secretariaSignatureLine: {
      borderBottomWidth: 0.5,
      borderBottomColor: "#000",
      marginBottom: 5,
    },
    notaContainer: {
      marginTop: 30,
      fontSize: fontSize - 2,
      textAlign: "justify",
    },
    notaTitle: { fontFamily: "Museo Sans", fontWeight: 700 },
    pageNumber: {
      position: "absolute",
      fontSize: fontSize - 2,
      fontFamily: "Museo Sans",
      fontWeight: 300,
      bottom: margins.bottom / 2,
      left: margins.left,
      right: margins.right,
      textAlign: pageNumberPosition,
      color: "#333",
    },
    justifiedText: {
      textAlign: "justify",
      wordBreak: "keep-all",
    },
  });

const renderCellContent = (
  html: string,
  baseTextStyle: Style
): React.ReactElement | React.ReactElement[] => {
  if (!html || html.trim() === "" || html === "&nbsp;") {
    return (
      <Text
        style={{
          ...baseTextStyle,
          fontFamily: "Museo Sans",
          textAlign: (baseTextStyle as any).textAlign || "left",
        }}
      >
        &nbsp;
      </Text>
    );
  }

  // Normalizar tamaño de fuente si viene como "8pt" o "8px"
  const normalizeFontSizeLocal = (maybe: any): number => {
    if (!maybe && maybe !== 0)
      return typeof baseTextStyle.fontSize === "number"
        ? baseTextStyle.fontSize
        : 10;
    if (typeof maybe === "number") return maybe;
    const s = String(maybe).trim();
    if (s.endsWith("pt")) {
      const n = parseFloat(s.replace("pt", ""));
      if (!Number.isNaN(n)) return n;
    }
    if (s.endsWith("px")) {
      const n = parseFloat(s.replace("px", ""));
      if (!Number.isNaN(n)) return n;
    }
    const n = parseFloat(s);
    return Number.isNaN(n)
      ? typeof baseTextStyle.fontSize === "number"
        ? baseTextStyle.fontSize
        : 10
      : n;
  };

  // Force fontFamily and textAlign on the wrapping Text so React-PDF respects alignment & metrics
  const forcedStyle: Style = {
    ...baseTextStyle,
    fontFamily: "Museo Sans",
    textAlign: (baseTextStyle as any).textAlign || "left",
    fontSize: normalizeFontSizeLocal((baseTextStyle as any).fontSize),
  };

  const contentNodes = renderHtmlNodes(html, {
    ...baseTextStyle,
    fontFamily: "Museo Sans",
  });

  // If renderHtmlNodes returned plain React.Text nodes or array — wrap into a single Text so textAlign applies
  return <Text style={forcedStyle}>{contentNodes}</Text>;
};

const parseHtmlTable = (
  tableHtml: string,
  baseTextStyle: Style,
  fontSize: number
) => {
  // console.debug("🔍 HTML de tabla recibido:", tableHtml);

  // 1) detectar colgroup y parsear anchos. Soporta px y %
  const colgroupMatch = tableHtml.match(/<colgroup>([\s\S]*?)<\/colgroup>/i);
  const columnWidths: (number | null)[] = [];
  let colIsPercent = true; // si true, values are percentages; otherwise px

  if (colgroupMatch) {
    const cols = colgroupMatch[1].match(/<col[^>]*>/g) || [];
    cols.forEach((col) => {
      const styleMatch = col.match(/style="[^"]*width:\s*([^;"]+)/i);
      const widthAttrMatch = col.match(/width=["']?([^"']+)["']?/i);
      const raw = styleMatch
        ? styleMatch[1]
        : widthAttrMatch
        ? widthAttrMatch[1]
        : null;
      if (!raw) {
        columnWidths.push(null);
        return;
      }
      if (raw.includes("%")) {
        const num = parseFloat(raw.replace("%", ""));
        columnWidths.push(Number.isFinite(num) ? num : null);
        colIsPercent = true;
      } else if (raw.endsWith("px")) {
        const num = parseFloat(raw.replace("px", ""));
        columnWidths.push(Number.isFinite(num) ? num : null);
        colIsPercent = false;
      } else {
        // number without unit: treat as px
        const num = parseFloat(raw);
        columnWidths.push(Number.isFinite(num) ? num : null);
        colIsPercent = false;
      }
    });
  }

  // 2) collect rows
  const rows = (tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || []).map(
    (r) => r
  );

  let headerRow: string | null = null;
  const bodyRows: string[] = [];

  rows.forEach((row) => {
    const hasThTag = /<th[^>]*>/i.test(row);
    if (hasThTag && !headerRow) {
      headerRow = row;
    } else {
      bodyRows.push(row);
    }
  });

  const parseCells = (rowHtml: string) => {
    const cells = rowHtml.match(/<(t[dh])[^>]*>([\s\S]*?)<\/\1>/gi) || [];
    return cells.map((cellHtml) => {
      const tagMatch = cellHtml.match(/<(t[dh])([^>]*)>/i);
      const attributes = tagMatch ? tagMatch[2] : "";
      const colspanMatch = attributes.match(/colspan=["']?(\d+)["']?/i);
      const rowspanMatch =
        attributes.match(/rowspan["']?=["']?(\d+)["']?/i) ||
        attributes.match(/rowspan=["']?(\d+)["']?/i);
      const colspan = colspanMatch ? parseInt(colspanMatch[1], 10) : 1;
      const rowspan = rowspanMatch ? parseInt(rowspanMatch[1], 10) : 1;

      const styleAttr = attributes.match(/style="([^"]*)"/i);
      const cellInlineStyle =
        parseStyleAttribute(styleAttr ? styleAttr[1] : null) || {};

      // Normalizar nombres: text-align -> textAlign, vertical-align -> verticalAlign
      if (
        (cellInlineStyle as any)["text-align"] &&
        !(cellInlineStyle as any).textAlign
      ) {
        (cellInlineStyle as any).textAlign = (cellInlineStyle as any)[
          "text-align"
        ];
      }
      if (
        (cellInlineStyle as any)["vertical-align"] &&
        !(cellInlineStyle as any).verticalAlign
      ) {
        (cellInlineStyle as any).verticalAlign = (cellInlineStyle as any)[
          "vertical-align"
        ];
      }

      // Si cell no trae textAlign, intentar extraerlo del primer child <p|div|span> dentro del innerHtml
      if (!cellInlineStyle.textAlign || !cellInlineStyle.verticalAlign) {
        const firstInlineMatch =
          cellHtml.match(/<(p|div|span)[^>]*style="([^"]*)"[^>]*>/i) || [];
        if (firstInlineMatch && firstInlineMatch.length >= 3) {
          const foundStyle = firstInlineMatch[2];
          const found = parseStyleAttribute(foundStyle);
          if (!cellInlineStyle.textAlign && (found as any).textAlign) {
            (cellInlineStyle as any).textAlign = (found as any).textAlign;
          }
          if (!cellInlineStyle.verticalAlign && (found as any).verticalAlign) {
            (cellInlineStyle as any).verticalAlign = (
              found as any
            ).verticalAlign;
          }
        }
      }

      if (!(cellInlineStyle as any).verticalAlign) {
        const valignAttrMatch = attributes.match(
          /valign=["']?(top|middle|bottom)["']?/i
        );
        if (valignAttrMatch && valignAttrMatch[1]) {
          // Añadimos el valor ('top', 'middle', o 'bottom') al objeto de estilos.
          (cellInlineStyle as any).verticalAlign = valignAttrMatch[1];
        }
      }

      // detect width via width attr or inline style (igual que antes)
      let cellWidth: number | null = null;
      const widthAttrMatch = attributes.match(/width=["']?([^"']+)["']?/i);
      if (widthAttrMatch) {
        const w = widthAttrMatch[1];
        if (w.includes("%")) {
          const n = parseFloat(w.replace("%", ""));
          if (!Number.isNaN(n)) cellWidth = n;
        } else if (w.endsWith("px")) {
          const n = parseFloat(w.replace("px", ""));
          if (!Number.isNaN(n)) cellWidth = -n;
        } else {
          const n = parseFloat(w);
          if (!Number.isNaN(n)) cellWidth = -n;
        }
      }

      if (
        (cellInlineStyle as any).width &&
        typeof (cellInlineStyle as any).width === "string"
      ) {
        const widthValue = (cellInlineStyle as any).width;
        if (widthValue.includes("%")) {
          cellWidth = parseFloat(widthValue.replace("%", ""));
        } else if (widthValue.endsWith("px")) {
          cellWidth = -parseFloat(widthValue.replace("px", ""));
        }
      }

      const innerHtml = cellHtml
        .replace(/<t[dh][^>]*>/i, "")
        .replace(/<\/t[dh]>$/i, "")
        .trim();

      return {
        innerHtml,
        style: cellInlineStyle,
        colspan,
        rowspan,
        cellWidth,
      };
    });
  };

  const calculateTotalColumns = (rowHtml: string): number => {
    const cells = parseCells(rowHtml);
    return cells.reduce((total, cell) => total + (cell.colspan || 1), 0);
  };

  let maxColumns = 0;
  if (headerRow) {
    maxColumns = Math.max(maxColumns, calculateTotalColumns(headerRow));
  }
  bodyRows.forEach((row) => {
    maxColumns = Math.max(maxColumns, calculateTotalColumns(row));
  });

  if (maxColumns === 0) {
    maxColumns = parseCells(headerRow || bodyRows[0] || "").length || 1;
  }

  let resolvedColumnWidths: (number | null)[] = [];
  if (columnWidths.length > 0) {
    if (colIsPercent) {
      resolvedColumnWidths = columnWidths.slice(0);
    } else {
      const pxSum = columnWidths.reduce((s, c) => (s ?? 0) + (c ?? 0), 0);
      const safePxSum = pxSum ?? 0;
      if (safePxSum > 0) {
        resolvedColumnWidths = columnWidths.map((c) =>
          c ? (c / safePxSum) * 100 : null
        );
      } else {
        resolvedColumnWidths = columnWidths.map(() => null);
      }
    }
  }

  const adjustedFontSize =
    maxColumns > 8 ? Math.max(fontSize - 2, 8) : fontSize - 1;

  const baseCellStyle: Style = {
    fontSize: Math.round(adjustedFontSize),
    textAlign: "left",
    letterSpacing: 0,
  };

  const calculateCellWidth = (
    cellIndex: number,
    colspan: number,
    cells: Array<{ colspan: number; cellWidth: number | null }>
  ): string => {
    const currentCell = cells[cellIndex];

    // 1) If cellWidth explicitly set (positive percent)
    if (currentCell.cellWidth !== null && currentCell.cellWidth !== undefined) {
      if (currentCell.cellWidth > 0) {
        return `${currentCell.cellWidth}%`;
      } else if (currentCell.cellWidth < 0) {
        // negative means px encoded; we can't use px in react-pdf width reliably, so use fallback %
        // fallback: distribute proportionally
      }
    }

    // 2) Try to use resolvedColumnWidths from colgroup
    if (resolvedColumnWidths.length > 0) {
      const startCol = cells
        .slice(0, cellIndex)
        .reduce((sum, c) => sum + (c.colspan || 1), 0);
      let totalWidth = 0;
      let hasAll = true;
      for (let i = startCol; i < startCol + colspan; i++) {
        const w = resolvedColumnWidths[i];
        if (w === null || w === undefined) {
          hasAll = false;
          break;
        }
        totalWidth += w;
      }
      if (hasAll && totalWidth > 0) {
        return `${totalWidth}%`;
      }
    }

    // 3) fallback: equal distribution across maxColumns
    const fallbackWidth = (colspan / maxColumns) * 100;
    return `${fallbackWidth}%`;
  };

  return (
    <PdfTable totalColumns={maxColumns}>
      {headerRow && (
        <PdfTableRow isHeader>
          {parseCells(headerRow).map((cell, idx, arr) => {
            let cellTextAlign =
              (cell.style &&
                (cell.style as { textAlign?: string }).textAlign) ||
              "left";
            if (cellTextAlign === "justify") {
              cellTextAlign = "left";
            }

            const cellWidth = calculateCellWidth(idx, cell.colspan, arr);

            return (
              <PdfTableCell
                key={`hcell-${idx}`}
                isHeader
                colSpan={cell.colspan}
                rowSpan={cell.rowspan}
                width={cellWidth}
                style={{
                  ...cell.style,
                }}
              >
                {renderCellContent(cell.innerHtml, {
                  ...baseTextStyle,
                  ...baseCellStyle,
                  textAlign: cellTextAlign as "left" | "right" | "center",
                  fontWeight: 700,
                  letterSpacing: 0,
                })}
              </PdfTableCell>
            );
          })}
        </PdfTableRow>
      )}

      {bodyRows.map((rowContent, rowIndex) => {
        const cells = parseCells(rowContent);

        return (
          <PdfTableRow key={`row-${rowIndex}`} wrap={false}>
            {cells.map((cell, cellIndex, cellsArr) => {
              let cellTextAlign =
                (cell.style && (cell.style as any).textAlign) || "left";
              if (cellTextAlign === "justify") {
                cellTextAlign = "left";
              }

              const cellWidth = calculateCellWidth(
                cellIndex,
                cell.colspan,
                cellsArr
              );

              return (
                <PdfTableCell
                  key={`cell-${cellIndex}`}
                  colSpan={cell.colspan}
                  rowSpan={cell.rowspan}
                  width={cellWidth}
                  style={{
                    ...cell.style,
                  }}
                >
                  {renderCellContent(cell.innerHtml, {
                    ...baseTextStyle,
                    ...baseCellStyle,
                    textAlign: cellTextAlign as "left" | "right" | "center",
                    letterSpacing: 0,
                  })}
                </PdfTableCell>
              );
            })}
          </PdfTableRow>
        );
      })}
    </PdfTable>
  );
};

const renderContentBlocks = (
  html: string,
  baseTextStyle: Style,
  fontSize: number = 11
): (React.ReactElement | null)[] | null => {
  if (!html || !html.trim()) return null;

  const cleanHtml = html.replace(
    /<p><strong>(Acta|Acuerdo) número [^<]*<\/strong><\/p>/,
    ""
  );

  const blockRegex = /<(p|ul|ol|table)[^>]*>([\s\S]*?)<\/\1>/gs;
  const blocks: string[] = [];
  let lastIndex = 0;
  let match;

  while ((match = blockRegex.exec(cleanHtml)) !== null) {
    const orphanText = cleanHtml.substring(lastIndex, match.index).trim();
    if (orphanText) {
      if (orphanText.replace(/<br\s*\/?>/g, "").length > 0) {
        blocks.push(`<p>${orphanText}</p>`);
      }
    }
    blocks.push(match[0]);
    lastIndex = match.index + match[0].length;
  }

  const remainingOrphanText = cleanHtml.substring(lastIndex).trim();
  if (remainingOrphanText) {
    if (remainingOrphanText.replace(/<br\s*\/?>/g, "").length > 0) {
      blocks.push(`<p>${remainingOrphanText}</p>`);
    }
  }

  if (blocks.length === 0 && cleanHtml.trim()) {
    blocks.push(`<p>${cleanHtml}</p>`);
  }

  return blocks
    .map((block, blockIndex) => {
      if (block.trim().startsWith("<table")) {
        const cellTextStyle: Style = {
          ...baseTextStyle,
          textAlign: "left",
          fontSize: fontSize - 1,
          letterSpacing: 0,
        };

        return (
          <View
            key={`table-${blockIndex}`}
            style={{
              marginVertical: 8,
              width: "100%",
            }}
            wrap={true}
          >
            {parseHtmlTable(block, cellTextStyle, fontSize)}
          </View>
        );
      }

      if (block.trim().startsWith("<p")) {
        const tagMatch = block.match(/<p([^>]*)>/i);
        const attributes = tagMatch ? tagMatch[1] : "";
        const styleAttr = attributes.match(/style="([^"]*)"/i);
        const inlineStyle = parseStyleAttribute(
          styleAttr ? styleAttr[1] : null
        );

        const innerHtml = block
          .replace(/<p[^>]*>/i, "")
          .replace(/<\/p>$/i, "")
          .trim();

        if (!innerHtml || innerHtml === "<br>") {
          return <View key={`empty-${blockIndex}`} style={{ height: 8 }} />;
        }

        return (
          <Text
            key={`p-${blockIndex}`}
            style={{
              ...baseTextStyle,
              ...inlineStyle,
              letterSpacing: 0,
              marginBottom: 8,
            }}
          >
            {renderHtmlNodes(innerHtml, {
              ...baseTextStyle,
              ...inlineStyle,
              letterSpacing: 0,
            })}
          </Text>
        );
      }

      if (block.trim().startsWith("<ul") || block.trim().startsWith("<ol")) {
        const isOrdered = block.trim().startsWith("<ol");
        const items = block.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];

        const isRoman = /style="[^"]*list-style-type:\s*upper-roman/i.test(
          block
        );

        return (
          <View
            key={`list-${blockIndex}`}
            style={{ marginBottom: 8, paddingLeft: 10 }}
          >
            {items.map((item, itemIndex) => {
              const innerHtmlMatch = item
                .replace(/<li[^>]*>/i, "")
                .replace(/<\/li>$/i, "")
                .trim();

              const pMatch = innerHtmlMatch.match(/^<p[^>]*>([\s\S]*?)<\/p>$/i);
              const innerHtml = pMatch ? pMatch[1] : innerHtmlMatch;

              let bullet = "•";
              if (isOrdered) {
                bullet = isRoman
                  ? `${numberToRoman(itemIndex + 1)}.`
                  : `${itemIndex + 1}.`;
              }

              return (
                <View
                  key={`item-${itemIndex}`}
                  style={{
                    flexDirection: "row",
                    marginBottom: 5,
                  }}
                  wrap={true}
                >
                  <Text
                    style={{
                      ...baseTextStyle,
                      width: 20,
                      textAlign: "right",
                      paddingRight: 5,
                      flexShrink: 0,
                      letterSpacing: 0,
                    }}
                  >
                    {bullet}
                  </Text>

                  <Text
                    style={{
                      ...baseTextStyle,
                      flex: 1,
                      minWidth: 0,
                      letterSpacing: 0,
                    }}
                  >
                    {renderHtmlNodes(innerHtml, {
                      ...baseTextStyle,
                      letterSpacing: 0,
                    })}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      }

      return null;
    })
    .filter(
      (element): element is React.ReactElement | null => element !== undefined
    );
};

// =================================================================
// RESTO DEL ARCHIVO (Sin cambios) - mantengo tu lógica de portada/índice/firmas
// =================================================================
export const BookPdfDocument = ({
  tome,
  allSigners,
}: {
  tome: Tome | null;
  allSigners: CouncilMember[];
}) => {
  if (!tome) {
    return (
      <Document>
        <Page size="A4" style={getStyles().page}>
          <Text>No hay libro seleccionado</Text>
        </Page>
      </Document>
    );
  }

  const settings = tome.pdfSettings || {
    pageSize: "A4",
    orientation: "portrait",
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
    lineHeight: 1.5,
    fontSize: 11,
    enablePageIndex: false,
    enablePageNumbering: false,
    pageNumberingOffset: 0,
    pageNumberingPosition: "center",
    pageNumberingFormat: "simple",
  };

  const styles = getStyles(
    settings.fontSize,
    settings.pageNumberingPosition,
    settings.margins
  );

  const dynamicPageStyle: Style = {
    paddingTop: settings.margins.top,
    paddingBottom: settings.margins.bottom,
    paddingLeft: settings.margins.left,
    paddingRight: settings.margins.right,
    fontFamily: "Museo Sans",
    fontSize: settings.fontSize,
    color: "#000",
    fontWeight: 500,
  };

  const dynamicTextStyle: Style = {
    fontSize: settings.fontSize,
    textAlign: "justify",
    lineHeight: settings.lineHeight,
  };

  const authDateString = tome.authorizationDate || tome.createdAt;
  const authorizationDate = parseDateSafely(authDateString);
  const authYearInWords =
    authorizationDate && isValid(authorizationDate)
      ? capitalize(numberToWords(authorizationDate.getFullYear()))
      : "[Año]";
  const authDayInWords =
    authorizationDate && isValid(authorizationDate)
      ? numberToWords(authorizationDate.getDate())
      : "[Día]";
  const authMonthName =
    authorizationDate && isValid(authorizationDate)
      ? format(authorizationDate, "MMMM", { locale: es })
      : "[Mes]";

  let closingDayInWords = "[Día]";
  let closingMonthName = "[Mes]";
  let closingYearInWords = "[Año]";

  if (tome.closingDate) {
    const closingDate = parseDateSafely(tome.closingDate);

    if (closingDate && isValid(closingDate)) {
      closingDayInWords = numberToWords(closingDate.getDate());
      closingMonthName = format(closingDate, "MMMM", { locale: es });
      closingYearInWords = capitalize(numberToWords(closingDate.getFullYear()));
    }
  }

  const actCount = tome.acts?.length || 0;

  const actCountInWords = numberToWords(actCount).toLowerCase();

  const signatories = allSigners.filter(
    (m) =>
      (m.role === "OWNER" || m.role === "SYNDIC") &&
      !m.name.includes("Zoila Milagro Navas")
  );

  const PageNumberRenderer = () => {
    if (!settings.enablePageNumbering) {
      return null;
    }

    return (
      <Text
        style={styles.pageNumber}
        fixed
        render={({ pageNumber, totalPages }) => {
          const offset = settings.pageNumberingOffset || 0;

          if (pageNumber <= offset) {
            return "";
          }

          const adjustedPageNumber = pageNumber - offset;
          const adjustedTotalPages = totalPages - offset;

          switch (settings.pageNumberingFormat) {
            case "dash":
              return `- ${adjustedPageNumber} -`;
            case "page":
              return `Página ${adjustedPageNumber}`;
            case "pageTotal":
              return `Página ${adjustedPageNumber} de ${adjustedTotalPages}`;
            case "simple":
            default:
              return `${adjustedPageNumber}`;
          }
        }}
      />
    );
  };

  return (
    <Document title={`Libro de Actas - ${tome.name}`}>
      {/* Portada */}
      <Page
        size={settings.pageSize}
        orientation={settings.orientation}
        style={dynamicPageStyle}
      >
        <View style={styles.coverContainer}>
          <View>
            <Text style={styles.coverTitle}>
              La Suscrita Alcaldesa Municipal
            </Text>
            <Text
              style={{ ...styles.coverText, lineHeight: settings.lineHeight }}
            >
              Autoriza el presente Libro para que el Concejo Municipal de
              Antiguo Cuscatlán, Departamento de La Libertad, asiente las Actas
              y Acuerdos Municipales <Text>{tome.name}</Text>, de las Sesiones
              que celebre durante el año <Text>{authYearInWords}</Text>{" "}
              numeradas correlativamente.
            </Text>
            <Text
              style={{ ...styles.coverDate, lineHeight: settings.lineHeight }}
            >
              Alcaldía Municipal de Antiguo Cuscatlán, a los{" "}
              <Text>
                {authDayInWords} días del mes de {authMonthName}
              </Text>{" "}
              de <Text>{authYearInWords}</Text>.
            </Text>
          </View>
          <View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ marginTop: 80, width: "50%" }}>
                <Text>Licda. Zoila Milagro Navas Quintanilla</Text>
                <Text style={{ marginLeft: 50 }}>Alcaldesa Municipal</Text>
              </View>
              <View
                style={{ marginTop: 100, textAlign: "center", width: "50%" }}
              >
                <Text>Ante Mí,</Text>
                <Text style={{ marginTop: 60 }}>Secretaria Municipal</Text>
              </View>
            </View>
          </View>
        </View>
        <PageNumberRenderer />
      </Page>

      {/* Índice */}
      {/* {settings.enablePageIndex && (
        <Page
          size={settings.pageSize}
          orientation={settings.orientation}
          style={dynamicPageStyle}
        >
          <Text style={styles.indexTitle}>Índice</Text>
          {!tome.acts || tome.acts.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>No hay actas creadas aún</Text>
            </View>
          ) : (
            <View>
              {tome.acts.map((act, actIndex) => (
                <React.Fragment key={act.id}>
                  <View style={styles.indexItem}>
                    <Text style={styles.indexItemText}>{act.name}</Text>
                    <View style={styles.indexItemDots} />
                    <Text style={styles.indexItemPage}>{actIndex + 3}</Text>
                  </View>
                  {act.agreements.map((agreement) => (
                    <View key={agreement.id} style={styles.indexAgreementItem}>
                      <Text style={styles.indexItemText}>{agreement.name}</Text>
                      <View style={styles.indexItemDots} />
                      <Text style={styles.indexItemPage}>{actIndex + 3}</Text>
                    </View>
                  ))}
                </React.Fragment>
              ))}
            </View>
          )}
          <PageNumberRenderer />
        </Page>
      )} */}

      {/* Actas */}
      {tome.acts && tome.acts.length > 0 && (
        <Page
          size={settings.pageSize}
          orientation={settings.orientation}
          style={dynamicPageStyle}
          wrap
        >
          {tome.acts.map((act: Act) => {
            const hasBodyContent =
              act.bodyContent &&
              act.bodyContent.replace(/<[^>]*>/g, "").trim() !== "";
            const hasAgreements = act.agreements && act.agreements.length > 0;
            const hasClarifyingNote =
              act.clarifyingNote &&
              act.clarifyingNote.replace(/<[^>]*>/g, "").trim() !== "";
            return (
              <View
                key={act.id}
                style={styles.actaContainer}
                break={false}
                wrap
              >
                {hasBodyContent && (
                  <View>
                    {renderContentBlocks(
                      act.bodyContent,
                      dynamicTextStyle,
                      settings.fontSize
                    )}
                  </View>
                )}
                {hasAgreements && (
                  <View style={{ marginTop: 0 }} wrap>
                    {act.agreements.map((agreement) => (
                      <View key={agreement.id} wrap={true}>
                        {renderContentBlocks(
                          (agreement as Agreement).content,
                          dynamicTextStyle,
                          settings.fontSize
                        )}
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.signaturesSection}>
                  <Text>
                    Y no habiendo más que hacer constar se termina la presente
                    Acta que firmamos.
                  </Text>
                  <View style={{ marginTop: 40, textAlign: "center" }}>
                    <Text style={styles.mainSignatureName}>
                      Licda. Zoila Milagro Navas Quintanilla
                    </Text>
                    <Text style={styles.mainSignatureRole}>
                      Alcaldesa Municipal
                    </Text>
                  </View>

                  {(() => {
                    const signatories = [
                      act.attendees?.syndic,
                      ...(act.attendees?.owners || []),
                    ].filter(Boolean);
                    const leftColumn = signatories.filter(
                      (_, i) => i % 2 === 0
                    );
                    const rightColumn = signatories.filter(
                      (_, i) => i % 2 !== 0
                    );
                    return (
                      <View style={styles.signatureColumnsContainer}>
                        <View style={styles.signatureColumn}>
                          {leftColumn.map(
                            (p) =>
                              p && (
                                <Text key={p.id} style={styles.signatureName}>
                                  {p.name}
                                </Text>
                              )
                          )}
                        </View>
                        <View style={styles.signatureColumn}>
                          {rightColumn.map(
                            (p) =>
                              p && (
                                <Text key={p.id} style={styles.signatureName}>
                                  {p.name}
                                </Text>
                              )
                          )}
                        </View>
                      </View>
                    );
                  })()}

                  <View
                    style={{
                      ...styles.secretariaSignature,
                      textAlign: "center",
                    }}
                  >
                    <Text>Licda. Maria Antonia Juárez Martínez</Text>
                    <Text>Secretaria Municipal</Text>
                  </View>
                </View>

                {hasClarifyingNote && (
                  <View style={styles.notaContainer}>
                    <Text hyphenationCallback={hyphenationCallback}>
                      <Text style={styles.notaTitle}>Nota Aclaratoria: </Text>
                      {act.clarifyingNote!.replace(/<[^>]*>/g, "")}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
          <PageNumberRenderer />
        </Page>
      )}

      {/* Página final */}
      {tome.closingDate && (
        <Page
          size={settings.pageSize}
          orientation={settings.orientation}
          style={dynamicPageStyle}
        >
          <View style={styles.coverContainer}>
            <Text
              style={{
                ...styles.coverTitle,
                marginBottom: 30,
              }}
            >
              El Concejo Municipal
            </Text>
            <Text
              style={{
                ...styles.coverText,
                lineHeight: settings.lineHeight,
                textAlign: "justify",
                marginBottom: 16,
              }}
            >
              Cierra el presente Libro de Actas Municipales{" "}
              <Text>{tome.name}</Text> que llevó durante el corriente año, con{" "}
              <Text>{actCountInWords} Actas</Text> asentadas.
            </Text>
            <Text
              style={{
                ...styles.coverText,
                lineHeight: settings.lineHeight,
                textAlign: "justify",
                marginTop: 0,
              }}
            >
              Alcaldía Municipal Antiguo Cuscatlán, a los {closingDayInWords}{" "}
              días del mes de {closingMonthName} de {closingYearInWords}.
            </Text>
            <View
              style={{
                ...styles.signaturesSection,
                marginTop: 40,
                textAlign: "left",
              }}
            >
              <View style={{ marginBottom: 25, textAlign: "center" }}>
                <Text>Licda. Zoila Milagro Navas Quintanilla</Text>
                <Text style={styles.mainSignatureRole}>
                  Alcaldesa Municipal
                </Text>
              </View>

              <View style={styles.signatureColumnsContainer}>
                <View style={styles.signatureColumn}>
                  {signatories.slice(0, 3).map((p) => (
                    <Text key={p.id} style={styles.signatureName}>
                      {p.name}
                    </Text>
                  ))}
                </View>
                <View style={styles.signatureColumn}>
                  {signatories.slice(3, 5).map((p) => (
                    <Text key={p.id} style={styles.signatureName}>
                      {p.name}
                    </Text>
                  ))}
                </View>
              </View>
              <View
                style={{
                  ...styles.secretariaSignature,
                  textAlign: "center",
                  marginHorizontal: 0,
                  width: "48%",
                  marginLeft: "52%",
                }}
              >
                <Text>Licda. Maria Antonia Juárez Martínez</Text>
                <Text style={styles.mainSignatureRole}>
                  Secretaria Municipal
                </Text>
              </View>
            </View>
          </View>
          <PageNumberRenderer />
        </Page>
      )}
    </Document>
  );
};
