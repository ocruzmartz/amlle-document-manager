// src/features/books/components/CoverPagePreview.tsx
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { numeroALetras, capitalize } from "@/lib/textUtils";

interface CoverPagePreviewProps {
  bookName: string; // ✅ Agregar esta prop
  creationDate?: Date;
  tome?: number;
}

export const CoverPagePreview = ({ creationDate }: CoverPagePreviewProps) => {
  const yearInWords = creationDate
    ? capitalize(numeroALetras(creationDate.getFullYear()))
    : "[Año]";
  const dayInWords = creationDate
    ? numeroALetras(creationDate.getDate())
    : "[Día]";
  const monthName = creationDate
    ? format(creationDate, "MMMM", { locale: es })
    : "[Mes]";

  return (
    <div>
      <div className="text-justify p-12 bg-white shadow-lg aspect-[210/297] w-full max-w-xl mx-auto border text-black flex flex-col text-sm">
        <p className="font-bold mb-8">La Suscrita Alcaldesa Municipal</p>
        <p className="leading-relaxed">
          Autoriza el presente Libro para que el Concejo Municipal de Antiguo
          Cuscatlán, Departamento de La Libertad, asiente las Actas y Acuerdos
          Municipales, de las Sesiones que celebre durante el año{" "}
          <span className="font-bold">{yearInWords}</span> numeradas
          correlativamente.
        </p>

        <p className="mt-12">
          Alcaldía Municipal de Antiguo Cuscatlán, a los{" "}
          <span className="font-bold">
            {dayInWords} días del mes de {monthName}
          </span>{" "}
          de <span className="font-bold">{yearInWords}</span>.
        </p>
        <div className="flex-1" />
        <div className="grid grid-cols-2 gap-8 items-end text-center">
          <div>
            <p className="font-bold">Licda. Zoila Milagro Navas Quintanilla</p>
            <p className="border-t border-black mt-1 pt-1">
              Alcaldesa Municipal
            </p>
          </div>
          <div>
            <p className="font-bold">Ante Mí,</p>
            <div className="h-12" />
            <p className="border-t border-black mt-1 pt-1">
              Secretaria Municipal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
