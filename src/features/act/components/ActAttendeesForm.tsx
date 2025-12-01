import { useState, useEffect } from "react";
import { type Act, type Propietario, type CouncilMember } from "@/types";
import { councilService } from "@/features/council/api/councilService";
import { Button } from "@/components/ui/button";
import { AttendeeSelectionModal } from "./AttendeeSelectionModal";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Loader2 } from "lucide-react";
import {
  sortCouncilMembers,
  getRoleLabel,
} from "@/features/council/utils/roleUtils";

interface ActAttendeesFormProps {
  attendees: Act["attendees"];
  onAttendeesChange: (newAttendees: Act["attendees"]) => void;
}

export const ActAttendeesForm = ({
  attendees,
  onAttendeesChange,
}: ActAttendeesFormProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allMembers, setAllMembers] = useState<Propietario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await councilService.getPropietarios();
        const sorted = sortCouncilMembers(data);
        setAllMembers(sorted);
      } catch (error) {
        console.error("Error cargando miembros", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // Helper para buscar el registro de una persona en los asistentes
  const getAttendeeRecord = (personId: string): CouncilMember | undefined => {
    const allAttendees = [
      attendees?.syndic,
      attendees?.secretary,
      ...(attendees?.owners || []),
    ].filter(Boolean) as CouncilMember[];

    return allAttendees.find((att) => att.id === personId);
  };

  const presentCount = [
    attendees?.syndic,
    attendees?.secretary,
    ...(attendees?.owners || []),
  ].filter(Boolean).length;

  const PersonRow = ({
    id,
    name,
    role,
    isMain = true,
  }: {
    id: string;
    name: string;
    role: string;
    isMain?: boolean;
  }) => {
    const record = getAttendeeRecord(id);
    const present = !!record;
    // Solo está supliendo si tiene la propiedad substituteForId definida
    const isSubstituting = present && !!record?.substituteForId;

    return (
      <div
        className={`flex items-center justify-between p-2 w-full rounded-md border transition-colors ${
          present
            ? "bg-green-50/50 border-green-200"
            : "bg-muted/20 border-transparent opacity-80"
        } ${!isMain ? "ml-6 w-[calc(100%-1.5rem)] mt-1" : "mt-2"}`}
      >
        <div className="flex items-center gap-3 w-full">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
              present
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            {present ? (
              <UserCheck className="h-3.5 w-3.5" />
            ) : (
              <UserX className="h-3.5 w-3.5" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  present ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {name}
              </span>

              {present ? (
                <Badge
                  variant="outline"
                  className=" h-5 px-1.5 bg-white text-green-700 border-green-200"
                >
                  Asistió
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className=" h-5 px-1.5 text-muted-foreground border-transparent bg-gray-100"
                >
                  No asistió
                </Badge>
              )}

              {/* Badge de Supliendo: Solo si isSubstituting es true */}
              {isSubstituting && (
                <Badge className=" h-5 px-1.5 bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 border">
                  Supliendo
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
              {role}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Asistencia</h3>
          <p className="text-sm text-muted-foreground">
            {presentCount} presentes totales
          </p>
        </div>
        <Button
          variant="default"
          onClick={() => setIsModalOpen(true)}
          className="shadow-none"
          disabled={isLoading}
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Gestionar Asistencia
        </Button>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Detalle por Cargo
        </h4>

        {isLoading ? (
          <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">
              Cargando lista...
            </span>
          </div>
        ) : allMembers.length > 0 ? (
          <div className="flex flex-col ">
            {allMembers.map((owner) => (
              <div key={owner.id} className="group">
                <PersonRow
                  id={owner.id}
                  name={owner.name}
                  role={getRoleLabel(owner.type)}
                />

                {owner.substitutos && owner.substitutos.length > 0 && (
                  <div className="border-l-2 border-muted ml-3 pl-0 space-y-1">
                    {owner.substitutos.map((sub) => (
                      <PersonRow
                        key={sub.id}
                        id={sub.id}
                        name={sub.name}
                        role={getRoleLabel(sub.type)}
                        isMain={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            No hay miembros configurados.
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
