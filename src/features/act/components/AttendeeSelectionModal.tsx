import { useState, useEffect } from "react";
import { type Act, type CouncilMember, type Propietario } from "@/types";
import { councilService } from "@/features/council/api/councilService";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2, ArrowRight } from "lucide-react";
import {
  sortCouncilMembers,
  getRoleLabel,
} from "@/features/council/utils/roleUtils";

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
  const [allMembers, setAllMembers] = useState<Propietario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [substitutingIds, setSubstitutingIds] = useState<Set<string>>(
    new Set()
  );
  useEffect(() => {
    if (isOpen) {
      const fetchMembers = async () => {
        setIsLoading(true);
        try {
          const membersFromApi = await councilService.getPropietarios();
          const sortedMembers = sortCouncilMembers<Propietario>(membersFromApi);
          setAllMembers(sortedMembers);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMembers();
    }
  }, [isOpen]); 

  useEffect(() => {
    if (isOpen && allMembers.length > 0) {
      const currentList = [
        currentAttendees?.syndic,
        currentAttendees?.secretary,
        ...(currentAttendees?.owners || []),
      ].filter((m): m is CouncilMember => !!m);

      const initialIds = new Set(currentList.map((m) => m.id));
      setSelectedIds(initialIds);

      const initialSubstituting = new Set(
        currentList.filter((m) => !!m.substituteForId).map((m) => m.id)
      );
      setSubstitutingIds(initialSubstituting);
    }
  }, [isOpen, allMembers, currentAttendees]); 

  const handlePresenceToggle = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
      if (substitutingIds.has(id)) {
        const newSubSet = new Set(substitutingIds);
        newSubSet.delete(id);
        setSubstitutingIds(newSubSet);
      }
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSubstitutingToggle = (id: string) => {
    const newSet = new Set(substitutingIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
      if (!selectedIds.has(id)) {
        const newPresenceSet = new Set(selectedIds);
        newPresenceSet.add(id);
        setSelectedIds(newPresenceSet);
      }
    }
    setSubstitutingIds(newSet);
  };

  const handleConfirm = () => {
    let syndic: CouncilMember | null = null;
    let secretary: CouncilMember | null = null;
    const owners: CouncilMember[] = [];

    allMembers.forEach((owner) => {
      // 1. Propietario
      if (selectedIds.has(owner.id)) {
        const memberToSave: CouncilMember = {
          id: owner.id,
          name: owner.name,
          role: owner.type,
        };
        if (owner.type === "SINDICO") syndic = memberToSave;
        else if (owner.type === "SECRETARIA") secretary = memberToSave;
        else owners.push(memberToSave);
      }

      // 2. Suplentes
      owner.substitutos?.forEach((sub) => {
        if (selectedIds.has(sub.id)) {
          const isSubstituting = substitutingIds.has(sub.id);

          const subToSave: CouncilMember = {
            id: sub.id,
            name: sub.name,
            role: sub.type,
            substituteForId: isSubstituting ? owner.id : undefined,
          };

          if (isSubstituting && owner.type === "SINDICO" && !syndic) {
            syndic = subToSave;
          } else if (
            isSubstituting &&
            owner.type === "SECRETARIA" &&
            !secretary
          ) {
            secretary = subToSave;
          } else {
            owners.push(subToSave);
          }
        }
      });
    });

    onAttendeesChange({ syndic, secretary, owners });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Gestionar Asistencia</DialogTitle>
          {!isLoading && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-base font-semibold">
                Asistencia: {selectedIds.size} de{" "}
                {allMembers.reduce(
                  (acc, member) =>
                    acc +
                    1 +
                    (member.substitutos ? member.substitutos.length : 0),
                  0
                )}
              </Badge>
              <Badge
                variant="outline"
                className="text-base font-semibold border-amber-200 text-amber-700"
              >
                {substitutingIds.size} Supliendo
              </Badge>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden overflow-y-auto">
          <ScrollArea className="h-full pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {allMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/10 transition-all flex flex-col gap-3"
                    >
                      {/* Fila del Propietario */}
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`chk-${member.id}`}
                          checked={selectedIds.has(member.id)}
                          onCheckedChange={() =>
                            handlePresenceToggle(member.id)
                          }
                          className="h-5 w-5"
                        />
                        <div className="flex  justify-between items-center w-full min-w-0">
                          <Label
                            htmlFor={`chk-${member.id}`}
                            className="cursor-pointer font-semibold text-base block"
                          >
                            {member.name}
                          </Label>
                          <Badge
                            variant="outline"
                            className="mt-1 text-sm border-blue-200 text-blue-700 bg-blue-50"
                          >
                            {getRoleLabel(member.type)}
                          </Badge>
                        </div>
                      </div>

                      {/* Lista de Suplentes */}
                      {member.substitutos && member.substitutos.length > 0 && (
                        <div className="ml-8 pt-2 border-t border-dashed space-y-2">
                          {member.substitutos.map((sub) => {
                            const isPresent = selectedIds.has(sub.id);
                            return (
                              <div
                                key={sub.id}
                                className="flex flex-col gap-1.5 p-2 rounded-md bg-muted/20"
                              >
                                {/* Fila 1: Asistencia */}
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    id={`chk-${sub.id}`}
                                    checked={isPresent}
                                    onCheckedChange={() =>
                                      handlePresenceToggle(sub.id)
                                    }
                                    className="h-4 w-4"
                                  />
                                  <Label
                                    htmlFor={`chk-${sub.id}`}
                                    className="cursor-pointer text-sm font-medium"
                                  >
                                    {sub.name}
                                  </Label>
                                </div>

                                {/* Fila 2: Opción de Suplir (Solo si asiste) */}
                                {isPresent && (
                                  <div className="ml-7 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        id={`sub-chk-${sub.id}`}
                                        checked={substitutingIds.has(sub.id)}
                                        onCheckedChange={() =>
                                          handleSubstitutingToggle(sub.id)
                                        }
                                        className="h-4 w-4 border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                      />
                                      <Label
                                        htmlFor={`sub-chk-${sub.id}`}
                                        className="cursor-pointer text-sm text-muted-foreground hover:text-amber-700"
                                      >
                                        Suplir Cargo de {member.name}
                                      </Label>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
        <DialogFooter className="gap-2 bg-gray-100 p-4 rounded-b-lg">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleConfirm} className="px-8">
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
