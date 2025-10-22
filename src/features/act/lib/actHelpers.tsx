// filepath: src/features/act/lib/act-helpers.ts
import { type Act } from "@/types";
import { numberToWords } from "@/lib/textUtils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Genera el encabezado del acta en formato HTML.
 * Incluye un data-attribute para poder ser identificado y reemplazado fácilmente.
 */
export const generateActHeaderHtml = (act: Partial<Act>): string => {
  const sessionType =
    act.sessionType === "Ordinary"
      ? "ordinaria"
      : act.sessionType === "Extraordinary"
      ? "extraordinaria"
      : "especial";
  const sessionTime = act.sessionTime || "diez horas";

  const formatDateInWords = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "[Fecha inválida]";
    }
    const day = numberToWords(date.getDate());
    const month = format(date, "MMMM", { locale: es });
    const year = numberToWords(date.getFullYear());
    return `${day} de ${month} del año ${year}`;
  };

  const generateAttendeesList = (): string => {
    return (
      act.attendees?.owners?.map((p) => p.name).join(", ") ||
      "[Lista de Asistentes]"
    );
  };

  const sindicoName = act.attendees?.syndic?.name || "[Síndico]";
  const secretariaName = act.attendees?.secretary?.name || "[Secretaria]";
  const attendeesList = generateAttendeesList();
  const dateInWords = formatDateInWords(
    act.sessionDate || new Date().toISOString()
  );

  const actName = act.name || "[Nombre del Acta]";

  // ✅ Simplificado: Se eliminó el párrafo vacío extra para un reemplazo más limpio.
  return `<p data-act-header="true"><strong>${actName}.</strong> Sesión ${sessionType} celebrada por el Concejo Municipal en el salón de reuniones de la Alcaldía Municipal de Antiguo Cuscatlán, a las ${sessionTime} del día ${dateInWords}, presidió la reunión la señora Alcaldesa Municipal Licda. Zoila Milagro Navas Quintanilla, con la asistencia del señor Síndico Municipal Licenciado ${sindicoName} y de los concejales propietarios: ${attendeesList} y la Secretaria Municipal del Concejo Sra. ${secretariaName}. Seguidamente la sesión dio inicio con los siguientes puntos:</p>`;
};
