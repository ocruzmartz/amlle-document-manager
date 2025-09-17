import { format } from "date-fns";
import { es } from "date-fns/locale";
import { numeroALetras } from "@/lib/textUtils";
import { type Act } from "@/types/act";

interface ActPagePreviewProps {
  act: Act;
  showHeader?: boolean; // ✅ Controlar si mostrar encabezado
}

export const ActPagePreview = ({ act, showHeader = true }: ActPagePreviewProps) => {
  const sessionType = act.sessionType || "ordinaria";

  const formatDateInWords = (dateString: string): string => {
    const date = new Date(dateString);
    const day = numeroALetras(date.getDate());
    const month = format(date, "MMMM", { locale: es });
    const year = numeroALetras(date.getFullYear());
    return `${day} de ${month} del año ${year}`;
  };

  const generateAttendeesList = (): string => {
    const propietarios =
      act.attendees?.propietarios?.map((p) => p.name).join(", ") || "";
    return propietarios;
  };

  return (
    <div className="act-content">
      {/* ✅ Encabezado del Acta (solo si showHeader es true) */}
      {showHeader && (
        <div className="content-section">
          <p className="text-justify leading-relaxed mb-4">
            <span className="font-medium text-lg">{act.name}</span>. Sesión{" "}
            {sessionType} celebrada por el Concejo Municipal en el salón de
            reuniones de la Alcaldía Municipal de Antiguo Cuscatlán, a las{" "}
            {act.sessionTime || "diez horas"} del día{" "}
            {formatDateInWords(act.sessionDate || new Date().toISOString())},
            presidió la reunión la señora Alcaldesa Municipal Licda. Zoila
            Milagro Navas Quintanilla, con la asistencia del señor Síndico
            Municipal Licenciado {act.attendees?.sindico?.name || "[Síndico]"} y
            de los concejales propietarios: {generateAttendeesList()} y la
            Secretaria Municipal del Concejo Sra.{" "}
            {act.attendees?.secretaria?.name || "[Secretaria]"}. Seguidamente la
            sesión dio inicio con los siguientes puntos:
          </p>
        </div>
      )}

      {/* ✅ Contenido del acta */}
      {act.bodyContent && act.bodyContent.trim() && (
        <div className="content-section">
          <div
            className="text-justify leading-relaxed prose-acta"
            dangerouslySetInnerHTML={{
              __html: act.bodyContent.replace(
                /<p><strong>Acta número [^<]*<\/strong><\/p>/,
                ""
              ),
            }}
          />
        </div>
      )}

      

      {/* ✅ Mensaje cuando no hay contenido */}
      {(!act.bodyContent || !act.bodyContent.trim()) && 
       (!act.agreements || act.agreements.length === 0) && (
        <div className="content-section text-center text-gray-500 italic">
          <p>El contenido del acta será definido en el editor.</p>
        </div>
      )}
    </div>
  );
};