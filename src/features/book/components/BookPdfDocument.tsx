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
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import {
  numberToWords,
  capitalize,
  numberToRoman,
  parseDateSafely,
} from "@/lib/textUtils";
import { type Tome, type CouncilMember } from "@/types";
import createHyphenator from "hyphen";
import patternsEs from "hyphen/patterns/es";

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

const hyphenator = createHyphenator(patternsEs);
const hyphenationCallback: HyphenationCallback = (word) => {
  if (word.length < 8) return [word];
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
          if (!Number.isNaN(n)) style.fontSize = n * 72;
        } else {
          const n = parseFloat(s);
          if (!Number.isNaN(n)) style.fontSize = n;
        }
        break;
      }
      case "height": {
        const val = value.trim();
        if (val.endsWith("px")) {
          const n = parseFloat(val.replace("px", ""));
          if (!Number.isNaN(n)) style.height = n;
        } else if (val.endsWith("pt")) {
          const n = parseFloat(val.replace("pt", ""));
          if (!Number.isNaN(n)) style.height = n;
        } else {
          const n = parseFloat(val);
          if (!Number.isNaN(n)) style.height = n;
        }
        break;
      }
      case "text-align":
        if (["left", "right", "center", "justify"].includes(value))

          style.textAlign = value as Style["textAlign"];
        break;
      case "font-weight":
        if (value === "bold" || value === "700") style.fontWeight = 700;
        else {
          const v = parseInt(value, 10);
          if (!Number.isNaN(v)) style.fontWeight = v as Style["fontWeight"];
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
      case "width":
        style.width = value;
        break;
      case "padding":
      case "padding-left":
      case "padding-right":
      case "padding-top":
      case "padding-bottom": {
        const v = value.trim();
        const n = v.endsWith("px")
          ? parseFloat(v.replace("px", ""))
          : parseFloat(v);
        if (!Number.isNaN(n)) {
          if (property === "padding") style.padding = n;
          else {
            const side = property.split("-")[1];
            const key = `padding${
              side.charAt(0).toUpperCase() + side.slice(1)
            }`;
            style[key as keyof Style] = n;
          }
        }
        break;
      }
      case "vertical-align":
        // @ts-expect-error: verticalAlign is valid in react-pdf text but might miss in some types
        style.verticalAlign =
          value === "middle" || value === "center"
            ? "middle"
            : value === "bottom"
            ? "bottom"
            : "top";
        break;
      default:
        if (property.startsWith("border")) {
          const parts = value.split(/\s+/);
          let width: number | undefined;
          let color: string | undefined;
          parts.forEach((p) => {
            if (p.endsWith("px") || p.endsWith("pt")) width = parseFloat(p);
            else if (p.startsWith("#") || p.startsWith("rgb")) color = p;
          });
          const side = property.replace("border", "").replace("-", "");
          if (property === "border") {
            if (width) style.borderWidth = width;
            if (color) style.borderColor = color;
          } else if (width) {
            const key = `border${side}Width`;
            style[key as keyof Style] = width;
          }
        }
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
    /<(strong|b|em|i|u|span|div|p|h[1-6])([^>]*)>([\s\S]*?)<\/\1>|<(br)\s*\/?>|([^<]+)/g;
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
            textAlign: baseStyle.textAlign || "left",
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
      // Manejo de textAlign desde estilos inline legacy
      if (inlineStyle.textAlign) style.textAlign = inlineStyle.textAlign;
      if (inlineStyle.verticalAlign)
        style.verticalAlign = inlineStyle.verticalAlign;

      style = { ...style, ...inlineStyle };

      if (tagName === "strong" || tagName === "b") style.fontWeight = 700;
      if (tagName === "em" || tagName === "i") style.fontStyle = "italic";
      if (tagName === "u") style.textDecoration = "underline";
      if (tagName.startsWith("h")) {
        style.fontWeight = 700;
        style.marginBottom = 4;
        const sizeMap: Record<string, number> = {
          h1: 18,
          h2: 16,
          h3: 14,
          h4: 12,
        };
        if (sizeMap[tagName]) style.fontSize = sizeMap[tagName];
      }

      const childNodes = renderHtmlNodes(innerHtml, style);

      nodes.push(
        <Text key={key++} style={style}>
          {childNodes}
        </Text>
      );
    }
  }
  return nodes;
};

