import { type Act } from "@/types";
import { numberToWords } from "@/lib/textUtils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SessionTypeMapper } from "./actMappers"; // ✅ Importar mapper

export const generateActHeaderHtml = (act: Partial<Act>): string => {
  const sessionType = SessionTypeMapper.toDisplayText(act.sessionType); // ✅ Usar mapper
  const sessionTime = act.meetingTime || "diez horas"; // ✅ Usar meetingTime

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
    const attendees = act.attendees?.owners?.map((member) => member.name) || [];
    return attendees.length > 0
      ? attendees.join(", ")
      : "[Lista de Asistentes]";
  };

  const sindicoName = act.attendees?.syndic?.name || "[Síndico]";
  const secretariaName = act.attendees?.secretary?.name || "[Secretaria]";
  const attendeesList = generateAttendeesList();
  const dateInWords = formatDateInWords(
    act.meetingDate || new Date().toISOString()
  );

  const actName = act.name || "[Nombre del Acta]";

  return `<p data-act-header="true"><strong>${actName}:</strong> Sesión ${sessionType} celebrada por el Concejo Municipal en el salón de reuniones de la Alcaldía Municipal de Antiguo Cuscatlán, a las ${sessionTime} del día ${dateInWords}, presidió la reunión la señora Alcaldesa Municipal Licda. Zoila Milagro Navas Quintanilla, con la asistencia del señor Síndico Municipal Licenciado ${sindicoName} y de los concejales propietarios: ${attendeesList} y la Secretaria Municipal del Concejo Sra. ${secretariaName}. Seguidamente la sesión dio inicio con los siguientes puntos:<br>I-Comprobación del Quórum de Ley para celebrar la Sesión y se declaró abierta.<br>II-Lectura del Acta anterior<br>III-Lectura de la correspondencia Externa<br>IV-Lectura de la correspondencia Interna</p>`;
};
