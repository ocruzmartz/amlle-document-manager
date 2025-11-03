// filepath: src/features/act/components/ActList.tsx
import { useState } from "react";
import { type Act, type ActSessionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  PlusCircle,
  Search,
  CalendarDays,
  FileText,
  Users,
} from "lucide-react"; // ✅ Importar nuevos iconos
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // ✅ Importar Badge

interface ActasListProps {
  acts: Act[];
  onCreateAct: () => void;
  onEditAct: (actId: string) => void;
  onReorderAct: (actId: string, direction: "up" | "down") => void;
  activeActId: string | null;
  isReadOnly?: boolean;
}

// ✅ Helper para obtener texto de tipo de sesión
const getSessionTypeText = (type: ActSessionType | undefined) => {
  switch (type) {
    case "Ordinary":
      return "Ordinaria";
    case "Extraordinary":
      return "Extraordinaria";
    case "Special":
      return "Especial";
    default:
      return "Indefinida";
  }
};

// ✅ Helper para contar asistentes
const getTotalAttendees = (attendees: Act["attendees"]) => {
  if (!attendees) return 0;
  const ownerCount = attendees.owners?.length || 0;
  const syndicCount = attendees.syndic ? 1 : 0;
  const secretaryCount = attendees.secretary ? 1 : 0;
  return ownerCount + syndicCount + secretaryCount;
};

export const ActList = ({
  acts,
  onCreateAct,
  onEditAct,
  onReorderAct,
  activeActId,
  isReadOnly = false,
}: ActasListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar actas según la búsqueda
  const filteredActs = acts.filter((act) =>
    act.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Cabecera (sin cambios) */}
      <div className="shrink-0 p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Gestión de Actas</h3>
          </div>
          <Button onClick={onCreateAct} disabled={isReadOnly}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Nueva Acta
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar actas..."
            className="pl-8 w-full shadow-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Actas (Rediseñada) */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredActs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {acts.length > 0
                ? `No hay actas que coicidan con "${searchQuery}"`
                : "No hay actas disponibles."}
            </p>
            <Button onClick={onCreateAct} variant="outline">
              <PlusCircle className="mr-1 h-4 w-4" />
              Añadir nueva acta
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredActs.map((act, index) => {
              const isActive = act.id === activeActId;
              const sessionTypeText = getSessionTypeText(act.sessionType);
              const totalAttendees = getTotalAttendees(act.attendees);

              return (
                <div
                  key={act.id}
                  className={cn(
                    "border rounded-lg p-4 transition-colors",
                    isActive
                      ? "bg-primary/10 border-primary/40 ring-1 ring-primary/40"
                      : "hover:bg-muted/50"
                  )}
                >
                  {/* --- Fila 1: Título y Acciones --- */}
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{act.name}</h3>
                    </div>
                    {/* Grupo de botones */}
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {/* Botones de reordenación */}
                      <div className="flex flex-col">
                        <Button
                          onClick={() => onReorderAct(act.id, "up")}
                          disabled={index === 0 || isReadOnly}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          title="Mover arriba"
                          
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => onReorderAct(act.id, "down")}
                          disabled={index === filteredActs.length - 1 || isReadOnly}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          title="Mover abajo"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => onEditAct(act.id)}
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                  </div>

                  {/* --- Fila 2: Metadatos --- */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-3 mt-3 border-t">
                    <Badge variant="outline" className="capitalize">
                      {sessionTypeText}
                    </Badge>

                    <div
                      className="flex items-center gap-1.5"
                      title="Fecha de la sesión"
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>
                        {format(
                          new Date(act.sessionDate),
                          "dd 'de' MMM, yyyy",
                          {
                            locale: es,
                          }
                        )}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-1.5"
                      title="Número de acuerdos"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>
                        {act.agreements.length}
                        {act.agreements.length === 1 ? " Acuerdo" : " Acuerdos"}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-1.5"
                      title="Total de asistentes"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {totalAttendees}
                        {totalAttendees === 1 ? " Asistente" : " Asistentes"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
