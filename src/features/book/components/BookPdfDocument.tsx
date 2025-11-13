// filepath: src/features/book/components/BookPdfDocument.tsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { PdfTable, PdfTableRow, PdfTableCell } from "./PdfTable";
import type { Style, HyphenationCallback } from "@react-pdf/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { numberToWords, capitalize, numberToRoman } from "@/lib/textUtils";
import { type Tome, type Act, type CouncilMember } from "@/types";
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

const parseStyleAttribute = (styleString: string | null): Style => {
  if (!styleString) return {};
  const style: Style = {};
  styleString.split(";").forEach((declaration) => {
    const [property, value] = declaration.split(":");
    if (property && value) {
      const prop = property.trim();
      const val = value.trim();
      switch (prop) {
        case "font-size": {
          const parsedSize = parseFloat(val);
          style.fontSize = Math.round(parsedSize);
          break;
        }
        case "text-align":
          if (
            val === "left" ||
            val === "right" ||
            val === "center" ||
            val === "justify"
          ) {
            style.textAlign = val;
          }
          break;
        case "font-weight":
          if (val === "bold" || val === "700") {
            style.fontWeight = 700;
          }
          break;
        case "font-style":
          if (val === "italic") {
            style.fontStyle = "italic";
          }
          break;
        case "text-decoration-line":
          if (val === "underline") style.textDecoration = "underline";
          if (val === "line-through") style.textDecoration = "line-through";
          break;
        case "color":
          style.color = val;
          break;
        case "background-color":
          style.backgroundColor = val;
          break;
        case "width":
          style.width = val;
          break;
        case "letter-spacing":
          break;
        default:
          break;
      }
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
    /<(strong|em|u|span)([^>]*)>([\s\S]*?)<\/\1>|<(br)\s*\/?>|([^<]+)/g;
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
      const styleAttr = attributes.match(/style="([^"]*)"/);
      const inlineStyle = parseStyleAttribute(styleAttr ? styleAttr[1] : null);

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
          style = { ...style, ...inlineStyle, letterSpacing: 0 };
          break;
        default:
          break;
      }

      nodes.push(
        <Text key={key++} style={style}>
          {renderHtmlNodes(innerHtml, style)}
        </Text>
      );
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
      marginTop: 60,
      fontSize: fontSize,
    },
    mainSignatureName: { fontFamily: "Museo Sans", fontWeight: 700 },
    mainSignatureRole: { fontSize: fontSize - 1, marginBottom: 25 },
    signatureColumnsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      textAlign: "left",
    },
    signatureColumn: { width: "48%", flexDirection: "column" },
    signatureName: { marginBottom: 20, fontSize: fontSize },
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
    return <Text style={baseTextStyle}>&nbsp;</Text>;
  }

  const fontSize =
    typeof baseTextStyle.fontSize === "number"
      ? Math.round(baseTextStyle.fontSize) // ✅ Redondear fontSize
      : 11;
  const content = renderContentBlocks(html, baseTextStyle, fontSize);

  if (Array.isArray(content) && content.length > 0) {
    return <>{content}</>;
  }

  return <Text style={baseTextStyle}>&nbsp;</Text>;
};

