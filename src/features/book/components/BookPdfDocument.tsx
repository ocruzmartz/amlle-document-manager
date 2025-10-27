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
import type { Style, HyphenationCallback } from "@react-pdf/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { numberToWords, capitalize } from "@/lib/textUtils";
import { type Book, type Act } from "@/types";
import type { JSX } from "react/jsx-runtime";

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
        case "font-size":
          style.fontSize = parseFloat(val);
          break;
        case "text-align":
          style.textAlign = val as "left" | "right" | "center" | "justify";
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
      }
    }
  });
  return style;
};

const renderHtmlNodes = (html: string, baseStyle: Style): JSX.Element[] => {
  if (!html) return [];

  const cleanHtml = html.replace(/&nbsp;/g, " ");

  // ✅ 1. Regex actualizada para capturar <br> (etiqueta aut-cerrada)
  const regex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>|<(br)\s*\/?>|([^<]+)/g;
  let match;
  const nodes = [];
  let key = 0;

  while ((match = regex.exec(cleanHtml)) !== null) {
    const [, tagName, attributes, innerHtml, brTag, plainText] = match;

    if (plainText) {
      nodes.push(
        <Text key={key++} style={baseStyle}>
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
      let style: Style = { ...baseStyle };
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
          style = { ...style, ...inlineStyle };
          break;
        case "p":
          style = { ...style, ...inlineStyle };
          nodes.push(
            <Text
              key={key++}
              style={style}
              hyphenationCallback={hyphenationCallback}
            >
              {renderHtmlNodes(innerHtml, {})}
            </Text>
          );
          continue;
      }

      nodes.push(
        <Text key={key++} style={style}>
          {renderHtmlNodes(innerHtml, {})}
        </Text>
      );
    }
  }
  return nodes;
};

const getStyles = (fontSize = 11) =>
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
    table: {
      width: "100%",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#bfbfbf",
      marginBottom: 10,
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    tableRow: { flexDirection: "row" },
    tableCell: {
      padding: 5,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#bfbfbf",
      borderLeftWidth: 0,
      borderTopWidth: 0,
      flexWrap: "wrap",
    },
    tableCellText: { fontSize: fontSize - 2, textAlign: "left" },
    signaturesSection: {
      marginTop: 60,
      textAlign: "center",
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
  });

