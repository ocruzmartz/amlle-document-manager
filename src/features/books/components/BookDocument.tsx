// src/features/books/components/BookDocument.tsx

import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { numberToWords, capitalize } from "@/lib/textUtils";
import { type Book, type Act } from "@/types"; // ✅ Importación corregida

const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 60,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#000",
  },

  // ===== ESTILOS PARA LA PORTADA =====
  coverContainer: {
    textAlign: "left",
    flex: 1,
    justifyContent: "space-between",
  },
  coverTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 40,
  },
  coverText: {
    fontSize: 11,
    textAlign: "justify",
    lineHeight: 1.6,
    marginBottom: 12,
  },
  coverDate: {
    fontSize: 11,
    marginTop: 25,
  },

  // ===== ESTILOS PARA EL ÍNDICE =====
  indexTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 30,
    textTransform: "uppercase",
  },
  indexItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "dotted",
    paddingBottom: 2,
  },
  indexItemText: {
    fontSize: 11,
  },

  // ===== ESTILOS PARA LAS ACTAS =====
  actaContainer: {
    marginBottom: 40,
  },
  actaHeader: {
    fontSize: 11,
    textAlign: "justify",
    marginBottom: 15,
    lineHeight: 1.6,
  },
  actaContent: {
    fontSize: 11,
    textAlign: "justify",
    lineHeight: 1.6,
    marginBottom: 10,
  },

  // Estilos para listas
  listContainer: {
    paddingLeft: 15,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  listItemBullet: {
    width: 15,
    fontSize: 11,
  },
  listItemContent: {
    flex: 1,
    fontSize: 11,
    textAlign: "justify",
  },

  // ===== FIRMAS Y NOTA =====
  signaturesSection: {
    marginTop: 60,
    textAlign: "center",
    fontSize: 11,
  },
  mainSignatureName: {
    fontFamily: "Helvetica-Bold",
  },
  mainSignatureRole: {
    fontSize: 10,
    marginBottom: 25,
  },
  signatureColumnsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    textAlign: "left",
  },
  signatureColumn: {
    width: "48%",
    flexDirection: "column",
  },
  signatureName: {
    marginBottom: 20,
    fontSize: 11,
  },
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
    fontSize: 9,
    textAlign: "justify",
  },
  notaTitle: {
    fontFamily: "Helvetica-Bold",
  },
});

interface BookDocumentProps {
  book: Book | null;
}