const parseHtmlTable = (
  tableHtml: string,
  baseTextStyle: Style,
  fontSize: number
) => {
  console.log("🔍 HTML de tabla recibido:", tableHtml);

  const colgroupMatch = tableHtml.match(/<colgroup>([\s\S]*?)<\/colgroup>/);
  const columnWidths: (number | null)[] = [];

  if (colgroupMatch) {
    const cols = colgroupMatch[1].match(/<col[^>]*>/g) || [];
    console.log("📊 Encontradas", cols.length, "columnas en colgroup");
    cols.forEach((col, index) => {
      const styleMatch = col.match(/style="[^"]*width:\s*(\d+(?:\.\d+)?)\s*%/i);
      if (styleMatch) {
        const width = parseFloat(styleMatch[1]);
        columnWidths.push(width);
        console.log(`  Col ${index}: ${width}%`);
      } else {
        const widthMatch = col.match(/width="(\d+(?:\.\d+)?)\s*%"/i);
        const width = widthMatch ? parseFloat(widthMatch[1]) : null;
        columnWidths.push(width);
        console.log(`  Col ${index}: ${width || "sin ancho"}%`);
      }
    });
  }

  const rows = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gs) || [];

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
    const cells = rowHtml.match(/<(t[dh])[^>]*>([\s\S]*?)<\/\1>/gs) || [];
    return cells.map((cellHtml, cellIndex) => {
      const cellTagMatch = cellHtml.match(/<(t[dh])([^>]*)>/);
      const attributes = cellTagMatch ? cellTagMatch[2] : "";

      const colspanMatch = attributes.match(/colspan="(\d+)"/i);
      const rowspanMatch = attributes.match(/rowspan="(\d+)"/i);
      const colspan = colspanMatch ? parseInt(colspanMatch[1], 10) : 1;
      const rowspan = rowspanMatch ? parseInt(rowspanMatch[1], 10) : 1;

      const styleAttr = attributes.match(/style="([^"]*)"/);
      const cellInlineStyle = parseStyleAttribute(
        styleAttr ? styleAttr[1] : null
      );

      let cellWidth: number | null = null;
      const widthAttrMatch = attributes.match(/width="(\d+(?:\.\d+)?)\s*%"/i);
      if (widthAttrMatch) {
        cellWidth = parseFloat(widthAttrMatch[1]);
      }
      if (cellInlineStyle.width && typeof cellInlineStyle.width === "string") {
        const widthValue = cellInlineStyle.width;
        const percentMatch = widthValue.match(/(\d+(?:\.\d+)?)\s*%/);
        if (percentMatch) {
          cellWidth = parseFloat(percentMatch[1]);
        }
      }

      console.log(
        `    Celda ${cellIndex}: width=${
          cellWidth || "auto"
        }%, colspan=${colspan}`
      );

      const innerHtml = cellHtml
        .replace(/<t[dh][^>]*>/, "")
        .replace(/<\/t[dh]>$/, "")
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
    return cells.reduce((total, cell) => total + cell.colspan, 0);
  };

  let maxColumns = 0;
  if (headerRow) {
    maxColumns = Math.max(maxColumns, calculateTotalColumns(headerRow));
  }
  bodyRows.forEach((row) => {
    maxColumns = Math.max(maxColumns, calculateTotalColumns(row));
  });

  if (maxColumns === 0) {
    maxColumns = parseCells(headerRow || bodyRows[0] || "").length;
  }

  console.log(`📏 Total de columnas: ${maxColumns}`);

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

    if (currentCell.cellWidth !== null && currentCell.cellWidth !== undefined) {
      console.log(`    ✅ Usando ancho de celda: ${currentCell.cellWidth}%`);
      return `${currentCell.cellWidth}%`;
    }

    if (columnWidths.length > 0) {
      const startCol = cells
        .slice(0, cellIndex)
        .reduce((sum, c) => sum + c.colspan, 0);
      let totalWidth = 0;
      let hasAllWidths = true;

      for (let i = startCol; i < startCol + colspan; i++) {
        const width = columnWidths[i];
        if (width === null || width === undefined) {
          hasAllWidths = false;
          break;
        }
        totalWidth += width;
      }

      if (hasAllWidths && totalWidth > 0) {
        console.log(`    ✅ Usando ancho de colgroup: ${totalWidth}%`);
        return `${totalWidth}%`;
      }
    }

    const fallbackWidth = (colspan / maxColumns) * 100;
    console.log(`    ⚠️ Fallback equitativo: ${fallbackWidth.toFixed(2)}%`);
    return `${fallbackWidth}%`;
  };

  return (
    <PdfTable totalColumns={maxColumns}>
      {headerRow && (
        <PdfTableRow isHeader>
          {parseCells(headerRow).map((cell, idx, arr) => {
            let cellTextAlign = cell.style.textAlign || "left";
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
          <PdfTableRow key={`row-${rowIndex}`}>
            {cells.map((cell, cellIndex, cellsArr) => {
              let cellTextAlign = cell.style.textAlign || "left";
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
        const tagMatch = block.match(/<p([^>]*)>/);
        const attributes = tagMatch ? tagMatch[1] : "";
        const styleAttr = attributes.match(/style="([^"]*)"/);
        const inlineStyle = parseStyleAttribute(
          styleAttr ? styleAttr[1] : null
        );

        const innerHtml = block
          .replace(/<p[^>]*>/, "")
          .replace(/<\/p>$/, "")
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
        const items = block.match(/<li[^>]*>([\s\S]*?)<\/li>/gs) || [];

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
                .replace(/<li[^>]*>/, "")
                .replace(/<\/li>$/, "")
                .trim();

              const pMatch = innerHtmlMatch.match(/^<p[^>]*>([\s\S]*?)<\/p>$/);
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
// RESTO DEL ARCHIVO (Sin cambios)
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
  const authorizationDate = new Date(authDateString);
  const authYearInWords = capitalize(
    numberToWords(authorizationDate.getFullYear())
  );
  const authDayInWords = numberToWords(authorizationDate.getDate());
  const authMonthName = format(authorizationDate, "MMMM", { locale: es });

  let closingDayInWords = "[Día]";
  let closingMonthName = "[Mes]";
  let closingYearInWords = "[Año]";
  if (tome.closingDate) {
    const closingDate = new Date(tome.closingDate);
    closingDayInWords = numberToWords(closingDate.getDate());
    closingMonthName = format(closingDate, "MMMM", { locale: es });
    closingYearInWords = capitalize(numberToWords(closingDate.getFullYear()));
  }

  const actCount = tome.acts?.length || 0;

  const actCountInWords = numberToWords(actCount).toLowerCase();

  const alcaldesa = allSigners.find((m) =>
    m.name.includes("Licda. Zoila Milagro Navas")
  );
  const secretaria = allSigners.find((m) => m.role === "SECRETARY");

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
      {/* ========================================
        PÁGINA 1: PORTADA
        ========================================
      */}
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
              y Acuerdos Municipales,{" "}
              <Text style={{ fontWeight: 700 }}>{tome.name}</Text>, de las
              Sesiones que celebre durante el año{" "}
              <Text style={{ fontWeight: 700 }}>{authYearInWords}</Text>{" "}
              numeradas correlativamente.
            </Text>
            <Text
              style={{ ...styles.coverDate, lineHeight: settings.lineHeight }}
            >
              Alcaldía Municipal de Antiguo Cuscatlán, a los{" "}
              <Text style={{ fontWeight: 700 }}>
                {authDayInWords} días del mes de {authMonthName}
              </Text>{" "}
              de <Text style={{ fontWeight: 700 }}>{authYearInWords}</Text>.
            </Text>
          </View>
          <View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ marginTop: 80, width: "50%" }}>
                <Text style={{ fontWeight: 700 }}>
                  Licda. Zoila Milagro Navas Quintanilla
                </Text>
                <Text style={{ fontWeight: 700, marginLeft: 50 }}>
                  Alcaldesa Municipal
                </Text>
              </View>
              <View
                style={{ marginTop: 100, textAlign: "center", width: "50%" }}
              >
                <Text>Ante Mí,</Text>
                <Text style={{ marginTop: 60, fontWeight: 700 }}>
                  Secretaria Municipal
                </Text>
              </View>
            </View>
          </View>
        </View>
        <PageNumberRenderer />
      </Page>

      {/* ========================================
        PÁGINA 2: ÍNDICE
        ========================================
      */}
      <Page
        size={settings.pageSize}
        orientation={settings.orientation}
        style={dynamicPageStyle}
      >
        <Text style={styles.indexTitle}>Índice</Text>
        {!tome.acts || tome.acts.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
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
                  {/* TODO: Esta lógica de página +3 es estática, necesita ser dinámica */}
                  <Text style={styles.indexItemPage}>{actIndex + 3}</Text>
                </View>
                {act.agreements.map((agreement) => (
                  <View key={agreement.id} style={styles.indexAgreementItem}>
                    <Text style={styles.indexItemText}>{agreement.name}</Text>
                    <View style={styles.indexItemDots} />
                    {/* TODO: Esta lógica de página +3 es estática, necesita ser dinámica */}
                    <Text style={styles.indexItemPage}>{actIndex + 3}</Text>
                  </View>
                ))}
              </React.Fragment>
            ))}
          </View>
        )}
        <PageNumberRenderer />
      </Page>

      {/* ========================================
        PÁGINAS DE ACTAS
        ========================================
      */}
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
                          agreement.content,
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
                  <View style={{ marginTop: 40 }}>
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
                  <View style={styles.secretariaSignature}>
                    <View style={styles.secretariaSignatureLine} />
                    <Text>Secretaria Municipal</Text>
                  </View>
                </View>

                {/* ... (Nota aclaratoria sin cambios) ... */}
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

      {/* ========================================
        PÁGINA FINAL DE CIERRE
        ========================================
      */}
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
              Alcaldía Municipal Antiguo Cuscatlán, a los {closingDayInWords}
              días del mes de {closingMonthName} de {closingYearInWords}.
            </Text>
            <View
              style={{
                ...styles.signaturesSection,
                marginTop: 20,
                textAlign: "left",
              }}
            >
              {/* --- ✅ 2. Firma Alcaldesa (AHORA SÍ APARECE) --- */}
              {alcaldesa && (
                <View style={{ marginBottom: 25 }}>
                  <Text style={styles.mainSignatureName}>{alcaldesa.name}</Text>
                  <Text style={styles.mainSignatureRole}>
                    Alcaldesa Municipal
                  </Text>
                </View>
              )}

              {/* --- ✅ 3. Disposición 3x2 (DINÁMICA) --- */}
              <View style={styles.signatureColumnsContainer}>
                {/* Columna Izquierda (3 primeros firmantes) */}
                <View style={styles.signatureColumn}>
                  {signatories.slice(0, 3).map((p) => (
                    <Text key={p.id} style={styles.signatureName}>
                      {p.name}
                    </Text>
                  ))}
                </View>
                {/* Columna Derecha (firmantes 4 y 5) */}
                <View style={styles.signatureColumn}>
                  {signatories.slice(3, 5).map((p) => (
                    <Text key={p.id} style={styles.signatureName}>
                      {p.name}
                    </Text>
                  ))}
                </View>
              </View>

              {/* --- ✅ 4. Firma Secretaria (ALINEADA A LA DERECHA) --- */}
              {secretaria && (
                <View
                  style={{
                    ...styles.secretariaSignature,
                    textAlign: "left",
                    marginHorizontal: 0,
                    width: "48%",
                    marginLeft: "52%",
                  }}
                >
                  <View style={styles.secretariaSignatureLine} />
                  <Text>Secretaria Municipal</Text>
                </View>
              )}
            </View>
          </View>
          <PageNumberRenderer />
        </Page>
      )}
    </Document>
  );
};
