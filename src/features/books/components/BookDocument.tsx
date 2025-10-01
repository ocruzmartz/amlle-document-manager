import React from 'react';
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { numberToWords, capitalize } from "@/lib/textUtils";
import { type Book, type Act } from "@/types";
import type { JSX } from 'react/jsx-runtime';

const styles = StyleSheet.create({
  page: { paddingTop: 50, paddingBottom: 50, paddingHorizontal: 60, fontFamily: "Helvetica", fontSize: 11, lineHeight: 1.5, color: "#000" },
  coverContainer: { textAlign: "left", flex: 1, justifyContent: "space-between" },
  coverTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 40 },
  coverText: { fontSize: 11, textAlign: "justify", lineHeight: 1.6, marginBottom: 12 },
  coverDate: { fontSize: 11, marginTop: 25 },
  indexTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 30, textTransform: "uppercase" },
  indexItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#ccc", borderBottomStyle: "dotted", paddingBottom: 2 },
  indexItemText: { fontSize: 11 },
  indexItemPage: { fontSize: 11 },
  actaContainer: { marginBottom: 40 },
  actaHeader: { fontSize: 11, textAlign: "justify", marginBottom: 15, lineHeight: 1.6 },
  actaContent: { fontSize: 11, textAlign: "justify", lineHeight: 1.6, marginBottom: 10 },
  listContainer: { paddingLeft: 15, marginBottom: 10 },
  listItem: { flexDirection: "row", marginBottom: 5 },
  listItemBullet: { width: 15, fontSize: 10 },
  listItemContent: { flex: 1 },
  table: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#bfbfbf", marginBottom: 10, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { flexDirection: "row" },
  tableCell: { padding: 5, borderStyle: "solid", borderWidth: 1, borderColor: "#bfbfbf", borderLeftWidth: 0, borderTopWidth: 0 },
  tableCellText: { fontSize: 9, textAlign: "left" },
  signaturesSection: { marginTop: 60, textAlign: "center", fontSize: 11 },
  mainSignatureName: { fontFamily: "Helvetica-Bold" },
  mainSignatureRole: { fontSize: 10, marginBottom: 25 },
  signatureColumnsContainer: { flexDirection: "row", justifyContent: "space-between", textAlign: "left" },
  signatureColumn: { width: "48%", flexDirection: "column" },
  signatureName: { marginBottom: 20, fontSize: 11 },
  secretariaSignature: { marginTop: 30, paddingTop: 5, marginHorizontal: "auto", width: "50%" },
  secretariaSignatureLine: { borderBottomWidth: 0.5, borderBottomColor: "#000", marginBottom: 5 },
  notaContainer: { marginTop: 30, fontSize: 9, textAlign: "justify" },
  notaTitle: { fontFamily: "Helvetica-Bold" },
});

// --- Motor de Renderizado Jerárquico (Versión Final y Robusta) ---

const renderInlineFormatting = (text: string) => {
  const parts = text.replace(/<p[^>]*>|<\/p>|<li[^>]*>|<\/li>/g, "").trim().split(/(<strong>.*?<\/strong>|<em>.*?<\/em>|<u>.*?<\/u>)/g).filter(Boolean);
  return parts.map((part, partIndex) => {
    if (part.startsWith('<strong>')) return <Text key={partIndex} style={{ fontFamily: 'Helvetica-Bold' }}>{part.replace(/<\/?strong>/g, '')}</Text>;
    if (part.startsWith('<em>')) return <Text key={partIndex} style={{ fontStyle: 'italic' }}>{part.replace(/<\/?em>/g, '')}</Text>;
    if (part.startsWith('<u>')) return <Text key={partIndex} style={{ textDecoration: 'underline' }}>{part.replace(/<\/?u>/g, '')}</Text>;
    return <Text key={partIndex}>{part.replace(/<[^>]*>/g, "")}</Text>;
  });
};