const getPrincipalRoleForSubstitute = (
  subRole: string | null | undefined
): string | null => {
  if (!subRole) return null;
  const map: Record<string, string> = {
    PRIMER_SUPLENTE: "PRIMER_REGIDOR",
    SEGUNDO_SUPLENTE: "SEGUNDO_REGIDOR",
    TERCER_SUPLENTE: "TERCER_REGIDOR",
    CUARTO_SUPLENTE: "CUARTO_REGIDOR",
    QUINTO_SUPLENTE: "QUINTO_REGIDOR",
    SEXTO_SUPLENTE: "SEXTO_REGIDOR",
    SEPTIMO_SUPLENTE: "SEPTIMO_REGIDOR",
    OCTAVO_SUPLENTE: "OCTAVO_REGIDOR",
  };
  return map[subRole] || null;
};

const formatRole = (role: string | null | undefined) => {
  if (!role) return "Miembro del Concejo";
  const roles: Record<string, string> = {
    ALCALDESA: "Alcaldesa Municipal",
    SINDICO: "Síndico Municipal",
    SECRETARIA: "Secretaria Municipal",
    PRIMER_REGIDOR: "1er Regidor Propietario",
    SEGUNDO_REGIDOR: "2do Regidor Propietario",
    TERCER_REGIDOR: "3er Regidor Propietario",
    CUARTO_REGIDOR: "4to Regidor Propietario",
    QUINTO_REGIDOR: "5to Regidor Propietario",
    SEXTO_REGIDOR: "6to Regidor Propietario",
    SEPTIMO_REGIDOR: "7mo Regidor Propietario",
    OCTAVO_REGIDOR: "8vo Regidor Propietario",
    PRIMER_SUPLENTE: "1er Regidor Suplente",
    SEGUNDO_SUPLENTE: "2do Regidor Suplente",
    TERCER_SUPLENTE: "3er Regidor Suplente",
    CUARTO_SUPLENTE: "4to Regidor Suplente",
    QUINTO_SUPLENTE: "5to Regidor Suplente",
    SEXTO_SUPLENTE: "6to Regidor Suplente",
    SEPTIMO_SUPLENTE: "7mo Regidor Suplente",
    OCTAVO_SUPLENTE: "8vo Regidor Suplente",
  };
  return roles[role] || role.replace(/_/g, " ");
};

const getStyles = (
  fontSize = 11,
  pageNumberPosition = "center",
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
    actaContainer: { marginBottom: 40 },
    signaturesSection: { marginTop: 40, fontSize: fontSize },
    mainSignatureName: { fontFamily: "Museo Sans", fontWeight: 700 },
    mainSignatureRole: { fontSize: fontSize - 0.5, marginBottom: 25 },
    signatureColumnsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      textAlign: "left",
    },
    signatureColumn: { width: "48%", flexDirection: "column" },
    signatureName: { marginBottom: 35, fontSize: fontSize },
    secretariaSignature: {
      marginTop: 15,
      paddingTop: 5,
      marginHorizontal: "auto",
      width: "50%",
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
      // @ts-expect-error: position type mismatch
      textAlign: pageNumberPosition,
      color: "#333",
    },
  });

const renderCellContent = (html: string, baseTextStyle: Style) => {
  if (!html || html.trim() === "" || html === "&nbsp;")
    return (
      <Text
        style={{
          ...baseTextStyle,
          fontFamily: "Museo Sans",
          textAlign: baseTextStyle.textAlign || "left",
        }}
      >
        &nbsp;
      </Text>
    );
  return (
    <Text
      style={{
        ...baseTextStyle,
        fontFamily: "Museo Sans",
        textAlign: baseTextStyle.textAlign || "left",
      }}
    >
      {renderHtmlNodes(html, { ...baseTextStyle, fontFamily: "Museo Sans" })}
    </Text>
  );
};

