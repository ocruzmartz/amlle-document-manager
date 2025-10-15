import { type Act } from "@/types";
import { allCouncilMembers } from "@/features/book/data/mock";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

interface ActAttendeesFormProps {
  attendees: Act["attendees"];
  onAttendeesChange: (newAttendees: Act["attendees"]) => void;
}

export const ActAttendeesForm = ({
  attendees,
  onAttendeesChange,
}: ActAttendeesFormProps) => {
  // Memoizar las listas para evitar recálculos
  const councilMembersByRole = useMemo(
    () => ({
      owners: allCouncilMembers.filter((m) => m.role === "OWNER"),
      substitutes: allCouncilMembers.filter((m) => m.role === "SUBSTITUTE"),
      syndics: allCouncilMembers.filter((m) => m.role === "SYNDIC"),
      secretaries: allCouncilMembers.filter((m) => m.role === "SECRETARY"),
    }),
    []
  );

  const {
    owners: defaultOwners,
    substitutes,
    syndics,
    secretaries,
  } = councilMembersByRole;

  // Validar que attendees esté inicializado
  if (!attendees?.owners) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4 text-gray-500">
          Inicializando asistencia...
        </div>
      </div>
    );
  }

  // Función para sustituir un propietario por un suplente
  const handleSubstitute = (ownerIndex: number, substituteId: string) => {
    const substitute = allCouncilMembers.find((s) => s.id === substituteId);
    if (!substitute || !attendees.owners) return;

    const newOwners = [...attendees.owners];
    newOwners[ownerIndex] = substitute;

    onAttendeesChange({
      ...attendees,
      owners: newOwners,
    });
  };

  // Función para revertir a propietario original
  const handleRevert = (ownerIndex: number) => {
    const originalOwner = defaultOwners[ownerIndex];
    if (!originalOwner || !attendees.owners) return;

    const newOwners = [...attendees.owners];
    newOwners[ownerIndex] = originalOwner;

    onAttendeesChange({
      ...attendees,
      owners: newOwners,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Síndico */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Síndico Municipal
          </p>
          <Select
            value={attendees.syndic?.id || ""}
            onValueChange={(sindicoId) => {
              const sindico = allCouncilMembers.find((s) => s.id === sindicoId);
              onAttendeesChange({
                ...attendees,
                syndic: sindico || null,
              });
            }}
          >
            <SelectTrigger className="w-full h-9 shadow-none">
              <SelectValue placeholder="Seleccionar síndico" />
            </SelectTrigger>
            <SelectContent className="shadow-none">
              {syndics.map((syndico) => (
                <SelectItem key={syndico.id} value={syndico.id}>
                  {syndico.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Concejales Propietarios - Layout ultra compacto */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Concejales Propietarios
          </p>
          <div className="grid grid-cols-1 gap-2">
            {defaultOwners.map((ownerDefault, index) => {
              const currentAttendee = attendees.owners?.[index] || ownerDefault;
              const isSubstituted = currentAttendee.role === "SUBSTITUTE";

              return (
                <div
                  key={ownerDefault.id}
                  className="grid grid-cols-[1fr,auto] gap-2 items-center mb-2"
                >
                  {/* Información del concejal */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">
                        Concejal {index + 1}:
                      </span>
                      <span className="text-sm font-semibold truncate">
                        {ownerDefault.name}
                      </span>
                    </div>

                    {/* ✅ Mostrar información de sustitución */}
                    {isSubstituted && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs h-5">
                          Sustituido por {currentAttendee.name}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => handleRevert(index)}
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Revertir
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ✅ Solo mostrar Select si NO está sustituido */}
                  {!isSubstituted && (
                    <Select
                      value={currentAttendee.id}
                      onValueChange={(memberId) => {
                        if (memberId === ownerDefault.id) {
                          handleRevert(index);
                        } else {
                          handleSubstitute(index, memberId);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-9 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="shadow-none">
                        <SelectItem value={ownerDefault.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">
                              {ownerDefault.name}
                            </span>
                            <Badge variant="outline" className="text-xs ml-2">
                              Concejal
                            </Badge>
                          </div>
                        </SelectItem>
                        {substitutes.length > 0 && (
                          <>
                            <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b">
                              Suplentes
                            </div>
                            {substitutes.map((substitute) => (
                              <SelectItem
                                key={substitute.id}
                                value={substitute.id}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="truncate">
                                    {substitute.name}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs ml-2"
                                  >
                                    Suplente
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Secretaria */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3!">
            Secretaria Municipal
          </p>
          <Select
            value={attendees.secretary?.id || ""}
            onValueChange={(secretariaId) => {
              const secretaria = allCouncilMembers.find(
                (s) => s.id === secretariaId
              );
              onAttendeesChange({
                ...attendees,
                secretary: secretaria || null,
              });
            }}
          >
            <SelectTrigger className="w-full h-9 shadow-none">
              {" "}
              {/* Altura reducida */}
              <SelectValue placeholder="Seleccionar secretaria" />
            </SelectTrigger>
            <SelectContent className="shadow-none">
              {secretaries.map((secretary) => (
                <SelectItem key={secretary.id} value={secretary.id}>
                  {secretary.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
