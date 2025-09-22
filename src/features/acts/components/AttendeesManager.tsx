import { type Act } from "@/types";
import { allCouncilMembers } from "@/features/books/lib/dummyData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

interface AttendeesManagerProps {
  attendees: Act["attendees"];
  onAttendeesChange: (newAttendees: Act["attendees"]) => void;
}

export const AttendeesManager = ({
  attendees,
  onAttendeesChange,
}: AttendeesManagerProps) => {
  // Memoizar las listas para evitar recálculos
  const councilMembersByRole = useMemo(
    () => ({
      propietarios: allCouncilMembers.filter((m) => m.role === "PROPIETARIO"),
      suplentes: allCouncilMembers.filter((m) => m.role === "SUPLENTE"),
      sindicos: allCouncilMembers.filter((m) => m.role === "SINDICO"),
      secretarias: allCouncilMembers.filter((m) => m.role === "SECRETARIA"),
    }),
    []
  );

  const {
    propietarios: propietariosDefault,
    suplentes,
    sindicos,
    secretarias,
  } = councilMembersByRole;


  // Validar que attendees esté inicializado
  if (!attendees?.propietarios) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Asistencia del Concejo</h3>
        <div className="text-center py-4 text-gray-500">
          Inicializando asistencia...
        </div>
      </div>
    );
  }

  // Función para sustituir un propietario por un suplente
  const handleSubstitute = (propietarioIndex: number, suplenteId: string) => {
    const suplente = allCouncilMembers.find((s) => s.id === suplenteId);
    if (!suplente || !attendees.propietarios) return;

    const newPropietarios = [...attendees.propietarios];
    newPropietarios[propietarioIndex] = suplente;

    onAttendeesChange({
      ...attendees,
      propietarios: newPropietarios,
    });
  };

  // Función para revertir a propietario original
  const handleRevert = (propietarioIndex: number) => {
    const propietarioOriginal = propietariosDefault[propietarioIndex];
    if (!propietarioOriginal || !attendees.propietarios) return;

    const newPropietarios = [...attendees.propietarios];
    newPropietarios[propietarioIndex] = propietarioOriginal;

    onAttendeesChange({
      ...attendees,
      propietarios: newPropietarios,
    });
  };

  return (
    <div className="space-y-4">
      {" "}
      {/* Espaciado reducido */}
      <h3 className="text-lg font-semibold">Asistencia del Concejo</h3>
      {/* Layout en grid para optimizar espacio */}
      <div className="grid grid-cols-1 gap-4">
        {/* Síndico */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Síndico Municipal
          </p>
          <Select
            value={attendees.sindico?.id || ""}
            onValueChange={(sindicoId) => {
              const sindico = allCouncilMembers.find((s) => s.id === sindicoId);
              onAttendeesChange({
                ...attendees,
                sindico: sindico || null,
              });
            }}
          >
            <SelectTrigger className="w-full h-9">
              {" "}
              {/* Altura reducida */}
              <SelectValue placeholder="Seleccionar síndico" />
            </SelectTrigger>
            <SelectContent>
              {sindicos.map((sindico) => (
                <SelectItem key={sindico.id} value={sindico.id}>
                  {sindico.name}
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
            {propietariosDefault.map((propietarioDefault, index) => {
              const currentAttendee =
                attendees.propietarios?.[index] || propietarioDefault;
              const isSubstituted = currentAttendee.role === "SUPLENTE";

              return (
                <div
                  key={propietarioDefault.id}
                  className="grid grid-cols-[1fr,auto] gap-2 items-center"
                >
                  {/* Información del concejal */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">
                        Concejal {index + 1}:
                      </span>
                      <span className="text-sm font-semibold truncate">
                        {propietarioDefault.name}
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
                        if (memberId === propietarioDefault.id) {
                          handleRevert(index);
                        } else {
                          handleSubstitute(index, memberId);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={propietarioDefault.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">
                              {propietarioDefault.name}
                            </span>
                            <Badge variant="outline" className="text-xs ml-2">
                              Concejal
                            </Badge>
                          </div>
                        </SelectItem>
                        {suplentes.length > 0 && (
                          <>
                            <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b">
                              Suplentes
                            </div>
                            {suplentes.map((suplente) => (
                              <SelectItem key={suplente.id} value={suplente.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="truncate">
                                    {suplente.name}
                                  </span>
                                  <Badge variant="secondary" className="text-xs ml-2">
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Secretaria Municipal
          </label>
          <Select
            value={attendees.secretaria?.id || ""}
            onValueChange={(secretariaId) => {
              const secretaria = allCouncilMembers.find(
                (s) => s.id === secretariaId
              );
              onAttendeesChange({
                ...attendees,
                secretaria: secretaria || null,
              });
            }}
          >
            <SelectTrigger className="w-full h-9">
              {" "}
              {/* Altura reducida */}
              <SelectValue placeholder="Seleccionar secretaria" />
            </SelectTrigger>
            <SelectContent>
              {secretarias.map((secretaria) => (
                <SelectItem key={secretaria.id} value={secretaria.id}>
                  {secretaria.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