const parseHtmlTable = (
  tableHtml: string,
  baseTextStyle: Style,
  fontSize: number
) => {
  const colgroupMatch = tableHtml.match(/<colgroup>([\s\S]*?)<\/colgroup>/i);
  const columnWidths: (number | null)[] = [];


  if (colgroupMatch) {
    const cols = colgroupMatch[1].match(/<col[^>]*>/g) || [];
    cols.forEach((col) => {
      const widthAttrMatch = col.match(/width=["']?([^"']+)["']?/i);
      const styleMatch = col.match(/style="[^"]*width:\s*([^;"]+)/i);
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
        columnWidths.push(parseFloat(raw.replace("%", "")));
      } else {
        columnWidths.push(parseFloat(raw.replace("px", "")));
      }
    });
  }

  const rowsHtml = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
  const parsedRows = rowsHtml.map((rowHtml) => {
    const trAttributes = rowHtml.match(/<tr([^>]*)>/i)?.[1] || "";
    let rowHeight = undefined;
    const styleAttrTr = trAttributes.match(/style="([^"]*)"/i);
    if (styleAttrTr) {
      const styleObj = parseStyleAttribute(styleAttrTr[1]);
      if (styleObj.height) rowHeight = Number(styleObj.height);
    }

    const cellsHtml = rowHtml.match(/<(t[dh])[^>]*>([\s\S]*?)<\/\1>/gi) || [];
    const cells = cellsHtml.map((cellHtml) => {
      const attributes = cellHtml.match(/<(t[dh])([^>]*)>/i)?.[2] || "";
      const colspan = parseInt(
        attributes.match(/colspan=["']?(\d+)["']?/i)?.[1] || "1",
        10
      );
      const rowspan = parseInt(
        attributes.match(/rowspan=["']?(\d+)["']?/i)?.[1] || "1",
        10
      );

      const styleAttr = attributes.match(/style="([^"]*)"/i);
      const cellInlineStyle =
        parseStyleAttribute(styleAttr ? styleAttr[1] : null) || {};

      let cellWidth = null;
      const widthAttr = attributes.match(/width=["']?([\d.]+)["']?/i);
      if (widthAttr) cellWidth = parseFloat(widthAttr[1]);

      const innerHtml = cellHtml
        .replace(/<t[dh][^>]*>/i, "")
        .replace(/<\/t[dh]>$/i, "")
        .trim();
      return { innerHtml, style: cellInlineStyle, colspan, rowspan, cellWidth };
    });
    return { cells, height: rowHeight };
  });

  let maxColumns = 0;
  parsedRows.forEach((row) => {
    const cols = row.cells.reduce((acc, cell) => acc + cell.colspan, 0);
    if (cols > maxColumns) maxColumns = cols;
  });

  const getWidthForCell = (_start: number, span: number) => {
    return `${(span / maxColumns) * 100}%`;
  };

  return (
    <PdfTable totalColumns={maxColumns}>
      {parsedRows.map((rowData, rowIndex) => {
        let currentColumnIndex = 0;
        return (
          <PdfTableRow
            key={`row-${rowIndex}`}
            style={rowData.height ? { height: rowData.height } : {}}
            wrap={false}
          >
            {rowData.cells.map((cell, cellIndex) => {
              const widthPct = getWidthForCell(
                currentColumnIndex,
                cell.colspan
              );
              currentColumnIndex += cell.colspan;
              return (
                <PdfTableCell
                  key={`cell-${rowIndex}-${cellIndex}`}
                  colSpan={cell.colspan}
                  rowSpan={cell.rowspan}
                  width={widthPct}
                  style={{ ...cell.style }}
                >
                  {renderCellContent(cell.innerHtml, {
                    ...baseTextStyle,
                    ...(cell.style as any),
                    fontSize: fontSize - 1,
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
) => {
  if (!html || !html.trim()) return null;
  const cleanHtml = html.replace(
    /<p><strong>(Acta|Acuerdo) número [^<]*<\/strong><\/p>/,
    ""
  );
  const blockRegex = /<(p|ul|ol|table)[^>]*>([\s\S]*?)<\/\1>/gs;
  const blocks: string[] = [];
  let match;
  let lastIndex = 0;
  while ((match = blockRegex.exec(cleanHtml)) !== null) {
    const orphanText = cleanHtml.substring(lastIndex, match.index).trim();
    if (orphanText && orphanText.replace(/<br\s*\/?>/g, "").length > 0)
      blocks.push(`<p>${orphanText}</p>`);
    blocks.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  const remaining = cleanHtml.substring(lastIndex).trim();
  if (remaining && remaining.replace(/<br\s*\/?>/g, "").length > 0)
    blocks.push(`<p>${remaining}</p>`);
  if (blocks.length === 0 && cleanHtml.trim())
    blocks.push(`<p>${cleanHtml}</p>`);

  return blocks
    .map((block, i) => {
      if (block.trim().startsWith("<table")) {
        return (
          <View key={`t-${i}`} style={{ marginVertical: 8, width: "100%" }}>
            {parseHtmlTable(
              block,
              { ...baseTextStyle, textAlign: "left", fontSize: fontSize - 1 },
              fontSize
            )}
          </View>
        );
      }
      if (block.trim().startsWith("<ul") || block.trim().startsWith("<ol")) {
        const isOrdered = block.trim().startsWith("<ol");
        const items = block.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
        const isRoman = /style="[^"]*list-style-type:\s*upper-roman/i.test(
          block
        );
        return (
          <View key={`l-${i}`} style={{ marginBottom: 8, paddingLeft: 10 }}>
            {items.map((item, itemIndex) => {
              const inner = item
                .replace(/<li[^>]*>/i, "")
                .replace(/<\/li>$/i, "")
                .trim();
              let bullet = "•";
              if (isOrdered)
                bullet = isRoman
                  ? `${numberToRoman(itemIndex + 1)}.`
                  : `${itemIndex + 1}.`;
              return (
                <View
                  key={itemIndex}
                  style={{ flexDirection: "row", marginBottom: 5 }}
                >
                  <Text
                    style={{
                      ...baseTextStyle,
                      width: 20,
                      textAlign: "right",
                      paddingRight: 5,
                    }}
                  >
                    {bullet}
                  </Text>
                  <Text style={{ ...baseTextStyle, flex: 1 }}>
                    {renderHtmlNodes(inner, baseTextStyle)}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      }
      const innerHtml = block.replace(/<\/?(p|ul|ol)[^>]*>/g, "");
      if (!innerHtml || innerHtml === "<br>")
        return <View key={`e-${i}`} style={{ height: 8 }} />;
      return (
        <Text key={`p-${i}`} style={{ ...baseTextStyle, marginBottom: 8 }}>
          {renderHtmlNodes(innerHtml, baseTextStyle)}
        </Text>
      );
    })
    .filter((el) => el !== null);
};

interface BookPdfDocumentProps {
  tome: Tome | null;
  allSigners: CouncilMember[];
  targetActId?: string | null;
  initialPageNumber?: number;
}

export const BookPdfDocument = ({
  tome,
  allSigners,
  targetActId = null,
  initialPageNumber = 1,
}: BookPdfDocumentProps) => {
  // --- 1. IDENTIFICACIÓN DE AUTORIDADES OFICIALES (Lista Maestra) ---
  const oficialAlcaldesa = allSigners.find((m) => m.role === "ALCALDESA");
  const oficialSindico = allSigners.find((m) => m.role === "SINDICO");
  const oficialSecretaria = allSigners.find((m) => m.role === "SECRETARIA");

  const fallbackAlcaldesa = {
    id: "fallback-alc",
    name: "Licda. Zoila Milagro Navas Quintanilla",
    role: "ALCALDESA",
  };
  const fallbackSindico = {
    id: "fallback-sin",
    name: "Dr. Edwin Gilberto Orellana Núñez",
    role: "SINDICO",
  };
  const fallbackSecretaria = {
    id: "fallback-sec",
    name: "Licda. Flor de María Flamenco",
    role: "SECRETARIA",
  };

  if (!tome) {
    return (
      <Document>
        <Page size="A4">
          <Text>No hay datos.</Text>
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
    paddingTop: settings.margins?.top || 50,
    paddingBottom: settings.margins?.bottom || 50,
    paddingLeft: settings.margins?.left || 60,
    paddingRight: settings.margins?.right || 60,
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

  // --- DATOS Y FECHAS ---
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

  let closingDayInWords = "[Día]",
    closingMonthName = "[Mes]",
    closingYearInWords = "[Año]";
  if (tome.closingDate) {
    const closingDate = parseDateSafely(tome.closingDate);
    if (closingDate && isValid(closingDate)) {
      closingDayInWords = numberToWords(closingDate.getDate());
      closingMonthName = format(closingDate, "MMMM", { locale: es });
      closingYearInWords = capitalize(numberToWords(closingDate.getFullYear()));
    }
  }
  const actCountInWords = numberToWords(tome.acts?.length || 0).toLowerCase();

  // Filtrado de actas
  const actsToRender = targetActId
    ? (tome.acts || []).filter((act) => act.id === targetActId)
    : tome.acts || [];

  const showCover = !targetActId;
  const showClosing = !targetActId && !!tome.closingDate;

  const pages: React.ReactElement[] = [];

  // --- PORTADA (Usa autoridades oficiales) ---
  if (showCover) {
    pages.push(
      <Page
        key="cover"
        size={settings.pageSize}
        orientation={settings.orientation}
        style={dynamicPageStyle}
      >
        <View style={styles.coverContainer}>
          <Text style={styles.coverTitle}>La Suscrita Alcaldesa Municipal</Text>
          <Text
            style={{ ...styles.coverText, lineHeight: settings.lineHeight }}
          >
            Autoriza el presente Libro para que el Concejo Municipal de Antiguo
            Cuscatlán, Departamento de La Libertad, asiente las Actas y Acuerdos
            Municipales <Text>{tome.name}</Text>, de las Sesiones que celebre
            durante el año <Text>{authYearInWords}</Text> numeradas
            correlativamente.
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
          <View style={{ flexDirection: "row", marginTop: 80 }}>
            <View style={{ width: "50%" }}>
              <Text>{oficialAlcaldesa?.name || fallbackAlcaldesa.name}</Text>
              <Text style={{ marginLeft: 50 }}>Alcaldesa Municipal</Text>
            </View>
            <View style={{ width: "50%", textAlign: "center", marginTop: 20 }}>
              <Text>Ante Mí,</Text>
              <Text style={{ marginTop: 60 }}>
                {oficialSecretaria?.name || fallbackSecretaria.name}
              </Text>
              <Text>Secretaria Municipal</Text>
            </View>
          </View>
        </View>
        {/* Numeración Inline */}
        {settings.enablePageNumbering && (
          <Text
            style={styles.pageNumber}
            fixed
            render={({ pageNumber }) => {
              const start = Number(initialPageNumber) || 1;
              const effectivePageNumber = pageNumber + (start - 1);
              const offset = settings.pageNumberingOffset || 0;
              const displayPageNumber = targetActId
                ? effectivePageNumber
                : effectivePageNumber - offset;
              if (displayPageNumber <= 0) return "";
              return `${displayPageNumber}`;
            }}
          />
        )}
      </Page>
    );
  }

  // --- ACTAS ---
  if (actsToRender.length > 0) {
    pages.push(
      <Page
        key="acts"
        size={settings.pageSize}
        orientation={settings.orientation}
        style={dynamicPageStyle}
        wrap
      >
        {actsToRender.map((act) => {
          const hasBody = act.bodyContent && act.bodyContent.trim().length > 0;
          const hasAgreements = act.agreements && act.agreements.length > 0;
          const hasNote =
            act.clarifyingNote && act.clarifyingNote.trim().length > 0;

          const alcaldesaPresente = act.attendees?.owners?.find(
            (m) => m.role === "ALCALDESA"
          );
          const sindicoPresente = act.attendees?.syndic;
          const secretariaPresente = act.attendees?.secretary;

          const signerAlcaldesa =
            alcaldesaPresente || oficialAlcaldesa || fallbackAlcaldesa;
          const signerSindico =
            sindicoPresente || oficialSindico || fallbackSindico;
          const signerSecretaria =
            secretariaPresente || oficialSecretaria || fallbackSecretaria;

          const rawSignatories = [...(act.attendees?.owners || [])].filter(
            (m) =>
              m.role !== "ALCALDESA" &&
              m.role !== "SINDICO" &&
              m.role !== "SECRETARIA"
          );

          const presentRoles = new Set(rawSignatories.map((m) => m.role));

          const finalSignatories = rawSignatories.filter((member) => {
            if (!member.role?.includes("SUPLENTE")) return true;

            const principalRole = getPrincipalRoleForSubstitute(
              (member.role as string) || ""
            );

            if (principalRole && presentRoles.has(principalRole as any)) {
              return false;
            }
            return true;
          });

          const columnSignatories = [signerSindico, ...finalSignatories];

          return (
            <View key={act.id} style={styles.actaContainer} break={false} wrap>
              {hasBody && (
                <View>
                  {renderContentBlocks(
                    act.bodyContent,
                    dynamicTextStyle,
                    settings.fontSize
                  )}
                </View>
              )}

              {hasAgreements &&
                act.agreements.map((agr) => (
                  <View key={agr.id} wrap={true} style={{ marginTop: 10 }}>
                    {renderContentBlocks(
                      agr.content,
                      dynamicTextStyle,
                      settings.fontSize
                    )}
                  </View>
                ))}

              <View style={styles.signaturesSection} wrap={false}>
                <Text style={{ marginBottom: 60 }}>
                  Y no habiendo más que hacer constar se termina la presente
                  Acta que firmamos.
                </Text>
                <View style={{ marginBottom: 30, textAlign: "center" }}>
                  <Text>{signerAlcaldesa.name}</Text>
                  <Text style={styles.mainSignatureRole}>
                    {formatRole(signerAlcaldesa.role)}
                  </Text>
                </View>

                <View style={styles.signatureColumnsContainer}>
                  <View style={styles.signatureColumn}>
                    {columnSignatories
                      .filter((_, i) => i % 2 === 0)
                      .map((p) => (
                        <View
                          key={(p as any).id || p.name}
                          style={{ marginBottom: 50 }}
                        >
                          <Text>{p.name}</Text>
                        </View>
                      ))}
                  </View>
                  <View style={styles.signatureColumn}>
                    {columnSignatories
                      .filter((_, i) => i % 2 !== 0)
                      .map((p) => (
                        <View
                          key={(p as any).id || p.name}
                          style={{ marginBottom: 50 }}
                        >
                          <Text>{p.name}</Text>
                        </View>
                      ))}
                  </View>
                </View>
                <View
                  style={{
                    ...styles.secretariaSignature,
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  <Text>{signerSecretaria.name}</Text>
                  <Text style={styles.mainSignatureRole}>
                    {formatRole(signerSecretaria.role)}
                  </Text>
                </View>
              </View>

              {hasNote && (
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

        {settings.enablePageNumbering && (
          <Text
            style={styles.pageNumber}
            fixed
            render={({ pageNumber }) => {
              const start = Number(initialPageNumber) || 1;
              const effectivePageNumber = pageNumber + (start - 1);
              const offset = settings.pageNumberingOffset || 0;
              const displayPageNumber = targetActId
                ? effectivePageNumber
                : effectivePageNumber - offset;
              if (displayPageNumber <= 0) return "";
              return `${displayPageNumber}`;
            }}
          />
        )}
      </Page>
    );
  }

  if (showClosing) {
    const getMemberRole = (m: any): string => {
      return m.type || m.role || "";
    };

    const closingAlcaldesa =
      allSigners.find((m) => getMemberRole(m) === "ALCALDESA") ||
      fallbackAlcaldesa;
    const closingSecretaria =
      allSigners.find((m) => getMemberRole(m) === "SECRETARIA") ||
      fallbackSecretaria;

    const uniqueRolesMap = new Map<string, CouncilMember>();

    allSigners.forEach((member) => {
      const role = getMemberRole(member);

      if (!role || role.includes("SUPLENTE")) return;

      if (role === "ALCALDESA" || role === "SECRETARIA") return;

      if (!uniqueRolesMap.has(role)) {
        uniqueRolesMap.set(role, member);
      }
    });

    const roleHierarchy: Record<string, number> = {
      SINDICO: 1,
      PRIMER_REGIDOR: 2,
      SEGUNDO_REGIDOR: 3,
      TERCER_REGIDOR: 4,
      CUARTO_REGIDOR: 5,
      QUINTO_REGIDOR: 6,
      SEXTO_REGIDOR: 7,
      SEPTIMO_REGIDOR: 8,
      OCTAVO_REGIDOR: 9,
    };

    const columnSignatories = Array.from(uniqueRolesMap.values()).sort(
      (a, b) => {
        const rA = getMemberRole(a);
        const rB = getMemberRole(b);
        return (roleHierarchy[rA] || 99) - (roleHierarchy[rB] || 99);
      }
    );

    pages.push(
      <Page
        key="closing"
        size={settings.pageSize}
        orientation={settings.orientation}
        style={dynamicPageStyle}
      >
        <View style={styles.coverContainer}>
          <Text style={styles.coverTitle}>El Concejo Municipal</Text>
          <Text
            style={{
              ...styles.coverText,
              lineHeight: settings.lineHeight,
              textAlign: "justify",
              marginBottom: 16,
            }}
          >
            Cierra el presente Libro de Actas Municipales Tomo{" "}
            {numberToRoman(tome.number)} que llevó durante el corriente año, con
            <Text> {actCountInWords} Actas</Text> asentadas.
          </Text>
          <Text
            style={{
              ...styles.coverText,
              lineHeight: settings.lineHeight,
              textAlign: "justify",
              marginTop: 0,
            }}
          >
            Alcaldía Municipal Antiguo Cuscatlán, a los {closingDayInWords} días
            del mes de {closingMonthName} de {closingYearInWords}.
          </Text>

          <View
            style={{
              ...styles.signaturesSection,
              marginTop: 40,
              textAlign: "left",
            }}
          >
            <View style={{ marginBottom: 40, textAlign: "center" }}>
              <Text>{closingAlcaldesa.name}</Text>
              <Text style={styles.mainSignatureRole}>Alcaldesa Municipal</Text>
            </View>

            <View style={styles.signatureColumnsContainer}>
              <View style={styles.signatureColumn}>
                {columnSignatories
                  .filter((_, i) => i % 2 === 0)
                  .map((p) => (
                    <View key={p.id || p.name} style={{ marginBottom: 35 }}>
                      <Text style={styles.signatureName}>{p.name}</Text>
                    </View>
                  ))}
              </View>
              <View style={styles.signatureColumn}>
                {columnSignatories
                  .filter((_, i) => i % 2 !== 0)
                  .map((p) => (
                    <View key={p.id || p.name} style={{ marginBottom: 35 }}>
                      <Text style={styles.signatureName}>{p.name}</Text>
                    </View>
                  ))}
              </View>
            </View>

            <View
              style={{ ...styles.secretariaSignature, textAlign: "center" }}
            >
              <Text>{closingSecretaria.name}</Text>
              <Text style={styles.mainSignatureRole}>Secretaria Municipal</Text>
            </View>
          </View>
        </View>
        {settings.enablePageNumbering && (
          <Text
            style={styles.pageNumber}
            fixed
            render={({ pageNumber }) => {
              const start = Number(initialPageNumber) || 1;
              const effectivePageNumber = pageNumber + (start - 1);
              const offset = settings.pageNumberingOffset || 0;
              const displayPageNumber = targetActId
                ? effectivePageNumber
                : effectivePageNumber - offset;
              if (displayPageNumber <= 0) return "";
              return `${displayPageNumber}`;
            }}
          />
        )}
      </Page>
    );
  }

  if (pages.length === 0) {
    pages.push(
      <Page key="empty" size="A4">
        <Text> </Text>
      </Page>
    );
  }

  return (
    <Document
      title={targetActId ? "Vista Previa Acta" : `Libro - ${tome.name}`}
    >
      {pages}
    </Document>
  );
};
