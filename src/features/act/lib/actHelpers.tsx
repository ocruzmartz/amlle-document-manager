import { type Act } from "@/types";
import { numberToWords, parseDateSafely } from "@/lib/textUtils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SessionTypeMapper } from "./actMappers";

export const generateActHeaderHtml = (act: Partial<Act>): string => {
  const sessionType = SessionTypeMapper.toDisplayText(act.sessionType);
  const sessionTime = act.meetingTime || "diez horas";

  const formatDateInWords = (dateString: string | undefined): string => {
    const date = parseDateSafely(dateString);

    if (!date) {
      return "[Fecha inválida]";
    }
    const day = numberToWords(date.getDate());
    const month = format(date, "MMMM", { locale: es });
    const year = numberToWords(date.getFullYear());
    return `${day} de ${month} del año ${year}`;
  };

  const alcaldesa = act.attendees?.owners?.find((m) => m.role === "ALCALDESA");
  const alcaldesaName = alcaldesa?.name || "[Nombre Alcaldesa]";

  const sindicoName = act.attendees?.syndic?.name || "[Nombre Síndico]";
  const secretariaName =
    act.attendees?.secretary?.name || "[Nombre Secretaria]";

  const generateAttendeesList = (): string => {
    const attendees =
      act.attendees?.owners
        ?.filter((m) => m.role !== "ALCALDESA")
        .map((member) => member.name) || [];

    return attendees.length > 0
      ? attendees.join(", ")
      : "[Lista de Concejales]";
  };

  const attendeesList = generateAttendeesList();
  const dateInWords = formatDateInWords(act.meetingDate);
  const actName = act.name || "[Nombre del Acta]";

  return `<p data-act-header="true"><strong>${actName}:</strong> Sesión ${sessionType} celebrada por el Concejo Municipal en el salón de reuniones de la Alcaldía Municipal de Antiguo Cuscatlán, a las ${sessionTime} del día ${dateInWords}, presidió la reunión la señora Alcaldesa Municipal ${alcaldesaName}, con la asistencia del señor Síndico Municipal ${sindicoName} y de los concejales propietarios: ${attendeesList} y la Secretaria Municipal del Concejo Sra. ${secretariaName}. Seguidamente la sesión dio inicio con los siguientes puntos:<br>I-Comprobación del Quórum de Ley para celebrar la Sesión y se declaró abierta.<br>II-Lectura del Acta anterior<br>III-Lectura de la correspondencia Externa<br>IV-Lectura de la correspondencia Interna</p>`;
};