const renderContentBlocks = (html: string, baseTextStyle: object): (JSX.Element | null)[] | null => {
  if (!html || !html.trim()) return null;
  const cleanHtml = html.replace(/<p><\/p>/g, '').replace(/<p><strong>(Acta|Acuerdo) número [^<]*<\/strong><\/p>/, "");
  
  // Expresión regular para capturar todos los bloques de nivel superior
  const blockRegex = /<(p|ul|ol|table)[^>]*>.*?<\/\1>/gs;
  const blocks: string[] = cleanHtml.match(blockRegex) || [];
  
  // Si no hay bloques, trata todo como un párrafo simple
  if (blocks.length === 0 && cleanHtml.trim()) {
    blocks.push(`<p>${cleanHtml}</p>`);
  }

  return blocks.map((block, blockIndex) => {
    if (block.trim().startsWith("<table")) {
      const rows = block.match(/<tr[^>]*>(.*?)<\/tr>/gs) || [];
      let maxColumns = 0;
      rows.forEach(row => {
        const cells = row.match(/<(?:td|th)[^>]*>.*?<\/(?:td|th)>/gs) || [];
        let colCount = 0;
        cells.forEach(cell => { colCount += parseInt(cell.match(/colspan="(\d+)"/)?.[1] || '1', 10); });
        if (colCount > maxColumns) maxColumns = colCount;
      });
      if (maxColumns === 0) maxColumns = 1;

      return (
        <View key={`table-${blockIndex}`} style={styles.table}>
          {rows.map((rowContent, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.tableRow}>
              {(rowContent.match(/<(?:td|th)[^>]*>(.*?)<\/(?:td|th)>/gs) || []).map((cellContent, cellIndex) => {
                const colspan = parseInt(cellContent.match(/colspan="(\d+)"/)?.[1] || '1', 10);
                const cellWidth = `${(100 / maxColumns) * colspan}%`;
                const isHeader = cellContent.trim().startsWith('<th');
                const innerHtml = cellContent.replace(/<(?:td|th)[^>]*>/, "").replace(/<\/(?:td|th)>$/, "");
                return (
                  <View key={`cell-${cellIndex}`} style={{ ...styles.tableCell, width: cellWidth }}>
                    {renderContentBlocks(innerHtml, { ...styles.tableCellText, fontFamily: isHeader ? "Helvetica-Bold" : "Helvetica" })}
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
        <View key={`list-${blockIndex}`} style={styles.listContainer}>
          {listItems.map((item, itemIndex) => (
            <View key={`item-${itemIndex}`} style={styles.listItem}>
              <Text style={styles.listItemBullet}>{isOrdered ? `${itemIndex + 1}.` : "•"}</Text>
              <View style={styles.listItemContent}>
                {renderContentBlocks(item, baseTextStyle)}
              </View>
            </View>
          ))}
        </View>
      );
    }
    
    if (block.trim().startsWith("<p")) {
      const alignMatch = block.match(/text-align:\s*(left|center|right|justify)/);
      const textAlign = alignMatch ? alignMatch[1] as 'left' | 'center' | 'right' | 'justify' : 'left';
      return (
        <Text key={`p-${blockIndex}`} style={{ ...baseTextStyle, textAlign }}>
          {renderInlineFormatting(block)}
        </Text>
      );
    }
    
    return null; // Ignorar texto que no esté en un bloque conocido
  });
};

const renderHtmlContent = (htmlContent: string) => {
    return renderContentBlocks(htmlContent, styles.actaContent);
};

const generateActHeader = (act: Act) => {
    const sessionType = act.sessionType || "ordinaria";
    const sessionTime = act.sessionTime || "diez horas";
    const formatDateInWords = (dateString: string): string => {
        const date = new Date(dateString);
        const day = numberToWords(date.getDate());
        const month = format(date, "MMMM", { locale: es });
        const year = numberToWords(date.getFullYear());
        return `${day} de ${month} del año ${year}`;
    };
    const generateAttendeesList = (): string => {
        return act.attendees?.propietarios?.map((p) => p.name).join(", ") || "";
    };
    const sindicoName = act.attendees?.sindico?.name || "[Síndico]";
    const secretariaName = act.attendees?.secretaria?.name || "[Secretaria]";
    const attendeesList = generateAttendeesList();
    const dateInWords = formatDateInWords(act.sessionDate || new Date().toISOString());
    return (
        <Text style={styles.actaHeader}>
            <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold' }}>{act.name}</Text>.
            Sesión {sessionType} celebrada por el Concejo Municipal en el salón de
            reuniones de la Alcaldía Municipal de Antiguo Cuscatlán, a las{" "}
            {sessionTime} del día {dateInWords}, presidió la reunión la señora
            Alcaldesa Municipal Licda. Zoila Milagro Navas Quintanilla, con la
            asistencia del señor Síndico Municipal Licenciado {sindicoName} y de los
            concejales propietarios: {attendeesList} y la Secretaria Municipal del
            Concejo Sra. {secretariaName}. Seguidamente la sesión dio inicio con los
            siguientes puntos:
        </Text>
    );
};

export const BookDocument = ({ book }: { book: Book | null }) => {
    if (!book) {
        return (
            <Document><Page size="A4" style={styles.page}><Text>No hay libro seleccionado</Text></Page></Document>
        );
    }
    const creationDate = new Date(book.createdAt);
    const yearInWords = capitalize(numberToWords(creationDate.getFullYear()));
    const dayInWords = numberToWords(creationDate.getDate());
    const monthName = format(creationDate, "MMMM", { locale: es });
    return (
        <Document title={`Libro de Actas - ${book.name}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.coverContainer}>
                    <View>
                        <Text style={styles.coverTitle}>La Suscrita Alcaldesa Municipal</Text>
                        <Text style={styles.coverText}>
                            Autoriza el presente Libro para que el Concejo Municipal de Antiguo Cuscatlán, Departamento de La Libertad, asiente las Actas y Acuerdos Municipales, de las Sesiones que celebre durante el año{" "}
                            <Text style={{ fontFamily: "Helvetica-Bold" }}>{yearInWords}</Text> numeradas correlativamente.
                        </Text>
                        <Text style={styles.coverDate}>
                            Alcaldía Municipal de Antiguo Cuscatlán, a los{" "}
                            <Text style={{ fontFamily: "Helvetica-Bold" }}>{dayInWords} días del mes de {monthName}</Text> de{" "}
                            <Text style={{ fontFamily: "Helvetica-Bold" }}>{yearInWords}</Text>.
                        </Text>
                    </View>
                    <View>
                        <View style={{ marginTop: 80, flexDirection: "row", justifyContent: "space-around", textAlign: "center" }}>
                            <View style={{ width: "45%" }}>
                                <Text style={{ fontFamily: "Helvetica-Bold" }}>Licda. Zoila Milagro Navas Quintanilla</Text>
                                <View style={{ borderBottom: 1, borderColor: "#000", marginVertical: 5 }} />
                                <Text>Alcaldesa Municipal</Text>
                            </View>
                            <View style={{ width: "45%" }}>
                                <Text style={{ fontFamily: "Helvetica-Bold" }}>Ante Mí,</Text>
                                <View style={{ height: 22 }} />
                                <View style={{ borderBottom: 1, borderColor: "#000", marginVertical: 5 }} />
                                <Text>Secretaria Municipal</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
            <Page size="A4" style={styles.page}>
                <Text style={styles.indexTitle}>Índice</Text>
                {!book.acts || book.acts.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><Text>No hay actas creadas aún</Text></View>
                ) : (
                    <View>
                        {book.acts.map((act, index) => (
                            <View key={act.id} style={styles.indexItem}>
                                <Text style={styles.indexItemText}>{act.name}</Text>
                                <Text style={styles.indexItemPage}>{index + 3}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </Page>
            {book.acts && book.acts.length > 0 && (
                <Page size="A4" style={styles.page} wrap>
                    {book.acts.map((act: Act) => (
                        <View key={act.id} style={styles.actaContainer} break={false} wrap>
                            {generateActHeader(act)}
                            <View style={{ marginTop: 20 }}>{renderHtmlContent(act.bodyContent)}</View>
                            {act.agreements && act.agreements.length > 0 && (
                                <View style={{ marginTop: 30 }} wrap>
                                    {act.agreements.map((agreement) => (
                                        <View key={agreement.id} wrap={true}>
                                            {renderHtmlContent(agreement.content)}
                                        </View>
                                    ))}
                                </View>
                            )}
                            <View style={styles.signaturesSection}>
                                <Text>Y no habiendo más que hacer constar se termina la presente Acta que firmamos.</Text>
                                <View style={{ marginTop: 40 }}>
                                    <Text style={styles.mainSignatureName}>Licda. Zoila Milagro Navas Quintanilla</Text>
                                    <Text style={styles.mainSignatureRole}>Alcaldesa Municipal</Text>
                                </View>
                                {(() => {
                                    const signatories = [act.attendees?.sindico, ...(act.attendees?.propietarios || [])].filter(Boolean);
                                    const leftColumn = signatories.filter((_, i) => i % 2 === 0);
                                    const rightColumn = signatories.filter((_, i) => i % 2 !== 0);
                                    return (
                                        <View style={styles.signatureColumnsContainer}>
                                            <View style={styles.signatureColumn}>
                                                {leftColumn.map(p => p && (<Text key={p.id} style={styles.signatureName}>{p.name}</Text>))}
                                            </View>
                                            <View style={styles.signatureColumn}>
                                                {rightColumn.map(p => p && (<Text key={p.id} style={styles.signatureName}>{p.name}</Text>))}
                                            </View>
                                        </View>
                                    );
                                })()}
                                <View style={styles.secretariaSignature}>
                                    <View style={styles.secretariaSignatureLine} />
                                    <Text>Secretaria Municipal</Text>
                                </View>
                            </View>
                            {act.clarifyingNote && act.clarifyingNote.trim() !== "<p></p>" && (
                                <View style={styles.notaContainer}>
                                    <Text>
                                        <Text style={styles.notaTitle}>Nota Aclaratoria: </Text>
                                        {act.clarifyingNote.replace(/<[^>]*>/g, "")}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </Page>
            )}
        </Document>
    );
};