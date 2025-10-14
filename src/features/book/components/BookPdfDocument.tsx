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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { numberToWords, capitalize } from "@/lib/textUtils";
import { type Book, type Act } from "@/types";
import type { JSX } from "react/jsx-runtime";

// --- Registro de Fuentes Locales (sin cambios) ---
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

// --- ✅ ESTILOS AHORA SON UNA FUNCIÓN QUE ACEPTA EL TAMAÑO DE FUENTE ---
const getStyles = (fontSize = 11) =>
  StyleSheet.create({
    page: {
      fontFamily: "Museo Sans",
      fontSize: fontSize, // ✅ Usa el tamaño de fuente base
      color: "#000",
      fontWeight: 500,
    },
    coverContainer: {
      textAlign: "left",
      flex: 1,
    },
    coverTitle: {
      fontSize: fontSize + 1,
      fontFamily: "Museo Sans",
      fontWeight: 700,
      marginBottom: 40,
    },
    coverText: {
      fontSize: fontSize,
      textAlign: "justify",
      marginBottom: 12,
    },
    coverDate: { fontSize: fontSize, marginTop: 40 },
    indexTitle: {
      fontSize: fontSize + 5, // Título del índice más grande
      fontFamily: "Museo Sans",
      fontWeight: 700,
      textAlign: "center",
      marginBottom: 30,
      textTransform: "uppercase",
    },
    // ... (el resto de los estilos que no dependen del tamaño de fuente se mantienen igual)
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
    actaHeader: {
      fontSize: fontSize,
      textAlign: "justify",
    },
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

// --- (El resto del código del motor de renderizado se mantiene igual) ---

// --- Motor de Renderizado ---
const renderInlineFormatting = (text: string) => {
  const parts = text
    .replace(/<p[^>]*>|<\/p>|<li[^>]*>|<\/li>/g, "")
    .trim()
    .split(/(<strong>.*?<\/strong>|<em>.*?<\/em>|<u>.*?<\/u>)/g)
    .filter(Boolean);
  return parts.map((part, partIndex) => {
    if (part.startsWith("<strong>"))
      return (
        <Text
          key={partIndex}
          style={{ fontFamily: "Museo Sans", fontWeight: 700 }}
        >
          {part.replace(/<\/?strong>/g, "")}
        </Text>
      );
    if (part.startsWith("<em>"))
      return (
        <Text key={partIndex} style={{ fontStyle: "italic" }}>
          {part.replace(/<\/?em>/g, "")}
        </Text>
      );
    if (part.startsWith("<u>"))
      return (
        <Text key={partIndex} style={{ textDecoration: "underline" }}>
          {part.replace(/<\/?u>/g, "")}
        </Text>
      );
    return <Text key={partIndex}>{part.replace(/<[^>]*>/g, "")}</Text>;
  });
};

const renderContentBlocks = (
  html: string,
  baseTextStyle: object
): (JSX.Element | null)[] | null => {
  if (!html || !html.trim()) return null;
  const cleanHtml = html.replace(
    /<p><strong>(Acta|Acuerdo) número [^<]*<\/strong><\/p>/,
    ""
  );

  const blockRegex = /<(p|ul|ol|table)[^>]*>.*?<\/\1>/gs;
  const blocks: string[] = cleanHtml.match(blockRegex) || [];

  if (blocks.length === 0 && cleanHtml.trim()) {
    blocks.push(`<p>${cleanHtml}</p>`);
  }

  return blocks.map((block, blockIndex) => {
    if (block.trim().startsWith("<table")) {
      const rows = block.match(/<tr[^>]*>(.*?)<\/tr>/gs) || [];
      let maxColumns = 0;
      rows.forEach((row) => {
        const cells = row.match(/<(?:td|th)[^>]*>.*?<\/(?:td|th)>/gs) || [];
        let colCount = 0;
        cells.forEach((cell) => {
          colCount += parseInt(cell.match(/colspan="(\d+)"/)?.[1] || "1", 10);
        });
        if (colCount > maxColumns) maxColumns = colCount;
      });
      if (maxColumns === 0) maxColumns = 1;

      return (
        <View key={`table-${blockIndex}`} style={getStyles().table}>
          {rows.map((rowContent, rowIndex) => (
            <View key={`row-${rowIndex}`} style={getStyles().tableRow}>
              {(
                rowContent.match(/<(?:td|th)[^>]*>(.*?)<\/(?:td|th)>/gs) || []
              ).map((cellContent, cellIndex) => {
                const colspan = parseInt(
                  cellContent.match(/colspan="(\d+)"/)?.[1] || "1",
                  10
                );
                const cellWidth = `${(100 / maxColumns) * colspan}%`;
                const isHeader = cellContent.trim().startsWith("<th");
                const innerHtml = cellContent
                  .replace(/<(?:td|th)[^>]*>/, "")
                  .replace(/<\/(?:td|th)>$/, "");
                return (
                  <View
                    key={`cell-${cellIndex}`}
                    style={{ ...getStyles().tableCell, width: cellWidth }}
                  >
                    {renderContentBlocks(innerHtml, {
                      ...getStyles().tableCellText,
                      fontFamily: "Museo Sans",
                      fontWeight: isHeader ? 700 : 500,
                    })}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      );
    }

    if (block.trim().startsWith("<ol") || block.trim().startsWith("<ul")) {
      const isOrdered = block.trim().startsWith("<ol");
      const listItems = block.match(/<li[^>]*>(.*?)<\/li>/gs) || [];
      return (
        <View key={`list-${blockIndex}`} style={getStyles().listContainer}>
          {listItems.map((item, itemIndex) => (
            <View key={`item-${itemIndex}`} style={getStyles().listItem}>
              <Text style={getStyles().listItemBullet}>
                {isOrdered ? `${itemIndex + 1}.` : "•"}
              </Text>
              <View style={getStyles().listItemContent}>
                {renderContentBlocks(item, baseTextStyle)}
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
      const alignMatch = block.match(
        /text-align:\s*(left|center|right|justify)/
      );
      const textAlign = alignMatch
        ? (alignMatch[1] as "left" | "center" | "right" | "justify")
        : "justify";
      return (
        <Text key={`p-${blockIndex}`} style={{ ...baseTextStyle, textAlign }}>
          {renderInlineFormatting(block)}
        </Text>
      );
    }
    return null;
  });
};

const renderHtmlContent = (htmlContent: string, style: object) => {
  return renderContentBlocks(htmlContent, style);
};

const generateActHeaderContent = (act: Act) => {
  const sessionType = act.sessionType || "ordinary";
  const sessionTime = act.sessionTime || "diez horas";
  const formatDateInWords = (dateString: string): string => {
    const date = new Date(dateString);
    const day = numberToWords(date.getDate());
    const month = format(date, "MMMM", { locale: es });
    const year = numberToWords(date.getFullYear());
    return `${day} de ${month} del año ${year}`;
  };
  const generateAttendeesList = (): string => {
    return act.attendees?.owners?.map((p) => p.name).join(", ") || "";
  };
  const sindicoName = act.attendees?.syndic?.name || "[Síndico]";
  const secretariaName = act.attendees?.secretary?.name || "[Secretaria]";
  const attendeesList = generateAttendeesList();
  const dateInWords = formatDateInWords(
    act.sessionDate || new Date().toISOString()
  );

  return (
    <>
      <Text style={{ fontWeight: 700 }}>{act.name}</Text>. Sesión {sessionType}{" "}
      celebrada por el Concejo Municipal en el salón de reuniones de la Alcaldía
      Municipal de Antiguo Cuscatlán, a las {sessionTime} del día {dateInWords},
      presidió la reunión la señora Alcaldesa Municipal Licda. Zoila Milagro
      Navas Quintanilla, con la asistencia del señor Síndico Municipal
      Licenciado {sindicoName} y de los concejales propietarios: {attendeesList}{" "}
      y la Secretaria Municipal del Concejo Sra. {secretariaName}. Seguidamente
      la sesión dio inicio con los siguientes puntos:
    </>
  );
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

  // ✅ Obtiene los estilos dinámicos basados en la configuración
  const styles = getStyles(settings.fontSize);

  const dynamicPageStyle = {
    paddingTop: settings.margins.top,
    paddingBottom: settings.margins.bottom,
    paddingLeft: settings.margins.left,
    paddingRight: settings.margins.right,
    fontFamily: "Museo Sans",
    fontSize: settings.fontSize,
    color: "#000",
    fontWeight: 500,
  };

  const dynamicTextStyle = {
    fontSize: settings.fontSize,
    textAlign: "justify" as const,
    lineHeight: settings.lineHeight,
  };

  const creationDate = new Date(book.createdAt);
  const yearInWords = capitalize(numberToWords(creationDate.getFullYear()));
  const dayInWords = numberToWords(creationDate.getDate());
  const monthName = format(creationDate, "MMMM", { locale: es });

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
                <Text
                  style={{
                    ...styles.actaHeader,
                    lineHeight: settings.lineHeight,
                  }}
                >
                  {generateActHeaderContent(act)}
                </Text>
                {hasBodyContent && (
                  <View style={{ marginTop: 8 }}>
                    {renderHtmlContent(act.bodyContent, dynamicTextStyle)}
                  </View>
                )}
                {hasAgreements && (
                  <View style={{ marginTop: hasBodyContent ? 16 : 8 }} wrap>
                    {act.agreements.map((agreement) => (
                      <View key={agreement.id} wrap={true}>
                        {renderHtmlContent(agreement.content, dynamicTextStyle)}
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
                    <Text>
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
