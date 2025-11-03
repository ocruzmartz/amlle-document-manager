// filepath: src/features/act/components/AttendeeSelectionModal.tsx
import { useState, useEffect } from "react"; // Importar React explícitamente
import { type Act, type CouncilMember } from "@/types";
import { allCouncilMembers } from "@/features/book/data/mock";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Usar Checkbox de Shadcn
import { Label } from "@/components/ui/label"; // Usar Label de Shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Usar Dialog de Shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Usar Select de Shadcn
import { Badge } from "@/components/ui/badge"; // Usar Badge de Shadcn
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Usar ScrollArea de Shadcn


interface AttendeeSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentAttendees: Act["attendees"];
  onAttendeesChange: (newAttendees: Act["attendees"]) => void;
}

export const AttendeeSelectionModal = ({
  isOpen,
  onOpenChange,
  currentAttendees,
  onAttendeesChange,
}: AttendeeSelectionModalProps) => {
  // ✅ Mover la definición de arrays DENTRO del componente pero FUERA del useEffect
  const availableSubstitutes = allCouncilMembers.filter(
    (m) => m.role === "SUBSTITUTE"
  );
  const availableSyndics = allCouncilMembers.filter((m) => m.role === "SYNDIC");
  const availableSecretaries = allCouncilMembers.filter(
    (m) => m.role === "SECRETARY"
  );
  const defaultOwners = allCouncilMembers.filter((m) => m.role === "OWNER");

  const [selectedSyndicId, setSelectedSyndicId] = useState<string | null>(
    currentAttendees?.syndic?.id || null
  );
  const [selectedSecretaryId, setSelectedSecretaryId] = useState<string | null>(
    currentAttendees?.secretary?.id || null
  );
  const [ownerAttendance, setOwnerAttendance] = useState(() => {
    const owners = allCouncilMembers.filter((m) => m.role === "OWNER");
    return owners.map((owner) => {
      const current = currentAttendees?.owners?.find(
        (att) => att.id === owner.id || att.substituteForId === owner.id
      );
      const isSubstituted = current && current.id !== owner.id;
      return {
        ownerId: owner.id,
        attended: !!current,
        substituteId: isSubstituted ? current.id : null,
      };
    });
  });

  // ✅ SOLUCIÓN: Eliminar defaultOwners de las dependencias
  useEffect(() => {
    if (isOpen) {
      setSelectedSyndicId(currentAttendees?.syndic?.id || null);
      setSelectedSecretaryId(currentAttendees?.secretary?.id || null);

      const owners = allCouncilMembers.filter((m) => m.role === "OWNER");
      setOwnerAttendance(
        owners.map((owner) => {
          const current = currentAttendees?.owners?.find(
            (att) => att.id === owner.id || att.substituteForId === owner.id
          );
          const isSubstituted = current && current.id !== owner.id;
          return {
            ownerId: owner.id,
            attended: !!current,
            substituteId: isSubstituted ? current.id : null,
          };
        })
      );
    }
  }, [isOpen, currentAttendees]); // ✅ Solo isOpen y currentAttendees

  const handleOwnerAttendanceChange = (
    ownerId: string,
    checked: boolean | "indeterminate"
  ) => {
    const isAttending = checked === true;
    setOwnerAttendance((prev) =>
      prev.map((item) =>
        item.ownerId === ownerId
          ? {
              ...item,
              attended: isAttending,
              substituteId: isAttending ? item.substituteId : null,
            }
          : item
      )
    );
  };

  const handleSubstituteChange = (ownerId: string, substituteId: string) => {
    setOwnerAttendance((prev) =>
      prev.map(
        (item) =>
          item.ownerId === ownerId
            ? {
                ...item,
                substituteId: substituteId === "none" ? null : substituteId,
                attended: substituteId !== "none",
              }
            : item // Marca como asistido si se selecciona sustituto
      )
    );
  };

  const handleConfirm = () => {
    const finalAttendees: Act["attendees"] = {
      syndic: allCouncilMembers.find((m) => m.id === selectedSyndicId) || null,
      secretary:
        allCouncilMembers.find((m) => m.id === selectedSecretaryId) || null,
      owners: ownerAttendance
        .filter((item) => item.attended)
        .map((item) => {
          if (item.substituteId) {
            const substitute = allCouncilMembers.find(
              (m) => m.id === item.substituteId
            );
            // IMPORTANTE: Almacenar la referencia al original en el sustituto
            return substitute
              ? { ...substitute, substituteForId: item.ownerId }
              : null;
          } else {
            const owner = allCouncilMembers.find((m) => m.id === item.ownerId);
            // Asegurarse de quitar substituteForId si asiste el propietario
            if (owner) delete owner.substituteForId;
            return owner || null;
          }
        })
        .filter((member): member is CouncilMember => member !== null),
    };
    onAttendeesChange(finalAttendees);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Gestionar Asistencia del Concejo
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden overflow-y-auto">
          <ScrollArea className="h-full pr-4 ">
            <div className="space-y-6 py-4 ">
              <div className="flex justify-between">
                {/* Síndico */}
                <div className="flex gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Síndico Municipal
                    </Label>
                    <Select
                      value={selectedSyndicId || "none"}
                      onValueChange={(id) =>
                        setSelectedSyndicId(id === "none" ? null : id)
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="none"
                          className="text-muted-foreground italic"
                        >
                          No asistió
                        </SelectItem>
                        {availableSyndics.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Secretaria */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Secretaria Municipal
                    </Label>
                    <Select
                      value={selectedSecretaryId || "none"}
                      onValueChange={(id) =>
                        setSelectedSecretaryId(id === "none" ? null : id)
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="none"
                          className="text-muted-foreground italic"
                        >
                          No asistió
                        </SelectItem>
                        {availableSecretaries.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Resumen de Asistencia */}

                <div className="h-11 flex items-center justify-between">
                  <span className="text-sm font-medium mr-2">
                    Concejales Presentes:
                  </span>
                  <Badge variant="secondary" className="text-sm font-semibold">
                    {ownerAttendance.filter((a) => a.attended).length}/
                    {defaultOwners.length}
                  </Badge>
                </div>
              </div>

              {/* Separador */}
              <div className="border-t"></div>

              {/* Título de Concejales */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Concejales Propietarios
                </h3>

                

                {/* Grid de Concejales - 2 columnas en pantallas grandes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {defaultOwners.map((owner, index) => {
                    const attendanceInfo = ownerAttendance.find(
                      (item) => item.ownerId === owner.id
                    );
                    const attended = attendanceInfo?.attended ?? false;
                    const substituteId = attendanceInfo?.substituteId ?? null;
                    const hasSubstitute = attended && substituteId;

                    return (
                      <div
                        key={owner.id}
                        className={`p-4 rounded-lg border transition-all ${
                          attended
                            ? "bg-muted/50 border-muted-foreground/20"
                            : "hover:bg-muted/20"
                        }`}
                      >
                        {/* Header del Concejal */}
                        <div className="flex items-start gap-3 mb-3">
                          <Checkbox
                            id={`owner-${owner.id}`}
                            checked={attended}
                            onCheckedChange={(checked) =>
                              handleOwnerAttendanceChange(owner.id, checked)
                            }
                            className="h-5 w-5 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={`owner-${owner.id}`}
                              className="cursor-pointer font-semibold text-base leading-tight block"
                            >
                              {owner.name}
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Concejal #{index + 1}
                              </Badge>
                              {hasSubstitute && (
                                <Badge variant="secondary" className="text-xs">
                                  Sustituido
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Selector de Sustituto */}
                        {attended && (
                          <div className="pl-8 space-y-2">
                            <Label
                              htmlFor={`substitute-${owner.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              ¿Quién asiste?
                            </Label>
                            <Select
                              value={substituteId || "none"}
                              onValueChange={(id) =>
                                handleSubstituteChange(owner.id, id)
                              }
                            >
                              <SelectTrigger
                                id={`substitute-${owner.id}`}
                                className="h-9"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  <span className="font-medium">
                                    {owner.name}
                                  </span>
                                  <span className="text-muted-foreground ml-2">
                                    (Propietario)
                                  </span>
                                </SelectItem>
                                {availableSubstitutes.map((sub) => (
                                  <SelectItem key={sub.id} value={sub.id}>
                                    <span className="font-medium">
                                      {sub.name}
                                    </span>
                                    <span className="text-muted-foreground ml-2">
                                      (Sustituto)
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="lg">
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleConfirm} size="lg" className="px-8">
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