const renderHtmlContent = (htmlContent: string) => {
  if (!htmlContent || htmlContent.trim() === "<p></p>" || !htmlContent.trim()) {
    return null;
  }

  // Limpia el título autogenerado del acta para evitar duplicados
  const cleanContent = htmlContent.replace(
    /<p><strong>Acta número [^<]*<\/strong><\/p>/,
    ""
  );

  // Divide el contenido en bloques (texto, listas)
  const blocks = cleanContent
    .split(/(<(?:ul|ol)[^>]*>.*?<\/(?:ul|ol)>)/gs)
    .filter(Boolean);

  return blocks.map((block, blockIndex) => {
    // Bloque de lista
    if (block.trim().startsWith("<ol") || block.trim().startsWith("<ul")) {
      const isOrdered = block.trim().startsWith("<ol");
      const listItems = block.match(/<li[^>]*>(.*?)<\/li>/gs) || [];

      return (
        <View key={`list-${blockIndex}`} style={styles.listContainer}>
          {listItems.map((item, itemIndex) => {
            const itemText = item.replace(/<[^>]*>/g, "").trim();
            if (!itemText) return null;

            return (
              <View key={`item-${itemIndex}`} style={styles.listItem}>
                <Text style={styles.listItemBullet}>
                  {isOrdered ? `${itemIndex + 1}.` : "•"}
                </Text>
                <Text style={styles.listItemContent}>{itemText}</Text>
              </View>
            );
          })}
        </View>
      );
    }
    // Bloque de Párrafo
    else {
      const paragraphs = block.split("</p>").filter((p) => p.trim());
      return paragraphs.map((p, pIndex) => {
        const textContent = p.replace(/<p>|<\/p>/g, "").trim();
        if (!textContent) return null;

        // Regex para encontrar <strong>, <em>, <u>
        const parts = textContent
          .split(/(<strong>.*?<\/strong>|<em>.*?<\/em>|<u>.*?<\/u>)/g)
          .filter(Boolean);

        return (
          <Text key={`p-${blockIndex}-${pIndex}`} style={styles.actaContent}>
            {parts.map((part, partIndex) => {
              if (part.startsWith("<strong>")) {
                return (
                  <Text
                    key={partIndex}
                    style={{ fontFamily: "Helvetica-Bold" }}
                  >
                    {part.replace(/<\/?strong>/g, "")}
                  </Text>
                );
              }
              if (part.startsWith("<em>")) {
                return (
                  <Text key={partIndex} style={{ fontStyle: "italic" }}>
                    {part.replace(/<\/?em>/g, "")}
                  </Text>
                );
              }
              if (part.startsWith("<u>")) {
                return (
                  <Text key={partIndex} style={{ textDecoration: "underline" }}>
                    {part.replace(/<\/?u>/g, "")}
                  </Text>
                );
              }
              return (
                <Text key={partIndex}>{part.replace(/<[^>]*>/g, "")}</Text>
              );
            })}
          </Text>
        );
      });
    }
  });
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
    const propietarios =
      act.attendees?.propietarios?.map((p) => p.name).join(", ") || "";
    return propietarios;
  };

  const sindicoName = act.attendees?.sindico?.name || "[Síndico]";
  const secretariaName = act.attendees?.secretaria?.name || "[Secretaria]";
  const attendeesList = generateAttendeesList();
  const dateInWords = formatDateInWords(
    act.sessionDate || new Date().toISOString()
  );

  return (
    <Text style={styles.actaHeader}>
      <Text style={{ fontSize: 13, fontWeight: "bold" }}>{act.name}</Text>.
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

export const BookDocument = ({ book }: BookDocumentProps) => {
  if (!book) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>No hay libro seleccionado</Text>
          </View>
        </Page>
      </Document>
    );
  }

  const creationDate = new Date(book.createdAt);
  const yearInWords = capitalize(numberToWords(creationDate.getFullYear()));
  const dayInWords = numberToWords(creationDate.getDate());
  const monthName = format(creationDate, "MMMM", { locale: es });

  return (
    <Document title={`Libro de Actas - ${book.name}`}>
      {/* ===== COVER PAGE ===== */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverContainer}>
          <View>
            <Text style={styles.coverTitle}>
              La Suscrita Alcaldesa Municipal
            </Text>
            <Text style={styles.coverText}>
              Autoriza el presente Libro para que el Concejo Municipal de
              Antiguo Cuscatlán, Departamento de La Libertad, asiente las Actas
              y Acuerdos Municipales, de las Sesiones que celebre durante el año{" "}
              <Text style={{ fontFamily: "Helvetica-Bold" }}>
                {yearInWords}
              </Text>{" "}
              numeradas correlativamente.
            </Text>
            <Text style={styles.coverDate}>
              Alcaldía Municipal de Antiguo Cuscatlán, a los{" "}
              <Text style={{ fontFamily: "Helvetica-Bold" }}>
                {dayInWords} días del mes de {monthName}
              </Text>{" "}
              de{" "}
              <Text style={{ fontFamily: "Helvetica-Bold" }}>
                {yearInWords}
              </Text>
              .
            </Text>
          </View>
          <View>
            <View
              style={{
                marginTop: 80,
                flexDirection: "row",
                justifyContent: "space-around",
                textAlign: "center",
              }}
            >
              <View style={{ width: "45%" }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                  Licda. Zoila Milagro Navas Quintanilla
                </Text>
                <View
                  style={{
                    borderBottom: 1,
                    borderColor: "#000",
                    marginVertical: 5,
                  }}
                />
                <Text>Alcaldesa Municipal</Text>
              </View>
              <View style={{ width: "45%" }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Ante Mí,</Text>
                <View style={{ height: 22 }} />
                <View
                  style={{
                    borderBottom: 1,
                    borderColor: "#000",
                    marginVertical: 5,
                  }}
                />
                <Text>Secretaria Municipal</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* ===== INDEX PAGE ===== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.indexTitle}>Índice</Text>

        {!book.acts || book.acts.length === 0 ? ( // ✅ CAMBIO: acts
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>No hay actas creadas aún</Text>
          </View>
        ) : (
          <View>
            {book.acts.map(
              (
                act,
                index // ✅ CAMBIO: acts y tipado explícito
              ) => (
                <View key={act.id} style={styles.indexItem}>
                  <Text style={styles.indexItemText}>{act.name}</Text>
                  <Text style={styles.indexItemPage}>{index + 3}</Text>
                </View>
              )
            )}
          </View>
        )}
      </Page>

      {/* ===== ACTS PAGES ===== */}
      {book.acts &&
        book.acts.length > 0 && ( // ✅ CAMBIO: acts
          <Page size="A4" style={styles.page} wrap>
            {book.acts?.map(
              (
                act: Act // ✅ CAMBIO: acts y tipado explícito
              ) => (
                <View
                  key={act.id}
                  style={styles.actaContainer}
                  break={false}
                  wrap
                >
                  {generateActHeader(act)}

                  <View style={{ marginTop: 20 }}>
                    {renderHtmlContent(act.bodyContent)}
                  </View>

                  {act.agreements && act.agreements.length > 0 && (
                    <View style={{ marginTop: 30 }} wrap>
                      {/* ❌ Eliminamos el título general "ACUERDOS" */}

                      {act.agreements.map((agreement) => (
                        <View key={agreement.id} wrap={false}>
                          {/* ✅ Usamos renderHtmlContent para que interprete negritas, etc. */}
                          {renderHtmlContent(agreement.content)}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Signatures Section */}
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
                        act.attendees?.sindico,
                        ...(act.attendees?.propietarios || []),
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

                  {/* Clarifying Note */}
                  {act.clarifyingNote &&
                    act.clarifyingNote.trim() !== "<p></p>" && (
                      <View style={styles.notaContainer}>
                        <Text>
                          <Text style={styles.notaTitle}>
                            Nota Aclaratoria:{" "}
                          </Text>
                          {act.clarifyingNote.replace(/<[^>]*>/g, "")}
                        </Text>
                      </View>
                    )}
                </View>
              )
            )}
          </Page>
        )}
    </Document>
  );
};
