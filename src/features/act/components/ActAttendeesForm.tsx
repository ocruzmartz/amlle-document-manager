// filepath: src/features/act/components/ActAttendeesForm.tsx
import React, { useState } from "react";
import { type Act, type CouncilMember } from "@/types";
import { Button } from "@/components/ui/button";
import { AttendeeSelectionModal } from "./AttendeeSelectionModal";
import { Badge } from "@/components/ui/badge";
import { allCouncilMembers } from "@/features/book/data/mock";
import { UserCheck, UserX } from "lucide-react";

interface ActAttendeesFormProps {
  attendees: Act["attendees"];
  onAttendeesChange: (newAttendees: Act["attendees"]) => void;
}

const getMemberName = (
  member: CouncilMember | null | undefined
): React.ReactNode => {
  return (
    member?.name || (
      <span className="text-muted-foreground italic">No asistió</span>
    )
  );
};

export const ActAttendeesForm = ({
  attendees,
  onAttendeesChange,
}: ActAttendeesFormProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const presentOwnerCount = attendees?.owners?.length ?? 0;
  const totalOwners = allCouncilMembers.filter((m) => m.role === "OWNER").length;

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
            <span className="text-xs text-muted-foreground">Síndico Municipal</span>
            <span className="text-sm font-medium">
              {getMemberName(attendees?.syndic)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Secretaria Municipal</span>
            <span className="text-sm font-medium">
              {getMemberName(attendees?.secretary)}
            </span>
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
        {presentOwnerCount > 0 ? (
          <div className="space-y-2">
            {attendees?.owners?.map((owner) => {
              const isSubstitute = !!owner.substituteForId;
              const originalOwner = isSubstitute
                ? allCouncilMembers.find(
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
            <span className="text-sm italic">No se han registrado concejales presentes  </span>
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
