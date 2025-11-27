import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { councilService } from "../api/councilService";
import type { Propietario, Substituto } from "@/types/council";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  propietario: Propietario;
  onSuccess: () => void;
}

export const AssignSubstituteDialog = ({
  open,
  onOpenChange,
  propietario,
  onSuccess,
}: Props) => {
  const [localPropietario, setLocalPropietario] =
    useState<Propietario>(propietario);
  const [allSubstitutos, setAllSubstitutos] = useState<Substituto[]>([]);
  const [selectedSubId, setSelectedSubId] = useState("");

  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [subToUnassign, setSubToUnassign] = useState<string | null>(null);

  useEffect(() => {
    if (propietario.id !== localPropietario.id) {
      setLocalPropietario(propietario);
    }
  }, [propietario, propietario.id, localPropietario.id]);
  useEffect(() => {
    if (open) {
      councilService
        .getPropietarioById(propietario.id)
        .then(setLocalPropietario);

      const loadSubstitutos = async () => {
        setIsLoadingList(true);
        try {
          const res = await councilService.getSubstitutos();
          setAllSubstitutos(res);
        } catch (error) {
          console.error(error);
          toast.error("No se pudo cargar la lista de suplentes");
        } finally {
          setIsLoadingList(false);
        }
      };
      loadSubstitutos();
    }
  }, [open, propietario.id]);

  const refreshInternalData = async () => {
    try {
      const updated = await councilService.getPropietarioById(
        localPropietario.id
      );
      setLocalPropietario(updated);
      onSuccess();
    } catch (e) {
      console.error("Error refrescando datos locales", e);
    }
  };

  const availableToAssign = allSubstitutos.filter(
    (s) =>
      !localPropietario.substitutos?.some((assigned) => assigned.id === s.id)
  );

  const handleAssign = async () => {
    if (!selectedSubId) return;
    setIsAssigning(true);
    try {
      await councilService.assignSubstituto(localPropietario.id, selectedSubId);
      toast.success("Suplente asignado correctamente");
      setSelectedSubId("");
      await refreshInternalData();
    } catch {
      toast.error("Error al asignar suplente");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirmUnassign = async () => {
    if (!subToUnassign) return;

    setIsAssigning(true);
    try {
      await councilService.removeSubstituto(localPropietario.id, subToUnassign);
      toast.success("Suplente desvinculado correctamente");

      setLocalPropietario((prev) => ({
        ...prev,
        substitutos: prev.substitutos.filter((s) => s.id !== subToUnassign),
      }));
      await refreshInternalData();
    } catch (e) {
      console.error(e);
      toast.error("Error al desvincular suplente");
    } finally {
      setIsAssigning(false);
      setSubToUnassign(null);
    }
  };

  const subNameToDelete = localPropietario.substitutos?.find(
    (s) => s.id === subToUnassign
  )?.name;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Suplentes</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Configurando suplentes para:{" "}
              <span className="font-medium text-foreground">
                {localPropietario.name}
              </span>
            </p>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Suplentes Asignados
              </h4>

              {localPropietario.substitutos?.length === 0 ? (
                <div className="py-6 text-center border border-dashed rounded-md bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    No tiene suplentes asignados actualmente.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
                  {localPropietario.substitutos?.map((sub) => (
                    <div
                      key={sub.id}
                      className="group flex justify-between items-center border p-2.5 px-3 rounded-md bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2 w-2 rounded-full bg-green-500"
                          title="Activo"
                        />
                        <span className="text-sm font-medium">{sub.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSubToUnassign(sub.id)}
                        disabled={isAssigning}
                        title="Desvincular suplente"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Asignar Nuevo Suplente
              </h4>
              <div className="flex gap-2">
                <Select
                  value={selectedSubId}
                  onValueChange={setSelectedSubId}
                  disabled={isLoadingList || isAssigning}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue
                      placeholder={
                        isLoadingList
                          ? "Cargando lista..."
                          : "Seleccionar suplente..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingList ? (
                      <div className="flex items-center justify-center py-4 text-sm text-muted-foreground gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
                      </div>
                    ) : availableToAssign.length === 0 ? (
                      <div className="py-3 px-2 text-sm text-center text-muted-foreground">
                        No hay suplentes disponibles para asignar.
                      </div>
                    ) : (
                      availableToAssign.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleAssign}
                  disabled={!selectedSubId || isAssigning}
                >
                  {isAssigning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!subToUnassign}
        onOpenChange={(open) => !open && setSubToUnassign(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desvincular suplente?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de quitar a{" "}
              <span className="font-medium text-foreground">
                {subNameToDelete}
              </span>{" "}
              de la lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAssigning}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmUnassign();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isAssigning}
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Desvinculando...
                </>
              ) : (
                "Sí, desvincular"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