const renderContentBlocks = (
  html: string,
  baseTextStyle: Style
): (JSX.Element | null)[] | null => {
  if (!html || !html.trim()) return null;
  const cleanHtml = html.replace(
    /<p><strong>(Acta|Acuerdo) número [^<]*<\/strong><\/p>/,
    ""
  );

  const blockRegex = /<(p|ul|ol|table)[^>]*>[\s\S]*?<\/\1>/gs;
  const blocks: string[] = cleanHtml.match(blockRegex) || [];

  if (blocks.length === 0 && cleanHtml.trim()) {
    blocks.push(`<p>${cleanHtml}</p>`);
  }

  return blocks.map((block, blockIndex) => {
    if (block.trim().startsWith("<table")) {
      const rows = block.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gs) || [];
      return (
        <View key={`table-${blockIndex}`} style={getStyles().table}>
          {rows.map((rowContent, rowIndex) => (
            <View key={`row-${rowIndex}`} style={getStyles().tableRow}>
              {(rowContent.match(/<(t[dh])[^>]*>([\s\S]*?)<\/\1>/gs) || []).map(
                (cellHtml, cellIndex) => {
                  const cellTagMatch = cellHtml.match(/<(t[dh])([^>]*)>/);
                  const isHeader = cellTagMatch
                    ? cellTagMatch[1] === "th"
                    : false;
                  const attributes = cellTagMatch ? cellTagMatch[2] : "";
                  const styleAttr = attributes.match(/style="([^"]*)"/);
                  const cellInlineStyle = parseStyleAttribute(
                    styleAttr ? styleAttr[1] : null
                  );

                  const innerHtml = cellHtml
                    .replace(/<t[dh][^>]*>/, "")
                    .replace(/<\/t[dh]>$/, "");

                  return (
                    <View
                      key={`cell-${cellIndex}`}
                      style={{ ...getStyles().tableCell, ...cellInlineStyle }}
                    >
                      {renderHtmlNodes(innerHtml, {
                        ...getStyles().tableCellText,
                        fontWeight: isHeader ? 700 : 500,
                      })}
                    </View>
                  );
                }
              )}
            </View>
          ))}
        </View>
      );
    }

    if (block.trim().startsWith("<ol") || block.trim().startsWith("<ul")) {
      const isOrdered = block.trim().startsWith("<ol");
      const listItems = block.match(/<li[^>]*>([\s\S]*?)<\/li>/gs) || [];
      return (
        <View key={`list-${blockIndex}`} style={getStyles().listContainer}>
          {listItems.map((item, itemIndex) => (
            <View key={`item-${itemIndex}`} style={getStyles().listItem}>
              <Text style={getStyles().listItemBullet}>
                {isOrdered ? `${itemIndex + 1}.` : "•"}
              </Text>
              <View style={getStyles().listItemContent}>
                {renderContentBlocks(
                  item.replace(/<\/?li[^>]*>/g, ""),
                  baseTextStyle
                )}
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (block.trim().startsWith("<p")) {
      const innerHtml = block.replace(/<\/?p[^>]*>/g, "").trim();
      if (innerHtml === "" || innerHtml === "<br>" || innerHtml === "&nbsp;") {
        return (
          <View key={`p-${blockIndex}`} style={getStyles().emptyParagraph} />
        );
      }
      const styleAttr = block.match(/style="([^"]*)"/);
      const pStyle = parseStyleAttribute(styleAttr ? styleAttr[1] : null);
      return (
        <Text
          key={`p-${blockIndex}`}
          style={{ ...baseTextStyle, ...pStyle }}
          hyphenationCallback={hyphenationCallback}
        >
          {renderHtmlNodes(innerHtml, {})}
        </Text>
      );
    }
    return null;
  });
};

export const BookPdfDocument = ({ book }: { book: Book | null }) => {
  if (!book) {
    return (
      <Document>
        <Page size="A4" style={getStyles().page}>
          <Text>No hay libro seleccionado</Text>
        </Page>
      </Document>
    );
  }

  const settings = book.pdfSettings || {
    pageSize: "A4",
    orientation: "portrait",
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
    lineHeight: 1.5,
    fontSize: 11,
  };

  const styles = getStyles(settings.fontSize);

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

  const authDateString = book.authorizationDate || book.createdAt;
  const authorizationDate = new Date(authDateString);
  const yearInWords = capitalize(
    numberToWords(authorizationDate.getFullYear())
  );
  const dayInWords = numberToWords(authorizationDate.getDate());
  const monthName = format(authorizationDate, "MMMM", { locale: es });

  return (
    <Document title={`Libro de Actas - ${book.name}`}>
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
              hyphenationCallback={hyphenationCallback}
            >
              Autoriza el presente Libro para que el Concejo Municipal de
              Antiguo Cuscatlán, Departamento de La Libertad, asiente las Actas
              y Acuerdos Municipales, de las Sesiones que celebre durante el año{" "}
              <Text style={{ fontWeight: 700 }}>{yearInWords}</Text> numeradas
              correlativamente.
            </Text>
            <Text
              style={{ ...styles.coverDate, lineHeight: settings.lineHeight }}
            >
              Alcaldía Municipal de Antiguo Cuscatlán, a los{" "}
              <Text style={{ fontWeight: 700 }}>
                {dayInWords} días del mes de {monthName}
              </Text>{" "}
              de <Text style={{ fontWeight: 700 }}>{yearInWords}</Text>.
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
      </Page>
      <Page
        size={settings.pageSize}
        orientation={settings.orientation}
        style={dynamicPageStyle}
      >
        <Text style={styles.indexTitle}>Índice</Text>
        {!book.acts || book.acts.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>No hay actas creadas aún</Text>
          </View>
        ) : (
          <View>
            {book.acts.map((act, actIndex) => (
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
      </Page>
      {book.acts && book.acts.length > 0 && (
        <Page
          size={settings.pageSize}
          orientation={settings.orientation}
          style={dynamicPageStyle}
          wrap
        >
          {book.acts.map((act: Act) => {
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
                    {renderContentBlocks(act.bodyContent, dynamicTextStyle)}
                  </View>
                )}
                {hasAgreements && (
                  <View style={{ marginTop: hasBodyContent ? 16 : 8 }} wrap>
                    {act.agreements.map((agreement) => (
                      <View key={agreement.id} wrap={true}>
                        {renderContentBlocks(
                          agreement.content,
                          dynamicTextStyle
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
        </Page>
      )}
    </Document>
  );
};
