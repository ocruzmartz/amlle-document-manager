import { useState, useEffect } from "react";
import { type Act, type CouncilMember } from "@/types";
import { participantsService } from "../api/participantsService";
import { Button } from "@/components/ui/button";
import { AttendeeSelectionModal } from "./AttendeeSelectionModal";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Loader2 } from "lucide-react";
import { OFFICIAL_SYNDIC, OFFICIAL_SECRETARY } from "../lib/officials";

interface ActAttendeesFormProps {
  attendees: Act["attendees"];
  onAttendeesChange: (newAttendees: Act["attendees"]) => void;
}

export const ActAttendeesForm = ({
  attendees,
  onAttendeesChange,
}: ActAttendeesFormProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propietariosList, setPropietariosList] = useState<CouncilMember[]>([]);
  const [isLoadingPropietarios, setIsLoadingPropietarios] = useState(true);

  useEffect(() => {
    // (Usando función flecha)
    const loadPropietarios = async () => {
      try {
        const data = await participantsService.getPropietarios();
        setPropietariosList(data);
      } catch (error) {
        console.error(
          "Error cargando lista de propietarios en ActAttendeesForm:",
          error
        );
      } finally {
        setIsLoadingPropietarios(false);
      }
    };
    loadPropietarios();
  }, []);

  const totalOwners = propietariosList.length;
  const presentOwnerCount = attendees?.owners?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header con botón */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Asistencia</h3>
          <p className="text-sm text-muted-foreground">
            {presentOwnerCount} de {totalOwners} concejales presentes
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          className="shadow-none"
        >
          Gestionar
        </Button>
      </div>

      {/* Autoridades */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Autoridades
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Síndico Municipal
            </span>
            <span className="text-sm font-medium">{OFFICIAL_SYNDIC.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Secretaria Municipal
            </span>
            <span className="text-sm font-medium">
              {OFFICIAL_SECRETARY.name}
            </span>
            {/* Muestra un badge de asistencia basado en el 'attendees' del getActById */}
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t"></div>

      {/* Concejales */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Concejales Propietarios ({presentOwnerCount} presentes)
        </h4>

        {/* ✅ Mostrar Carga */}
        {isLoadingPropietarios ? (
          <div className="flex items-center gap-2 p-3 rounded-md bg-muted/30">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm italic text-muted-foreground">
              Cargando datos del concejo...
            </span>
          </div>
        ) : presentOwnerCount > 0 ? (
          <div className="space-y-2">
            {attendees?.owners?.map((owner) => {
              const isSubstitute = !!owner.substituteForId;
              const originalOwner = isSubstitute
                ? propietariosList.find(
                    (o: CouncilMember) => o.id === owner.substituteForId
                  )
                : null;

              return (
                <div
                  key={owner.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                >
                  <UserCheck className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm flex-1">{owner.name}</span>
                  {isSubstitute && originalOwner && (
                    <Badge variant="outline" className="text-xs">
                      Sustituye a{" "}
                      {/* Usar el nombre del Propietario original cargado */}
                      {originalOwner.name.split(" ").slice(0, 2).join(" ")}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-md bg-muted/30 text-muted-foreground">
            <UserX className="h-4 w-4" />
            <span className="text-sm italic">
              No se han registrado concejales presentes
            </span>
          </div>
        )}
      </div>

      <AttendeeSelectionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        currentAttendees={attendees}
        onAttendeesChange={onAttendeesChange}
      />
    </div>
  );
};
